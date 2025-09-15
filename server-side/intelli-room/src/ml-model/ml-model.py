import os
import io
import base64
import tempfile
import numpy as np
import torch
import requests
import uuid
from pathlib import Path
from PIL import Image
from transformers import CLIPVisionModel
from torchvision import transforms
from ultralytics import YOLO
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel, UniPCMultistepScheduler
from torch import nn

ROOT_DIR = Path(__file__).resolve().parent 
GENERATED_IMAGES_DIR = ROOT_DIR.parent.parent / "uploads" / "generatedrooms"
UPLOADS_DIR = ROOT_DIR.parent.parent / "uploads"

YOLO_MODEL_PATH = ROOT_DIR / "yolov8n.pt"
AESTHETIC_MODEL_PATH = ROOT_DIR / "aesthetic_classifier_head.pt"
CONTROLNET_MODEL_PATH = "lllyasviel/sd-controlnet-canny"
STABLE_DIFFUSION_MODEL_PATH = "runwayml/stable-diffusion-v1-5" 

yolo_model = None
aesthetic_model_head = None
aesthetic_model_body = None
generator_pipeline = None
processor = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

class ImageRequest(BaseModel):
    url: str

@app.on_event("startup")
async def load_models():
    global yolo_model, aesthetic_model_head, aesthetic_model_body, generator_pipeline, processor
    
    os.makedirs(GENERATED_IMAGES_DIR, exist_ok=True)
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    
    print("Loading YOLOv8 object detection model...")
    if not os.path.exists(YOLO_MODEL_PATH):
        print(f"YOLO model not found at {YOLO_MODEL_PATH}. Downloading...")
        yolo_model = YOLO(str(YOLO_MODEL_PATH))
    else:
        yolo_model = YOLO(str(YOLO_MODEL_PATH))
    
    print("Loading CLIP vision model and aesthetic classifier head...")
    aesthetic_model_head = nn.Linear(768, 2)
    aesthetic_model_head.load_state_dict(torch.load(AESTHETIC_MODEL_PATH))
    
    aesthetic_model_body = CLIPVisionModel.from_pretrained("openai/clip-vit-base-patch32")
    aesthetic_model_head.eval()
    aesthetic_model_body.eval()
    
    processor = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    print("Loading Stable Diffusion and ControlNet models...")
    controlnet = ControlNetModel.from_pretrained(CONTROLNET_MODEL_PATH)
    
    generator_pipeline = StableDiffusionControlNetPipeline.from_pretrained(
        STABLE_DIFFUSION_MODEL_PATH, 
        controlnet=controlnet, 
        safety_checker=None,
        torch_dtype=torch.float16 
    )
    generator_pipeline.scheduler = UniPCMultistepScheduler.from_config(generator_pipeline.scheduler.config)
    
    yolo_model.to(device)
    aesthetic_model_head.to(device)
    aesthetic_model_body.to(device)
    generator_pipeline.to(device)

def get_full_analysis(image):
    """
    Performs both overall and per-object aesthetic analysis using the loaded models.
    """
    device = next(aesthetic_model_body.parameters()).device
    
    overall_inputs = processor(image).unsqueeze(0).to(device)
    with torch.no_grad():
        overall_features = aesthetic_model_body(overall_inputs).pooler_output
        overall_outputs = aesthetic_model_head(overall_features)
        _, overall_pred_idx = torch.max(overall_outputs, 1)

    overall_classification = "Good" if overall_pred_idx.item() == 0 else "Bad"

    yolo_results = yolo_model.predict(source=image, save=False)
    
    per_object_report = []
    actionable_report = [] 

    for result in yolo_results:
        for box in result.boxes:
            class_id = int(box.cls)
            object_name = yolo_model.names[class_id]
            
            x1, y1, x2, y2 = [int(coord) for coord in box.xyxy[0]]
            cropped_image = image.crop((x1, y1, x2, y2))
            
            if min(cropped_image.size) > 0:
                cropped_inputs = processor(cropped_image).unsqueeze(0).to(device)
                
                with torch.no_grad():
                    cropped_features = aesthetic_model_body(cropped_inputs).pooler_output
                    cropped_outputs = aesthetic_model_head(cropped_features)
                    _, cropped_pred_idx = torch.max(cropped_outputs, 1)
                
                object_classification = "Good" if cropped_pred_idx.item() == 0 else "Bad"
                
                per_object_report.append({
                    "object": object_name,
                    "classification": object_classification,
                })
                
                if object_classification == "Bad":
                    actionable_report.append(f"Consider tidying or improving the '{object_name}'.")

    return {
        "overallClassification": overall_classification,
        "individualObjectAnalysis": per_object_report,
        "actionableReport": actionable_report
    }

# --- Part 5: The API Endpoint ---
@app.post("/analyze")
async def analyze_room(request: ImageRequest):
    try:
        response = requests.get(request.url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Could not download image from URL: {e}")

    try:
        image = Image.open(io.BytesIO(response.content)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not process image from URL: {e}")

    analysis = get_full_analysis(image)
    
    generated_image_url = None
    
    if analysis["overallClassification"] == "Bad":
        print("--- DEBUG: Generating new image with updated logic ---")
        
        image_np = np.array(image)
        low_threshold = 100
        high_threshold = 200
        edges = cv2.Canny(image_np, low_threshold, high_threshold)
        
        edges_pil = Image.fromarray(edges).convert("RGB")
        

        prompt = "a clean, well-lit, aesthetically pleasing room"
        if analysis["actionableReport"]:
            prompt = f"a clean, tidy, beautiful room, fixing the following issues: {', '.join(analysis['actionableReport'])}"
        
        output_image = generator_pipeline(
            prompt,
            image=edges_pil,
            num_inference_steps=20,
            eta=0.0,
        ).images[0]

        filename = f"generated_room_{uuid.uuid4().hex}.jpeg"
        output_image_path = GENERATED_IMAGES_DIR / filename
        output_image.save(output_image_path, "JPEG")
        generated_image_url = f"/uploads/generatedrooms/{filename}"

    return {
        "analysis": analysis,
        "generatedImage": generated_image_url,
    }
import os
import io
import tempfile
import torch
import numpy as np
import uuid
import cv2
from pathlib import Path
from PIL import Image
from transformers import CLIPVisionModel, CLIPProcessor
from ultralytics import YOLO
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any
from torch import nn
from dotenv import load_dotenv
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel, UniPCMultistepScheduler

# --- Configuration and Environment Setup ---
load_dotenv()
ROOT_DIR = Path(__file__).resolve().parent
GENERATED_IMAGES_DIR = ROOT_DIR / "uploads" / "generatedrooms"
os.makedirs(GENERATED_IMAGES_DIR, exist_ok=True)

# --- Define a single FastAPI app ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Global variables for models ---
clip_model = None
processor = None
aesthetic_model_head = None
yolo_model = None
generator_pipeline = None
device = 'cpu'  # You can change this to 'cuda' if you have a GPU

# --- Unified Startup Event Handler ---
@app.on_event("startup")
async def startup_event():
    """
    Loads all required machine learning models for both analysis and generation.
    """
    global clip_model, processor, aesthetic_model_head, yolo_model, generator_pipeline
    
    # --- Model Loading for Analysis ---
    print("Loading the pre-trained CLIP model...")
    clip_model = CLIPVisionModel.from_pretrained("openai/clip-vit-base-patch16").to(device)
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch16")

    print("Loading the custom aesthetic classifier head...")
    aesthetic_model_head = nn.Linear(768, 2)
    aesthetic_model_head.load_state_dict(torch.load('aesthetic_classifier_head.pt', map_location=torch.device(device)))
    aesthetic_model_head.eval()

    print("Loading the YOLOv8 object detection model...")
    yolo_model = YOLO('yolov8n.pt')

    # --- Model Loading for Image Generation ---
    print("Loading Stable Diffusion and ControlNet models...")
    controlnet = ControlNetModel.from_pretrained("lllyasviel/sd-controlnet-canny")
    
    generator_pipeline = StableDiffusionControlNetPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        controlnet=controlnet,
        safety_checker=None
    )
    generator_pipeline.scheduler = UniPCMultistepScheduler.from_config(generator_pipeline.scheduler.config)
    generator_pipeline.to(device)
    print("All models loaded successfully!")

# --- Analysis Function (remains the same) ---
def get_full_analysis(image_path: str) -> Dict:
    """
    Performs both overall and per-object aesthetic analysis using the loaded models.
    """
    try:
        full_image = Image.open(image_path).convert("RGB")
    except FileNotFoundError:
        return {"error": f"Oops! I can't find the picture at: {image_path}"}
    
    overall_inputs = processor(images=full_image, return_tensors="pt").to(device)
    with torch.no_grad():
        overall_features = clip_model(**overall_inputs).pooler_output
        overall_outputs = aesthetic_model_head(overall_features)
        _, overall_pred_idx = torch.max(overall_outputs, 1)
        overall_classification = "Good Room" if overall_pred_idx.item() == 0 else "Bad Room"

    yolo_results = yolo_model(image_path)
    per_object_report: List[Dict[str, str]] = []
    actionable_report: List[str] = []

    for result in yolo_results:
        for box in result.boxes:
            class_id = int(box.cls)
            object_name = yolo_model.names[class_id]
            
            x1, y1, x2, y2 = [int(coord) for coord in box.xyxy[0]]
            cropped_image = full_image.crop((x1, y1, x2, y2))
            
            if min(cropped_image.size) > 0:
                cropped_inputs = processor(images=cropped_image, return_tensors="pt").to(device)
                
                with torch.no_grad():
                    cropped_features = clip_model(**cropped_inputs).pooler_output
                    cropped_outputs = aesthetic_model_head(cropped_features)
                    _, cropped_pred_idx = torch.max(cropped_outputs, 1)
                    object_classification = "Good" if cropped_pred_idx.item() == 0 else "Bad"
                
                per_object_report.append({
                    "object": object_name,
                    "classification": object_classification,
                })
                
                if object_classification == "Bad":
                    actionable_report.append(f"Consider tidying or improving the '{object_name}'.")

    if not actionable_report:
        actionable_report.append("Your room looks great! For minor improvements, consider adding a few plants or adjusting the lighting.")

    return {
        "overallClassification": overall_classification,
        "individualObjectAnalysis": per_object_report,
        "actionableReport": actionable_report
    }

# --- Internal Task Function for Image Generation ---
def generate_image_task(file_path: str, actionable_report: List[str], output_filename: str):
    """
    Performs the heavy image generation work as a background task.
    This function is called by the /analyze endpoint.
    """
    try:
        image = Image.open(file_path).convert("RGB")
        
        prompt = "a clean, well-lit, aesthetically pleasing room"
        if actionable_report:
            prompt = f"a clean, tidy, beautiful room, fixing the following issues: {', '.join(actionable_report)}"
        
        print("--- DEBUG: Starting image generation for the prompt ---")
        
        image_np = np.array(image)
        low_threshold = 100
        high_threshold = 200
        edges = cv2.Canny(image_np, low_threshold, high_threshold)
        edges_pil = Image.fromarray(edges).convert("RGB")
        
        output_image = generator_pipeline(
            prompt,
            image=edges_pil,
            num_inference_steps=5,
            eta=0.0,
        ).images[0]

        output_image_path = GENERATED_IMAGES_DIR / output_filename
        output_image.save(output_image_path, "JPEG")
        
        print(f"Image generated and saved to: {output_image_path}")

    except Exception as e:
        print(f"Error during image generation in background: {e}")
    finally:
        # Clean up the temporary file regardless of success or failure
        if os.path.exists(file_path):
            os.remove(file_path)

# --- The unified API Endpoint ---
@app.post("/analyze")
async def analyze_room(background_tasks: BackgroundTasks, request: Request, file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    temp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpeg") as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name

        analysis_result = get_full_analysis(temp_file_path)
        
        # Generate a unique filename here
        output_filename = f"generated_room_{uuid.uuid4().hex}.jpeg"
        
        # Construct the full URL for the client
        image_url = f"{request.url.scheme}://{request.url.netloc}/generated-images/{output_filename}"

        # Schedule the image generation as a background task
        background_tasks.add_task(
            generate_image_task,
            file_path=temp_file_path,
            actionable_report=analysis_result["actionableReport"],
            output_filename=output_filename
        )
        
        # Return the analysis immediately with the full URL
        return JSONResponse(content={
            "analysis": analysis_result,
            "message": "Analysis complete. Image generation is processing in the background.",
            "generated_image_url": image_url
        })
    
    except Exception as e:
        print(f"An error occurred: {e}")
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail="Internal server error")

# --- New endpoint for polling ---
@app.get("/generated-images/{image_filename}")
async def get_generated_image(image_filename: str):
    """
    Allows a client to check for and download a generated image.
    """
    image_path = GENERATED_IMAGES_DIR / image_filename
    
    # Check if the file exists
    if not image_path.is_file():
        # If not, raise an HTTPException so the client knows it's still processing
        raise HTTPException(status_code=404, detail="Image not found or still processing.")
    
    # If the file exists, return it using FileResponse
    return FileResponse(image_path)
import os
import io
import tempfile
import torch
import requests
from PIL import Image
from transformers import CLIPVisionModel, CLIPProcessor
from ultralytics import YOLO
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any
from torch import nn
from dotenv import load_dotenv

load_dotenv()

# --- Model Loading (for analysis only) ---
print("Loading the pre-trained CLIP model...")
# The Hugging Face libraries will now automatically use the token from your .env
clip_model = CLIPVisionModel.from_pretrained("openai/clip-vit-base-patch16").to('cpu')
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch16")

print("Loading the custom aesthetic classifier head...")
aesthetic_model_head = nn.Linear(768, 2)
aesthetic_model_head.load_state_dict(torch.load('aesthetic_classifier_head.pt', map_location=torch.device('cpu')))
aesthetic_model_head.eval()

print("Loading the YOLOv8 object detection model...")
yolo_model = YOLO('yolov8n.pt')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Analysis Function ---
def get_full_analysis(image_path: str) -> Dict:
    """
    Performs both overall and per-object aesthetic analysis using the loaded models.
    """
    try:
        full_image = Image.open(image_path).convert("RGB")
    except FileNotFoundError:
        return {"error": f"Oops! I can't find the picture at: {image_path}"}
    
    overall_inputs = processor(images=full_image, return_tensors="pt").to('cpu')
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
                cropped_inputs = processor(images=cropped_image, return_tensors="pt").to('cpu')
                
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

    # This is the new logic to always return an actionableReport
    if not actionable_report:
        actionable_report.append("Your room looks great! For minor improvements, consider adding a few plants or adjusting the lighting.")

    return {
        "overallClassification": overall_classification,
        "individualObjectAnalysis": per_object_report,
        "actionableReport": actionable_report
    }

# --- New Helper Function for Background Task ---
def trigger_generation(file_path: str, actionable_report: List[str]):
    try:
        prompt = "a clean, well-lit, aesthetically pleasing room"
        if actionable_report:
            prompt = f"a clean, tidy, beautiful room, fixing the following issues: {', '.join(actionable_report)}"
        
        with open(file_path, "rb") as image_file:
            files = {'file': (os.path.basename(file_path), image_file, 'image/jpeg')}
            data = {'prompt': prompt}
            
            response = requests.post(
                "http://192.168.1.110:5001/generate_image", 
                files=files,
                data=data
            )
            response.raise_for_status()
            
            print("Image generation task triggered successfully.")
    except Exception as e:
        print(f"Error during image generation request in background: {e}")
    finally:
        os.remove(file_path)

# --- API Endpoint (with BackgroundTasks) ---
@app.post("/analyze")
async def analyze_room(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

    temp_file_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpeg") as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name

        analysis_result = get_full_analysis(temp_file_path)
        
        if analysis_result["actionableReport"]:
            print("--- Analysis complete, adding generation task to background ---")
            
            background_tasks.add_task(
                trigger_generation, 
                file_path=temp_file_path, 
                actionable_report=analysis_result["actionableReport"]
            )
            
            return JSONResponse(content={
                "analysis": analysis_result,
                "generatedImage": None
            })
        
        # If no actionable report, we still return the analysis and delete the file
        os.remove(temp_file_path)

        return JSONResponse(content={
            "analysis": analysis_result,
            "generatedImage": None
        })
    
    except Exception as e:
        print(f"An error occurred: {e}")
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail="Internal server error")
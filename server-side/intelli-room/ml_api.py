# ml_api.py
import torch
import torch.nn as nn
from torchvision import models, transforms
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
from ultralytics import YOLO
import tempfile
import os
from typing import Dict

app = FastAPI()

# --- Load Models ---
print("Loading the pre-trained CLIP model...")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to('cpu')
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
model_body = clip_model.vision_model

print("Loading the custom aesthetic classifier head...")
model_head_weights = torch.load('aesthetic_classifier_head.pt', map_location=torch.device('cpu'))

# FIX: Create a linear layer with 2 output features to match the model weights
model_head = nn.Linear(512, 2)

model_head.weight = nn.Parameter(model_head_weights['weight'])
model_head.bias = nn.Parameter(model_head_weights['bias'])
model_head.eval()

print("Loading the YOLOv8 object detection model...")
yolo_model = YOLO('yolov8n.pt')

# --- Analysis Function ---
def get_full_analysis(image_path: str) -> Dict:
    try:
        full_image = Image.open(image_path).convert("RGB")
    except FileNotFoundError:
        return {"error": f"Oops! I can't find the picture at: {image_path}"}
    
    overall_inputs = processor(images=full_image, return_tensors="pt").to('cpu')
    with torch.no_grad():
        overall_features = model_body(**overall_inputs).pooler_output
        overall_outputs = model_head(overall_features)
        # FIX: Use torch.argmax to get the class with the highest probability
        _, overall_pred_idx = torch.max(overall_outputs, 1)
        overall_classification = "Good Room" if overall_pred_idx.item() == 0 else "Bad Room"

    yolo_results = yolo_model(image_path)
    per_object_report = []
    
    actionable_report = []

    for result in yolo_results:
        for box in result.boxes:
            class_id = int(box.cls)
            object_name = yolo_model.names[class_id]
            x1, y1, x2, y2 = [int(coord) for coord in box.xyxy[0]]
            cropped_image = full_image.crop((x1, y1, x2, y2))
            
            if min(cropped_image.size) > 0:
                cropped_inputs = processor(images=cropped_image, return_tensors="pt").to('cpu')
                with torch.no_grad():
                    cropped_features = model_body(**cropped_inputs).pooler_output
                    cropped_outputs = model_head(cropped_features)
                    # FIX: Use torch.argmax to get the class with the highest probability
                    _, cropped_pred_idx = torch.max(cropped_outputs, 1)
                    object_classification = "Good" if cropped_pred_idx.item() == 0 else "Bad"
                
                if object_classification == "Bad":
                    actionable_report.append(f"The {object_name} needs some tidying.")

                per_object_report.append({
                    "object": object_name,
                    "classification": object_classification,
                })

    return {
        "overallClassification": overall_classification,
        "individualObjectAnalysis": per_object_report,
        "actionableReport": actionable_report
    }

# --- API Endpoint ---
@app.post("/analyze")
async def analyze_room(file: UploadFile = File(...)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload an image."
        )

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpeg") as temp_file:
            temp_file.write(await file.read())
            temp_file_path = temp_file.name

        analysis_result = get_full_analysis(temp_file_path)

        os.remove(temp_file_path)

        if "error" in analysis_result:
            raise HTTPException(status_code=500, detail=analysis_result["error"])
        
        return JSONResponse(content=analysis_result)

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
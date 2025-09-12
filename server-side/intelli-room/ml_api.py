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
class AestheticClassifier(nn.Module):
    def __init__(self, output_dim=1):
        super(AestheticClassifier, self).__init__()
        self.conv1d = nn.Conv1d(512, 128, kernel_size=1)
        self.relu = nn.ReLU()
        self.pool = nn.AdaptiveAvgPool1d(1)
        self.flatten = nn.Flatten()
        self.fc1 = nn.Linear(128, 64)
        self.fc2 = nn.Linear(64, output_dim)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = x.unsqueeze(2)
        x = self.conv1d(x)
        x = self.relu(x)
        x = self.pool(x)
        x = self.flatten(x)
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        x = self.sigmoid(x)
        return x

print("Loading the custom aesthetic classifier...")
# FIX: Corrected the filename from aesthetic_classifier.pth to aesthetic_classifier_head.pt
aesthetic_classifier = AestheticClassifier()
aesthetic_classifier.load_state_dict(torch.load('aesthetic_classifier_head.pt'))
aesthetic_classifier.eval()

print("Loading the pre-trained CLIP model...")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
model_body = clip_model.vision_model
model_head = aesthetic_classifier

print("Loading the YOLOv8 object detection model...")
yolo_model = YOLO('yolov8n.pt')

# --- Analysis Function ---
def get_full_analysis(image_path: str) -> Dict:
    try:
        full_image = Image.open(image_path).convert("RGB")
    except FileNotFoundError:
        return {"error": f"Oops! I can't find the picture at: {image_path}"}
    
    # Overall Room Aesthetic Analysis
    overall_inputs = processor(full_image).unsqueeze(0)
    with torch.no_grad():
        overall_features = model_body(overall_inputs).pooler_output
        overall_outputs = model_head(overall_features)
        _, overall_pred_idx = torch.max(overall_outputs, 1)
    overall_classification = "Good Room" if overall_pred_idx.item() == 0 else "Bad Room"

    # Individual Object Analysis with YOLO and CLIP
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
                cropped_inputs = processor(cropped_image).unsqueeze(0)
                with torch.no_grad():
                    cropped_features = model_body(cropped_inputs).pooler_output
                    cropped_outputs = model_head(cropped_features)
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
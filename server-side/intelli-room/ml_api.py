import os
import shutil
from typing import Dict
from fastapi import FastAPI, UploadFile, File, HTTPException
import torch
from torch import nn
from PIL import Image
from transformers import CLIPVisionModel
from torchvision import transforms
from ultralytics import YOLO

print("Loading the custom aesthetic classifier...")
model_head = nn.Linear(768, 2)
model_head.load_state_dict(torch.load("aesthetic_classifier_head.pt"))

print("Loading the pre-trained CLIP model...")
model_body = CLIPVisionModel.from_pretrained("openai/clip-vit-base-patch32")
model_body.eval()
model_head.eval()

print("Loading the YOLOv8 object detection model...")
yolo_model = YOLO('yolov8n.pt')

processor = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def get_full_analysis(image_path: str) -> Dict:
    try:
        full_image = Image.open(image_path).convert("RGB")
    except FileNotFoundError:
        return {"error": f"Oops! I can't find the picture at: {image_path}"}
    
    overall_inputs = processor(full_image).unsqueeze(0)
    with torch.no_grad():
        overall_features = model_body(overall_inputs).pooler_output
        overall_outputs = model_head(overall_features)
        _, overall_pred_idx = torch.max(overall_outputs, 1)
    overall_classification = "Good Room" if overall_pred_idx.item() == 0 else "Bad Room"

    yolo_results = yolo_model(image_path)
    per_object_report = []

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
                per_object_report.append({
                    "object": object_name,
                    "classification": object_classification,
                })

    return {
        "overallClassification": overall_classification,
        "individualObjectAnalysis": per_object_report
    }

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "ML API is running."}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No image file provided.")

    temp_dir = "./temp"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, file.filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        analysis = get_full_analysis(temp_path)
        
        os.remove(temp_path)
        
        return analysis
    
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"An error occurred during analysis: {e}")
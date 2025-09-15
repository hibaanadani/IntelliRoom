import torch
import torch.nn as nn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
from ultralytics import YOLO
import tempfile
import os
from typing import Dict, List, Any

app = FastAPI()

# --- Load Models ---
print("Loading the pre-trained CLIP model...")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to('cpu')
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
model_body = clip_model.vision_model

print("Loading the custom aesthetic classifier head...")
model_head_weights = torch.load('aesthetic_classifier_head.pt', map_location=torch.device('cpu'))

model_head = nn.Linear(512, 2)
model_head.weight = nn.Parameter(model_head_weights['weight'])
model_head.bias = nn.Parameter(model_head_weights['bias'])
model_head.eval()

print("Loading the YOLOv8 object detection model...")
yolo_model = YOLO('yolov8n.pt')

# --- Analysis Function ---
def get_full_analysis(image_path: str) -> Dict:
    """
    Performs both overall and per-object aesthetic analysis using the loaded models,
    with an improved actionable report.
    """
    try:
        full_image = Image.open(image_path).convert("RGB")
    except FileNotFoundError:
        return {"error": f"Oops! I can't find the picture at: {image_path}"}
    
    # --- Overall Room Analysis ---
    overall_inputs = processor(images=full_image, return_tensors="pt").to('cpu')
    with torch.no_grad():
        overall_features = model_body(**overall_inputs).pooler_output
        overall_outputs = model_head(overall_features)
        _, overall_pred_idx = torch.max(overall_outputs, 1)
        overall_classification = "Good Room" if overall_pred_idx.item() == 0 else "Bad Room"

    # --- Per-Object Analysis (using YOLOv8 and aesthetic classifier) ---
    yolo_results = yolo_model(image_path)
    per_object_report: List[Dict[str, str]] = []
    
    # Count how many of each object type are classified as "Bad"
    bad_object_counts: Dict[str, int] = {}
    
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
                    _, cropped_pred_idx = torch.max(cropped_outputs, 1)
                    object_classification = "Good" if cropped_pred_idx.item() == 0 else "Bad"
                
                per_object_report.append({
                    "object": object_name,
                    "classification": object_classification,
                })
                
                if object_classification == "Bad":
                    bad_object_counts[object_name] = bad_object_counts.get(object_name, 0) + 1

    # --- Final Actionable Report Logic ---
    actionable_report: List[str] = []

    if overall_classification == "Good Room":
        if not bad_object_counts:
            actionable_report.append("Your room is beautiful! No actionable changes are needed based on the analysis.")
        else:
            actionable_report.append("Your room is classified as 'Good', but the following objects could be improved:")
            for obj, count in bad_object_counts.items():
                s = "" if count == 1 else "s"
                actionable_report.append(f"Consider tidying or improving the {count} '{obj}' object{s}.")
                
    elif overall_classification == "Bad Room":
        if bad_object_counts:
            actionable_report.append("The overall room is classified as 'Bad'. Focus on improving these areas:")
            for obj, count in bad_object_counts.items():
                s = "" if count == 1 else "s"
                actionable_report.append(f"Consider tidying or improving the {count} '{obj}' object{s}.")
        else:
            actionable_report.append("The overall room is classified as 'Bad', but no individual objects were a clear cause.")
            actionable_report.append("This is likely due to the overall composition, lighting, or unidentifiable clutter.")
            actionable_report.append("Consider changing the color scheme, adjusting the lighting, or rearranging the space.")
            
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

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Room Analyzer API. Use the /analyze endpoint to upload an image."}
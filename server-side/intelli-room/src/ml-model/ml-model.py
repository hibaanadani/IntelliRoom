import os
import torch
from torch import nn
from PIL import Image
from transformers import CLIPVisionModel
from torchvision import transforms
from ultralytics import YOLO
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import tempfile

# --- Part 1: Load the Models ---

print("Loading the custom aesthetic classifier...")
model_head = nn.Linear(768, 2)
model_head.load_state_dict(torch.load("aesthetic_classifier_head.pt"))

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

# --- Part 2: The Combined Analysis Function ---

def get_full_analysis(image_path):
    """
    This function performs both overall and per-object aesthetic analysis.
    """
    try:
        full_image = Image.open(image_path).convert("RGB")
    except FileNotFoundError:
        return {"error": f"Oops! I can't find the picture at: {image_path}"}
    
    overall_inputs = processor(full_image).unsqueeze(0)
    with torch.no_grad():
        overall_features = model_body(overall_inputs).pooler_output
        overall_outputs = model_head(overall_features)
        _, overall_pred_idx = torch.max(overall_outputs, 1)

    overall_classification = "Good" if overall_pred_idx.item() == 0 else "Bad"

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
                
                per_object_report.append({
                    "object": object_name,
                    "classification": object_classification,
                })
                
                if object_classification == "Bad":
                    actionable_report.append(f"Consider tidying or improving the '{object_name}'.")

    # Finalize actionable report based on overall classification
    if overall_classification == 'Bad':
        if not actionable_report:
            actionable_report.append("The overall room is classified as 'Bad', likely due to composition, lighting, or unidentifiable clutter. Consider a major rearrangement.")
    else:
        if not actionable_report:
            actionable_report.append("The room has a cohesive aesthetic with no obvious bad objects. Great job!")

    return {
        "overallClassification": overall_classification,
        "individualObjectAnalysis": per_object_report,
        "actionableReport": actionable_report
    }

# --- Part 3: Running the App! ---

app = Flask(__name__)

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        with tempfile.NamedTemporaryFile(delete=False, suffix=secure_filename(file.filename)) as tmp_file:
            file.save(tmp_file.name)
            image_path = tmp_file.name
        
        try:
            analysis = get_full_analysis(image_path)
            return jsonify(analysis), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            os.unlink(image_path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
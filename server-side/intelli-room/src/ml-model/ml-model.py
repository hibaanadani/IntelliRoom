import os
import torch
import numpy as np
import io
import tempfile
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from torchvision import transforms
from transformers import CLIPVisionModel
from torch import nn
from ultralytics import YOLO

# --- Part 1: Initializing Models and Parameters ---

# We only need one instance of these models.
aesthetic_classifier_head = None
yolo_model = None
clip_vision_model = None

# We need to find the root directory of the project to load the models.
# This code will find the directory of this script, then go up one level.
# This makes it compatible with your folder structure.
def find_root_path():
    """Finds the project root directory."""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Assumes the script is at 'src/ml-model/ml-model.py'
    # so we need to go up two levels to get to the root.
    return os.path.dirname(os.path.dirname(current_dir))

ROOT_DIR = find_root_path()
YOLO_MODEL_PATH = os.path.join(ROOT_DIR, "yolov8n.pt")
AESTHETIC_MODEL_PATH = os.path.join(ROOT_DIR, "aesthetic_classifier_head.pt")


# A simple in-memory catalogue for suggestions
item_catalogue = [
    {"object": "chair", "aesthetic": "Good", "suggestion": "Try a comfortable armchair to create a cozy reading nook.", "color": "deep blue"},
    {"object": "couch", "aesthetic": "Good", "suggestion": "Consider a large sectional sofa to anchor the living space.", "color": "dark gray"},
    {"object": "bed", "aesthetic": "Good", "suggestion": "A canopy bed can add a touch of elegance and luxury.", "color": "white"},
    {"object": "lamp", "aesthetic": "Good", "suggestion": "Install a modern floor lamp for both style and light.", "color": "black"},
    {"object": "table", "aesthetic": "Good", "suggestion": "A minimalist coffee table will keep the room feeling open.", "color": "light wood"},
    {"object": "chair", "aesthetic": "Bad", "suggestion": "Consider replacing this worn-out chair with a modern, sleek design.", "color": "brown"},
    {"object": "couch", "aesthetic": "Bad", "suggestion": "It seems your current couch is a negative focal point. Consider replacing it with a 'Plush Velvet Sofa' in a 'deep blue' color to improve the room's aesthetic."},
]

app = FastAPI()

# --- Part 2: Utility Functions ---

def get_dominant_color(image_path):
    """
    Finds the most dominant color in an image.
    (This function is kept for potential future use, but its output is not used in the final JSON now).
    """
    image = Image.open(image_path)
    image = image.convert("RGB")
    image_np = np.array(image)
    pixels = image_np.reshape(-1, 3)
    unique_colors, counts = np.unique(pixels, axis=0, return_counts=True)
    dominant_color_rgb = unique_colors[np.argmax(counts)]
    
    # A simplified logic to return a named color
    # You can expand this with more colors and better logic
    if np.all(dominant_color_rgb > 200):
        return "white"
    elif np.all(dominant_color_rgb < 50):
        return "black"
    elif dominant_color_rgb[0] > 150 and dominant_color_rgb[1] > 150 and dominant_color_rgb[2] < 100:
        return "yellow"
    else:
        return "other"

def generate_suggestions(overall_classification, object_analysis, dominant_color):
    """
    Generates actionable advice based on the ML analysis.
    """
    report = []
    
    # Get a count of "bad" items
    bad_items = [item for item in object_analysis if item['classification'] == 'Bad']
    
    # Logic for when the overall room is bad
    if overall_classification == 'Bad':
        if bad_items:
            # If there are bad items, we generate a report based on them
            for item in bad_items:
                # You can add more specific suggestions here
                report.append(f"Consider improving the '{item['object']}' to enhance the room's aesthetic.")
        else:
            # If the room is bad but no individual objects are, suggest a general change
            report.append("The overall room is classified as 'Bad', but no individual objects were classified as 'Bad'.")
            report.append("This is likely due to the overall composition, lighting, or clutter that the model could not identify by object name.")
            report.append("Consider changing the color scheme, adjusting the lighting, or rearranging the space.")
    else: # If the overall room is good
        if bad_items:
            # If the room is good but has some bad items, suggest changing them.
            report.append("The room is generally good, but there are some objects that could be improved.")
            for item in bad_items:
                report.append(f"Consider improving the '{item['object']}' to make the room excellent.")
        else:
            # The room is good and has no bad objects.
            report.append("The room has a cohesive aesthetic with no obvious bad objects. Great job!")

    # Add the dominant color suggestion if needed
    if dominant_color:
        report.append(f"The overall room has a dominant '{dominant_color}' color scheme. Adding a contrasting element, like a small accent piece in a complementary color, could enhance the room's appeal.")

    return report

# --- Part 3: FastAPI Startup Event ---

@app.on_event("startup")
def load_models():
    """
    This function runs once when the API server starts to load the models.
    """
    global aesthetic_classifier_head, yolo_model, clip_vision_model
    
    # Load YOLOv8 model using the corrected path
    print("Loading YOLOv8 object detection model...")
    yolo_model = YOLO(YOLO_MODEL_PATH)
    
    # Load CLIP vision model
    print("Loading CLIP vision model for aesthetic analysis...")
    clip_vision_model = CLIPVisionModel.from_pretrained("openai/clip-vit-base-patch32")

    # Load custom aesthetic classifier head using the corrected path
    print("Loading custom aesthetic classifier head...")
    aesthetic_classifier_head = nn.Linear(clip_vision_model.config.hidden_size, 2)
    state_dict = torch.load(AESTHETIC_MODEL_PATH)
    aesthetic_classifier_head.load_state_dict(state_dict)
    aesthetic_classifier_head.eval()

# --- Part 4: API Endpoint for Room Analysis ---

@app.post("/analyze")
async def analyze_room(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Only images are allowed.")

    try:
        # Read the image data
        image_data = await file.read()
        image_stream = io.BytesIO(image_data)
        pil_image = Image.open(image_stream).convert("RGB")
        
        # Save the image to a temporary file in a location that is accessible by YOLO
        temp_dir = tempfile.gettempdir()
        temp_image_path = os.path.join(temp_dir, "uploaded_image.jpg")
        pil_image.save(temp_image_path)

        # --- Step 1: Overall Aesthetic Classification ---
        image_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        input_image = image_transform(pil_image).unsqueeze(0)
        
        with torch.no_grad():
            image_features = clip_vision_model(input_image).pooler_output
            aesthetic_scores = aesthetic_classifier_head(image_features)
        
        _, predicted_class = torch.max(aesthetic_scores, 1)
        overall_classification = "Good" if predicted_class.item() == 0 else "Bad"

        # --- Step 2: Object Detection and Individual Analysis ---
        results = yolo_model(temp_image_path)
        
        individual_object_analysis = []
        for r in results:
            for box in r.boxes:
                # Get class and confidence
                class_id = r.names[box.cls[0].item()]
                confidence = box.conf[0].item()

                # Get bounding box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()

                # --- NEW: Get a new classification for each object ---
                # Crop the object from the image
                cropped_object_pil = pil_image.crop((x1, y1, x2, y2))
                input_object = image_transform(cropped_object_pil).unsqueeze(0)

                with torch.no_grad():
                    object_features = clip_vision_model(input_object).pooler_output
                    object_scores = aesthetic_classifier_head(object_features)
                
                _, object_predicted_class = torch.max(object_scores, 1)
                object_classification = "Good" if object_predicted_class.item() == 0 else "Bad"
                
                # We will only add the fields that your DTO requires
                individual_object_analysis.append({
                    "object": class_id,
                    "classification": object_classification,
                    # We are intentionally not adding the `box` coordinates here.
                })

        # --- Step 3: Get Dominant Color (Not used in final output, but the function is still here) ---
        dominant_color = get_dominant_color(temp_image_path)

        # --- Step 4: Generate Actionable Report ---
        actionable_report = generate_suggestions(overall_classification, individual_object_analysis, dominant_color)

        # --- Final Step: Build the Response ---
        # The keys here are adjusted to match your DTO's `camelCase` naming conventions
        response_data = {
            "overallClassification": overall_classification,
            # We are intentionally not adding the "dominant_room_color" field here
            "individualObjectAnalysis": individual_object_analysis,
            "actionableReport": actionable_report,
        }
        
        # Clean up the temporary image file
        os.remove(temp_image_path)

        return JSONResponse(content=response_data)

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
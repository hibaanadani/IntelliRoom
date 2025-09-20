# Add these imports at the very top of your ml_api.py file

import os
import io
import tempfile
import torch
import numpy as np
import uuid
import cv2
from pathlib import Path
from PIL import Image, ImageEnhance
from transformers import CLIPVisionModel, CLIPProcessor, BlipProcessor, BlipForConditionalGeneration, GPT2LMHeadModel, GPT2Tokenizer, T5ForConditionalGeneration, T5Tokenizer
from ultralytics import YOLO
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, BackgroundTasks, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Any, Tuple  # THIS IS THE MISSING IMPORT
from torch import nn
import random
from dotenv import load_dotenv
from diffusers import (
    StableDiffusionControlNetPipeline, 
    ControlNetModel, 
    DPMSolverMultistepScheduler,
    StableDiffusionXLControlNetPipeline,
    ControlNetModel as XLControlNetModel
)

# Room improvement suggestions dictionary
ROOM_IMPROVEMENT_SUGGESTIONS = {
    'bedroom': [
        'Add soft, warm lighting with bedside lamps',
        'Include plants like snake plants or pothos for better air quality',
        'Add textured throw pillows and a cozy blanket',
        'Consider blackout curtains for better sleep',
        'Add a reading chair or small seating area',
        'Include personal artwork or photographs',
        'Add a full-length mirror to make the space feel larger',
        'Consider a decorative area rug'
    ],
    'living_room': [
        'Add layered lighting with floor and table lamps',
        'Include a coffee table with decorative books or plants',
        'Add throw blankets and accent pillows for comfort',
        'Consider a gallery wall with framed artwork',
        'Add plants of varying heights for visual interest',
        'Include storage solutions like stylish baskets',
        'Add a statement piece like a large plant or sculpture',
        'Consider window treatments for privacy and style'
    ],
    'kitchen': [
        'Add under-cabinet lighting for better task lighting',
        'Include fresh herbs in small pots on the windowsill',
        'Add decorative bowls with fresh fruit',
        'Consider bar stools if there\'s counter space',
        'Add open shelving with attractive dishware',
        'Include a small rug for comfort while cooking',
        'Add pendant lights over an island or peninsula',
        'Consider decorative backsplash tiles'
    ],
    'bathroom': [
        'Add plants that thrive in humidity like ferns or orchids',
        'Include soft, absorbent bath mats',
        'Add ambient lighting with wall sconces',
        'Consider decorative storage baskets',
        'Include fluffy towels in coordinating colors',
        'Add a shower caddy or organizers',
        'Consider a decorative mirror with interesting frame',
        'Add candles for a spa-like atmosphere'
    ],
    'office': [
        'Add task lighting with an adjustable desk lamp',
        'Include plants like succulents or a small fiddle leaf fig',
        'Add ergonomic accessories like a wrist rest',
        'Consider inspirational artwork or motivational quotes',
        'Add organizational tools like stylish file holders',
        'Include a comfortable chair with good support',
        'Add a small area rug to define the workspace',
        'Consider a bookshelf with both books and decorative items'
    ],
    'general': [
        'Improve natural lighting by cleaning windows and using light-colored curtains',
        'Add mirrors to reflect light and make the space feel larger',
        'Include plants to add life and improve air quality',
        'Add personal touches like family photos or meaningful artwork',
        'Consider the color palette - add complementary accent colors',
        'Improve organization with stylish storage solutions',
        'Add texture with throw pillows, blankets, or area rugs',
        'Include proper lighting for different activities and moods'
    ]
}

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
blip_processor = None
blip_model = None
suggestion_model = None
suggestion_tokenizer = None
device = 'cpu'  # CPU-only setup for laptops without NVIDIA GPU

def detect_room_type(objects: List[str], image_description: str = "") -> str:
    """Detect room type based on objects and image description"""
    object_set = set(obj.lower() for obj in objects)
    
    # Room type indicators
    bedroom_indicators = {'bed', 'pillow', 'blanket', 'nightstand', 'dresser'}
    kitchen_indicators = {'oven', 'refrigerator', 'sink', 'microwave', 'stove', 'cabinet'}
    living_room_indicators = {'couch', 'sofa', 'tv', 'television', 'coffee table', 'armchair'}
    bathroom_indicators = {'toilet', 'bathtub', 'shower', 'sink', 'mirror', 'towel'}
    office_indicators = {'desk', 'chair', 'computer', 'laptop', 'monitor', 'keyboard'}
    
    # Calculate scores
    scores = {
        'bedroom': len(object_set & bedroom_indicators),
        'kitchen': len(object_set & kitchen_indicators),
        'living_room': len(object_set & living_room_indicators),
        'bathroom': len(object_set & bathroom_indicators),
        'office': len(object_set & office_indicators)
    }
    
    # Check description for additional context
    description_lower = image_description.lower()
    if 'bedroom' in description_lower or 'bed' in description_lower:
        scores['bedroom'] += 2
    elif 'kitchen' in description_lower:
        scores['kitchen'] += 2
    elif 'living room' in description_lower or 'living' in description_lower:
        scores['living_room'] += 2
    elif 'bathroom' in description_lower or 'bath' in description_lower:
        scores['bathroom'] += 2
    elif 'office' in description_lower or 'workspace' in description_lower:
        scores['office'] += 2
    
    # Return room type with highest score, or general if unclear
    max_score = max(scores.values())
    if max_score >= 2:
        return max(scores, key=scores.get)
    return 'general'

def generate_ai_suggestions(objects: List[str], room_type: str, overall_classification: str, image_description: str = "") -> List[str]:
    """Generate AI-powered suggestions using language model"""
    try:
        # Create a detailed prompt for the AI model
        objects_str = ", ".join(objects) if objects else "various items"
        
        prompt = f"""As an interior design expert, analyze this {room_type} and provide 4-5 specific, actionable improvement suggestions.
        
Room Details:
- Room Type: {room_type}
- Overall Quality: {overall_classification}
- Detected Objects: {objects_str}
- Room Description: {image_description}

Provide specific, practical suggestions that would improve the aesthetics, functionality, and comfort of this space. Focus on realistic improvements that most people can implement. Each suggestion should be one clear sentence.

Suggestions:
1."""

        # Tokenize with proper attention mask handling
        inputs = suggestion_tokenizer(
            prompt, 
            return_tensors="pt", 
            max_length=512, 
            truncation=True,
            padding=True,  # Enable padding
            return_attention_mask=True  # Explicitly return attention mask
        )
        
        # Move to device
        input_ids = inputs['input_ids'].to(device)
        attention_mask = inputs['attention_mask'].to(device)
        
        with torch.no_grad():
            outputs = suggestion_model.generate(
                input_ids=input_ids,
                attention_mask=attention_mask,  # Pass attention mask
                max_length=input_ids.shape[1] + 200,
                num_return_sequences=1,
                temperature=0.7,
                do_sample=True,
                pad_token_id=suggestion_tokenizer.pad_token_id,  # Use pad_token_id instead of eos_token_id
                no_repeat_ngram_size=3,
                early_stopping=True  # Add early stopping for better results
            )
        
        # Decode the generated text
        generated_text = suggestion_tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract suggestions from the generated text
        suggestions_part = generated_text.split("Suggestions:")[1] if "Suggestions:" in generated_text else generated_text
        
        # Parse individual suggestions
        suggestions = []
        lines = suggestions_part.strip().split('\n')
        for line in lines:
            line = line.strip()
            # Remove numbering and clean up
            if line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
                # Remove numbering pattern
                clean_line = line
                for pattern in ['1. ', '2. ', '3. ', '4. ', '5. ', '- ', '• ']:
                    clean_line = clean_line.replace(pattern, '', 1)
                clean_line = clean_line.strip()
                if clean_line and len(clean_line) > 10:  # Filter out very short suggestions
                    suggestions.append(clean_line)
        
        # Fallback to ensure we always have suggestions
        if len(suggestions) < 3:
            fallback_suggestions = generate_contextual_fallback_suggestions(objects, room_type, overall_classification)
            suggestions.extend(fallback_suggestions)
        
        return suggestions[:5]  # Return max 5 suggestions
        
    except Exception as e:
        print(f"Error generating AI suggestions: {e}")
        # Fallback to contextual suggestions
        return generate_contextual_fallback_suggestions(objects, room_type, overall_classification)

def generate_contextual_fallback_suggestions(objects: List[str], room_type: str, overall_classification: str) -> List[str]:
    """Generate contextual fallback suggestions when AI model fails"""
    suggestions = []
    object_set = set(obj.lower() for obj in objects)
    
    # Room-specific base suggestions
    if room_type == 'bedroom':
        suggestions.extend(['Add warm bedside lighting for a cozy atmosphere', 'Include plants to improve air quality and aesthetics'])
    elif room_type == 'living_room':
        suggestions.extend(['Create layered lighting with floor and table lamps', 'Add throw pillows and blankets for comfort'])
    elif room_type == 'kitchen':
        suggestions.extend(['Improve task lighting for better functionality', 'Add fresh herbs or plants for a lively touch'])
    elif room_type == 'bathroom':
        suggestions.extend(['Include plants that thrive in humid environments', 'Add soft textures with quality towels and mats'])
    elif room_type == 'office':
        suggestions.extend(['Ensure adequate task lighting for productivity', 'Add personal touches like artwork or plants'])
    else:
        suggestions.extend(['Improve lighting to enhance the space', 'Add plants to bring life to the room'])
    
    # Object-specific suggestions
    if len(object_set & {'plant', 'potted plant'}) == 0:
        suggestions.append('Introduce greenery with low-maintenance plants')
    
    if 'mirror' not in object_set:
        suggestions.append('Add mirrors to reflect light and create the illusion of more space')
    
    if overall_classification == "Bad Room":
        suggestions.append('Declutter and organize surfaces for a cleaner appearance')
    else:
        suggestions.append('Consider adding personal touches that reflect your style')
    
    return suggestions[:5]

def enhance_canny_edges(image: Image.Image) -> Image.Image:
    """Create better Canny edge detection for ControlNet"""
    # Convert to numpy array
    image_np = np.array(image)
    
    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(image_np, (3, 3), 0)
    
    # Use adaptive thresholding for better edge detection
    gray = cv2.cvtColor(blurred, cv2.COLOR_RGB2GRAY)
    
    # Calculate dynamic thresholds based on image statistics
    v = np.median(gray)
    lower_threshold = int(max(0, (1.0 - 0.33) * v))
    upper_threshold = int(min(255, (1.0 + 0.33) * v))
    
    # Apply Canny edge detection
    edges = cv2.Canny(gray, lower_threshold, upper_threshold)
    
    # Dilate edges slightly to make them more prominent
    kernel = np.ones((2,2), np.uint8)
    edges = cv2.dilate(edges, kernel, iterations=1)
    
    # Convert back to PIL Image
    edges_pil = Image.fromarray(edges).convert("RGB")
    return edges_pil

def create_enhanced_prompt(actionable_report: List[str], room_type: str, image_description: str = "") -> str:
    """Create a prompt that adjusts and improves the existing room rather than creating a new one"""
    
    # Base prompt that preserves the original room structure
    base_prompt = f"Same {room_type} with the exact same layout and furniture arrangement"
    
    # Extract specific improvements from actionable report
    improvements = []
    
    for suggestion in actionable_report[:4]:  # Use first 4 suggestions
        suggestion_lower = suggestion.lower()
        
        if 'lighting' in suggestion_lower:
            improvements.append('improved lighting')
        elif 'plant' in suggestion_lower or 'greenery' in suggestion_lower:
            improvements.append('some indoor plants added')
        elif 'pillow' in suggestion_lower or 'comfort' in suggestion_lower or 'textile' in suggestion_lower:
            improvements.append('comfortable textiles and soft furnishings')
        elif 'color' in suggestion_lower or 'paint' in suggestion_lower:
            improvements.append('enhanced color palette')
        elif 'organization' in suggestion_lower or 'storage' in suggestion_lower or 'declutter' in suggestion_lower:
            improvements.append('better organization and tidiness')
        elif 'mirror' in suggestion_lower:
            improvements.append('strategic mirror placement')
        elif 'artwork' in suggestion_lower or 'art' in suggestion_lower:
            improvements.append('tasteful artwork')
        elif 'rug' in suggestion_lower or 'carpet' in suggestion_lower:
            improvements.append('area rug')
        elif 'curtain' in suggestion_lower or 'window' in suggestion_lower:
            improvements.append('improved window treatments')
        else:
            # Generic improvement for unclear suggestions
            improvements.append('subtle aesthetic enhancements')
    
    # Remove duplicates while preserving order
    seen = set()
    unique_improvements = []
    for item in improvements:
        if item not in seen:
            seen.add(item)
            unique_improvements.append(item)
    
    # Construct the adjustment-focused prompt
    if unique_improvements:
        improvements_text = ', '.join(unique_improvements[:3])  # Max 3 improvements
        full_prompt = f"{base_prompt}, {improvements_text}, maintaining original architecture and main furniture pieces, subtle improvements only"
    else:
        full_prompt = f"{base_prompt}, enhanced lighting and organization, maintaining original architecture and main furniture pieces"
    
    return full_prompt

# --- Unified Startup Event Handler ---
@app.on_event("startup")
async def startup_event():
    """
    Loads all required machine learning models for both analysis and generation.
    """
    global clip_model, processor, aesthetic_model_head, yolo_model, generator_pipeline, blip_processor, blip_model, suggestion_model, suggestion_tokenizer
    
    print("Loading the pre-trained CLIP model...")
    clip_model = CLIPVisionModel.from_pretrained("openai/clip-vit-base-patch16").to(device)
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch16")

    print("Loading the custom aesthetic classifier head...")
    aesthetic_model_head = nn.Linear(768, 2)
    aesthetic_model_head.load_state_dict(torch.load('aesthetic_classifier_head.pt', map_location=torch.device(device)))
    aesthetic_model_head.eval()

    print("Loading the YOLOv8 object detection model...")
    yolo_model = YOLO('yolov8n.pt')

    print("Loading BLIP model for image captioning...")
    blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
    blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(device)

    print("Loading T5 model for AI-powered suggestions...")
    suggestion_tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base")
    suggestion_model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base").to(device)
    
    # Fix the tokenizer configuration to avoid attention mask warnings
    if suggestion_tokenizer.pad_token is None:
        suggestion_tokenizer.pad_token = suggestion_tokenizer.eos_token
    
    # Ensure pad_token_id is properly set
    if suggestion_tokenizer.pad_token_id is None:
        suggestion_tokenizer.pad_token_id = suggestion_tokenizer.eos_token_id

    print("Loading Enhanced Stable Diffusion and ControlNet models for CPU...")
    controlnet = ControlNetModel.from_pretrained(
        "lllyasviel/sd-controlnet-canny",
        torch_dtype=torch.float32  # Use float32 for CPU
    )
    
    generator_pipeline = StableDiffusionControlNetPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        controlnet=controlnet,
        torch_dtype=torch.float32,  # Use float32 for CPU
        safety_checker=None
    )
    
    # Use better scheduler for higher quality
    generator_pipeline.scheduler = DPMSolverMultistepScheduler.from_config(generator_pipeline.scheduler.config)
    generator_pipeline.to(device)
    
    # CPU-specific optimizations
    print("Applying CPU optimizations...")
    generator_pipeline.enable_attention_slicing()  # Reduces memory usage on CPU
    
    print("All models loaded successfully!")

def get_image_description(image: Image.Image) -> str:
    """Generate a description of the image using BLIP"""
    try:
        inputs = blip_processor(image, return_tensors="pt").to(device)
        with torch.no_grad():
            out = blip_model.generate(**inputs, max_length=50)
        description = blip_processor.decode(out[0], skip_special_tokens=True)
        return description
    except Exception as e:
        print(f"Error generating image description: {e}")
        return ""

# --- Enhanced Analysis Function ---
def get_full_analysis(image_path: str) -> Dict:
    """
    Performs enhanced aesthetic analysis with dynamic suggestions.
    """
    try:
        full_image = Image.open(image_path).convert("RGB")
    except FileNotFoundError:
        return {"error": f"Oops! I can't find the picture at: {image_path}"}
    
    # Get image description
    image_description = get_image_description(full_image)
    print(f"Image description: {image_description}")
    
    # Overall aesthetic analysis
    overall_inputs = processor(images=full_image, return_tensors="pt").to(device)
    with torch.no_grad():
        overall_features = clip_model(**overall_inputs).pooler_output
        overall_outputs = aesthetic_model_head(overall_features)
        _, overall_pred_idx = torch.max(overall_outputs, 1)
        overall_classification = "Good Room" if overall_pred_idx.item() == 0 else "Bad Room"

    # Object detection and analysis
    yolo_results = yolo_model(image_path)
    per_object_report: List[Dict[str, str]] = []
    detected_objects: List[str] = []

    for result in yolo_results:
        for box in result.boxes:
            class_id = int(box.cls)
            object_name = yolo_model.names[class_id]
            detected_objects.append(object_name)
            
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

    # Detect room type and generate AI-powered suggestions
    room_type = detect_room_type(detected_objects, image_description)
    actionable_report = generate_ai_suggestions(
        detected_objects, 
        room_type, 
        overall_classification, 
        image_description
    )

    return {
        "overallClassification": overall_classification,
        "roomType": room_type,
        "imageDescription": image_description,
        "individualObjectAnalysis": per_object_report,
        "actionableReport": actionable_report
    }

# --- Enhanced Image Generation Task ---
def generate_image_task(file_path: str, analysis_result: Dict, output_filename: str):
    """
    Performs enhanced image generation with adjustment-focused prompts.
    """
    try:
        image = Image.open(file_path).convert("RGB")
        
        # Create adjustment-focused prompt
        prompt = create_enhanced_prompt(
            analysis_result["actionableReport"],
            analysis_result["roomType"],
            analysis_result.get("imageDescription", "")
        )
        
        print(f"Generated adjustment prompt: {prompt}")
        
        # Create better Canny edges
        edges_pil = enhance_canny_edges(image)
        
        # Negative prompt to avoid complete redesigns
        negative_prompt = "completely different room, new furniture, different layout, blurry, low quality, distorted, ugly, bad lighting, cluttered, messy, amateur photography, low resolution, artifacts, totally different architecture"
        
        # Generate with CPU-optimized settings and higher conditioning scale to preserve structure
        with torch.no_grad():
            output_image = generator_pipeline(
                prompt,
                image=edges_pil,
                negative_prompt=negative_prompt,
                num_inference_steps=15,
                guidance_scale=7.5,
                controlnet_conditioning_scale=1.2,  # Increased to better preserve structure
                eta=0.0,
                width=512,
                height=512,
            ).images[0]

        # Optional: Enhance the output image
        enhancer = ImageEnhance.Sharpness(output_image)
        output_image = enhancer.enhance(1.1)
        
        enhancer = ImageEnhance.Color(output_image)
        output_image = enhancer.enhance(1.05)

        output_image_path = GENERATED_IMAGES_DIR / output_filename
        output_image.save(output_image_path, "JPEG", quality=95, optimize=True)
        
        print(f"Adjusted image generated and saved to: {output_image_path}")

    except Exception as e:
        print(f"Error during image generation in background: {e}")
    finally:
        # Clean up the temporary file regardless of success or failure
        if os.path.exists(file_path):
            os.remove(file_path)

# --- The Enhanced API Endpoint ---
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
        
        # Generate a unique filename
        output_filename = f"generated_room_{uuid.uuid4().hex}.jpeg"
        
        # Construct the full URL for the client
        image_url = f"{request.url.scheme}://{request.url.netloc}/generated-images/{output_filename}"

        # Schedule the enhanced image generation as a background task
        background_tasks.add_task(
            generate_image_task,
            file_path=temp_file_path,
            analysis_result=analysis_result,
            output_filename=output_filename
        )
        
        # Return the enhanced analysis immediately with the full URL
        return JSONResponse(content={
            "analysis": analysis_result,
            "message": "Enhanced analysis complete. High-quality image generation is processing in the background.",
            "generated_image_url": image_url
        })
    
    except Exception as e:
        print(f"An error occurred: {e}")
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail="Internal server error")

# --- Image serving endpoint ---
@app.get("/generated-images/{image_filename}")
async def get_generated_image(image_filename: str):
    """
    Allows a client to check for and download a generated image.
    """
    image_path = GENERATED_IMAGES_DIR / image_filename
    
    if not image_path.is_file():
        raise HTTPException(status_code=404, detail="Image not found or still processing.")
    
    return FileResponse(image_path)

# --- Health check endpoint ---
@app.get("/")
async def root():
    return {"message": "IntelliRoom AI API is running successfully!"}

# --- Additional utility endpoints ---
@app.get("/health")
async def health_check():
    """Health check endpoint to verify all models are loaded"""
    models_status = {
        "clip_model": clip_model is not None,
        "yolo_model": yolo_model is not None,
        "blip_model": blip_model is not None,
        "suggestion_model": suggestion_model is not None,
        "generator_pipeline": generator_pipeline is not None
    }
    
    all_loaded = all(models_status.values())
    
    return {
        "status": "healthy" if all_loaded else "loading",
        "models": models_status,
        "device": device
    }

@app.get("/room-types")
async def get_supported_room_types():
    """Get list of supported room types"""
    return {
        "supported_room_types": list(ROOM_IMPROVEMENT_SUGGESTIONS.keys()),
        "default_type": "general"
    }

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
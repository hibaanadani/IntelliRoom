import os
import io
import base64
import tempfile
import numpy as np
import torch
import uuid
from pathlib import Path
from PIL import Image
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from diffusers import StableDiffusionControlNetPipeline, ControlNetModel, UniPCMultistepScheduler
from pydantic import BaseModel
import cv2 

# --- Configuration for this service ---
ROOT_DIR = Path(__file__).resolve().parent 
GENERATED_IMAGES_DIR = ROOT_DIR / "uploads" / "generatedrooms"

CONTROLNET_MODEL_PATH = "lllyasviel/sd-controlnet-canny"
STABLE_DIFFUSION_MODEL_PATH = "runwayml/stable-diffusion-v1-5" 

generator_pipeline = None

app = FastAPI()

@app.on_event("startup")
async def load_models():
    global generator_pipeline
    
    os.makedirs(GENERATED_IMAGES_DIR, exist_ok=True)
    
    device = "cpu"
    print(f"Using device: {device}")
    
    print("Loading Stable Diffusion and ControlNet models...")
    controlnet = ControlNetModel.from_pretrained(CONTROLNET_MODEL_PATH)
    
    # This pipeline is now only used for generation, not analysis
    generator_pipeline = StableDiffusionControlNetPipeline.from_pretrained(
        STABLE_DIFFUSION_MODEL_PATH, 
        controlnet=controlnet, 
        safety_checker=None
    )
    generator_pipeline.scheduler = UniPCMultistepScheduler.from_config(generator_pipeline.scheduler.config)
    generator_pipeline.to(device)
    print("Models for image generation loaded.")

# --- The dedicated image generation endpoint ---
@app.post("/generate_image")
async def generate_image_endpoint(
    file: UploadFile = File(...), 
    prompt: str = Form(...)
):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        print("--- DEBUG: Starting image generation for the prompt ---")
        
        image_np = np.array(image)
        low_threshold = 100
        high_threshold = 200
        edges = cv2.Canny(image_np, low_threshold, high_threshold)
        
        edges_pil = Image.fromarray(edges).convert("RGB")
        
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

        return JSONResponse(content={"url": generated_image_url})

    except Exception as e:
        print(f"Error during image generation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
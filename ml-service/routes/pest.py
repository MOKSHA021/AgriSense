from fastapi import APIRouter, File, UploadFile
import random
import time

router = APIRouter()

DISEASES = [
    { "name": "Late Blight", "severity": "High", "treatment": "Spray Mancozeb 2.5g/L water, repeat after 7 days." },
    { "name": "Leaf Rust", "severity": "Medium", "treatment": "Apply Propiconazole 1ml/L water immediately." },
    { "name": "Aphid Infestation", "severity": "Medium", "treatment": "Spray Imidacloprid 0.5ml/L water and monitor daily." },
    { "name": "Powdery Mildew", "severity": "Low", "treatment": "Apply Sulfur dust or Karathane 1ml/L to prevent spread." },
    { "name": "Healthy", "severity": "None", "treatment": "No treatment needed. Crop looks healthy and optimal." },
]

@router.post("/predict/pest")
async def predict_pest(file: UploadFile = File(...)):
    # Simulating model inference delay
    time.sleep(1.5)
    
    # [CUSTOM MODEL INTEGRATION POINT] 
    # 1. Load a PyTorch (.pt) or Keras (.h5) model globally
    # 2. Extract image bytes: image_bytes = await file.read()
    # 3. Preprocess and perform forward pass
    # 4. Map output to DISEASE class
    
    picked = random.choice(DISEASES)
    confidence = random.randint(85, 95)
    
    return {
        "success": True,
        "prediction": {
            "name": picked["name"],
            "severity": picked["severity"],
            "treatment": picked["treatment"],
            "confidence": confidence
        }
    }

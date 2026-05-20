"""
routes/soil.py  –  Soil type classification endpoint
Classifier head now uses nn.Sequential(Dropout + Linear) to match train_soil.py.
Checkpoint loading handles both bare state_dict and {'model_state': ...} format.
"""

import os
import io
import logging
import torch
import torch.nn as nn
import torchvision.transforms as T
import torchvision.models as models
from fastapi import APIRouter, HTTPException, UploadFile, File
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel

logger = logging.getLogger("agrisense")

router   = APIRouter(prefix="/predict", tags=["Soil"])
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CLASSES = [
    'Alluvial_Soil', 'Arid_Soil', 'Black_Soil',
    'Laterite_Soil', 'Mountain_Soil', 'Red_Soil', 'Yellow_Soil'
]
MAX_FILE_SIZE_MB = 10


# ── Build model with correct head (must match train_soil.py) ──────────────────
def _build_and_load_model(model_path: str) -> nn.Module:
    net = models.efficientnet_b0(weights=None)

    # ── UPDATED: matches train_soil.py build_model() with Dropout ────────
    net.classifier[1] = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(1280, len(CLASSES))
    )

    if not os.path.exists(model_path):
        raise RuntimeError(f"[soil] Model file not found: {model_path}")

    ckpt = torch.load(model_path, map_location='cpu', weights_only=False)

    # ── Handles both bare state_dict AND {'model_state': ...} checkpoint ─
    if isinstance(ckpt, dict) and 'model_state' in ckpt:
        state_dict = ckpt['model_state']
        logger.info(f"[soil] Loaded checkpoint from epoch {ckpt.get('epoch', '?')} "
                    f"(val_acc={ckpt.get('val_acc', '?'):.2f}%)")
    else:
        state_dict = ckpt  # legacy bare state_dict

    net.load_state_dict(state_dict)
    net.eval()
    logger.info(f"[soil] EfficientNet-B0 loaded | Classes: {CLASSES}")
    return net


_model_path = os.path.join(BASE_DIR, 'models', 'soil_model.pt')
soil_model  = _build_and_load_model(_model_path)

# ── Inference transform (no augmentation — validation-style only) ─────────────
_transform = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])


# ── Schema ────────────────────────────────────────────────────────────────────
class SoilPrediction(BaseModel):
    soil_type:   str
    confidence:  float
    all_scores:  dict[str, float]


# ── Endpoint ──────────────────────────────────────────────────────────────────
@router.post("/soil", response_model=SoilPrediction, summary="Soil type classification from image")
async def predict_soil(file: UploadFile = File(...)):

    # ── File validation ───────────────────────────────────────────────────
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. "
                   f"Upload a JPEG, PNG, or WebP image."
        )

    raw = await file.read()
    if len(raw) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE_MB} MB."
        )

    # ── Image decode ──────────────────────────────────────────────────────
    try:
        img = Image.open(io.BytesIO(raw)).convert('RGB')
    except UnidentifiedImageError:
        raise HTTPException(status_code=422, detail="Could not decode image file.")

    # ── Inference ─────────────────────────────────────────────────────────
    try:
        tensor = _transform(img).unsqueeze(0)   # (1, 3, 224, 224)
        with torch.no_grad():
            logits = soil_model(tensor)
            probs  = torch.softmax(logits, dim=1)[0]
    except Exception as e:
        logger.error(f"[soil] Inference error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Model inference failed")

    idx        = probs.argmax().item()
    confidence = round(probs[idx].item(), 4)
    all_scores = {cls: round(probs[i].item(), 4) for i, cls in enumerate(CLASSES)}

    logger.info(f"[soil] → {CLASSES[idx]} ({confidence:.2%}) | "
                f"file={file.filename} size={len(raw)//1024}KB")

    return SoilPrediction(
        soil_type=CLASSES[idx],
        confidence=confidence,
        all_scores=all_scores
    )

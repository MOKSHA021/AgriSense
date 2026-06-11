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
# Minimum confidence to return a result (below this → low_confidence flag)
CONFIDENCE_THRESHOLD = 0.55


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


# ── Use best checkpoint (highest val_acc) instead of final epoch ──────────────
_model_candidates = [
    os.path.join(BASE_DIR, 'models', 'soil_model_best.pt'),
    os.path.join(BASE_DIR, 'models', 'soil_model.pt'),
]
_model_path = next((path for path in _model_candidates if os.path.exists(path)), None)
soil_model = None
soil_model_error = None

if _model_path:
    try:
        soil_model = _build_and_load_model(_model_path)
    except Exception as exc:
        soil_model_error = str(exc)
        logger.exception("[soil] Failed to load model")
else:
    soil_model_error = (
        "No soil model checkpoint found. Expected models/soil_model_best.pt "
        "or models/soil_model.pt. Run train/train_soil.py first."
    )
    logger.warning("[soil] %s", soil_model_error)

# ── TTA: 5-crop test-time augmentation for better real-world robustness ───────
# Base inference transform
_base_transform = T.Compose([
    T.Resize((256, 256)),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# TTA transforms: 5 crops of 224 from 256 resized image
_tta_transforms = [
    T.Compose([T.Resize((256, 256)), T.CenterCrop(224),    T.ToTensor(), T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])]),
    T.Compose([T.Resize((256, 256)), T.RandomCrop(224),    T.ToTensor(), T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])]),
    T.Compose([T.Resize((256, 256)), T.CenterCrop(224), T.RandomHorizontalFlip(p=1.0), T.ToTensor(), T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])]),
    T.Compose([T.Resize((240, 240)), T.CenterCrop(224),    T.ToTensor(), T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])]),
    T.Compose([T.Resize((224, 224)),                        T.ToTensor(), T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])]),
]


# ── Schema ────────────────────────────────────────────────────────────────────
class SoilPrediction(BaseModel):
    soil_type:   str
    confidence:  float
    all_scores:  dict[str, float]


# ── Endpoint ──────────────────────────────────────────────────────────────────
@router.post("/soil", response_model=SoilPrediction, summary="Soil type classification from image")
async def predict_soil(file: UploadFile = File(...)):
    if soil_model is None:
        raise HTTPException(status_code=503, detail=soil_model_error)

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

    # ── TTA Inference: average over 5 transforms ──────────────────────────
    try:
        probs_accum = None
        with torch.no_grad():
            for tfm in _tta_transforms:
                tensor = tfm(img).unsqueeze(0)  # (1, 3, 224, 224)
                logits = soil_model(tensor)
                p = torch.softmax(logits, dim=1)[0]
                if probs_accum is None:
                    probs_accum = p
                else:
                    probs_accum = probs_accum + p
        probs = probs_accum / len(_tta_transforms)  # mean over TTA
    except Exception as e:
        logger.error(f"[soil] TTA inference error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Model inference failed")

    idx        = probs.argmax().item()
    confidence = round(probs[idx].item(), 4)
    all_scores = {cls: round(probs[i].item(), 4) for i, cls in enumerate(CLASSES)}
    low_confidence = confidence < CONFIDENCE_THRESHOLD

    logger.info(f"[soil] TTA -> {CLASSES[idx]} ({confidence:.2%}) low_conf={low_confidence} | "
                f"file={file.filename} size={len(raw)//1024}KB")

    return SoilPrediction(
        soil_type=CLASSES[idx],
        confidence=confidence,
        all_scores=all_scores
    )


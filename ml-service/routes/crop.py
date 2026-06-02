"""
routes/crop.py  –  Crop recommendation endpoint
Pipeline now handles scaling internally; no separate scaler transform needed.
"""

import os
import json
import logging
import joblib
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

logger = logging.getLogger("agrisense")

router   = APIRouter(prefix="/predict", tags=["Crop"])
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ── Load artifacts once at import ────────────────────────────────────────────
_model_path   = os.path.join(BASE_DIR, 'models', 'crop_model.pkl')
_encoder_path = os.path.join(BASE_DIR, 'models', 'label_encoder.pkl')
_npk_path     = os.path.join(BASE_DIR, 'data',   'soil_npk.json')

pipeline = None
le = None
npk = {}

if os.path.exists(_npk_path):
    with open(_npk_path) as f:
        npk = json.load(f)
else:
    logger.warning(f"[crop] Required file not found: {_npk_path}")

if os.path.exists(_model_path) and os.path.exists(_encoder_path):
    pipeline = joblib.load(_model_path)   # ← Full sklearn Pipeline (scaler + RF)
    le       = joblib.load(_encoder_path)
    logger.info(f"[crop] Pipeline loaded | Classes: {len(le.classes_)} crops | "
                f"Soil types available: {list(npk.keys())}")
else:
    logger.warning("[crop] Model files not found. Using mock mode.")


# ── Schema ────────────────────────────────────────────────────────────────────
class CropInput(BaseModel):
    soil_type:   str   = Field(..., example="Alluvial")
    temperature: float = Field(..., ge=-10,  le=60,  example=25.0)
    humidity:    float = Field(..., ge=0,    le=100, example=65.0)
    rainfall:    float = Field(..., ge=0,    le=500, example=120.0)

    @field_validator('soil_type')
    @classmethod
    def validate_soil_type(cls, v):
        return v.strip().title()


class CropPrediction(BaseModel):
    crop:  str
    score: float


class CropResponse(BaseModel):
    soil_type: str
    crops:     list[CropPrediction]


# ── Endpoint ──────────────────────────────────────────────────────────────────
@router.post("/crop", response_model=CropResponse, summary="Top-5 crop recommendations")
def predict_crop(data: CropInput):
    if data.soil_type not in npk:
        raise HTTPException(
            status_code=422,
            detail=f"Soil type '{data.soil_type}' not found. "
                   f"Available: {list(npk.keys())}"
        )

    s = npk[data.soil_type]

    # Pipeline handles StandardScaler internally — pass raw features directly
    features = [[
        s['N'], s['P'], s['K'],
        data.temperature, data.humidity,
        s['ph'], data.rainfall
    ]]

    if pipeline is None or le is None:
        logger.warning("[crop] Returning mock data since model is missing.")
        return CropResponse(
            soil_type=data.soil_type,
            crops=[
                CropPrediction(crop="Rice", score=0.95),
                CropPrediction(crop="Wheat", score=0.85),
                CropPrediction(crop="Maize", score=0.75),
            ]
        )

    try:
        probs    = pipeline.predict_proba(features)[0]
    except Exception as e:
        logger.error(f"[crop] Prediction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Model inference failed")

    top5_idx = probs.argsort()[-5:][::-1]

    logger.info(
        f"[crop] soil={data.soil_type} temp={data.temperature} "
        f"→ top={le.classes_[top5_idx[0]]} ({probs[top5_idx[0]]:.2%})"
    )

    return CropResponse(
        soil_type=data.soil_type,
        crops=[
            CropPrediction(crop=le.classes_[i], score=round(float(probs[i]), 4))
            for i in top5_idx
        ]
    )

"""
routes/price.py  –  Crop price prediction endpoint
IMPORTANT: Prophet models were trained on log1p(price) — must inverse with expm1().
"""

import os
import logging
import numpy as np
import pandas as pd
import joblib
from functools import lru_cache
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

logger = logging.getLogger("agrisense")

router   = APIRouter(prefix="/predict", tags=["Price"])
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SUPPORTED_CROPS = ['Wheat', 'Rice', 'Maize', 'Mustard', 'Tomato', 'Potato', 'Onion']
MAX_FORECAST_DAYS = 1095  # 3 years max


# ── Lazy model cache (load on first request, keep in memory) ──────────────────
@lru_cache(maxsize=len(SUPPORTED_CROPS))
def _load_model(crop_name: str):
    path = os.path.join(BASE_DIR, 'models', f'prophet_{crop_name}.pkl')
    if not os.path.exists(path):
        return None
    logger.info(f"[price] Loading Prophet model for {crop_name}")
    return joblib.load(path)


# ── Schema ────────────────────────────────────────────────────────────────────
class PriceInput(BaseModel):
    crop_name:    str = Field(..., example="Wheat")
    harvest_date: str = Field(..., example="2026-09-01",
                              description="Target date in YYYY-MM-DD format")

    @field_validator('crop_name')
    @classmethod
    def validate_crop(cls, v):
        v = v.strip().title()
        if v not in SUPPORTED_CROPS:
            raise ValueError(
                f"'{v}' not supported. Choose from: {SUPPORTED_CROPS}"
            )
        return v

    @field_validator('harvest_date')
    @classmethod
    def validate_date(cls, v):
        try:
            pd.to_datetime(v)
        except Exception:
            raise ValueError("harvest_date must be in YYYY-MM-DD format")
        return v


class PriceResponse(BaseModel):
    crop:             str
    harvest_date:     str
    predicted_price:  float
    lower_bound:      float
    upper_bound:      float
    confidence_level: str


# ── Endpoint ──────────────────────────────────────────────────────────────────
@router.post("/price", response_model=PriceResponse, summary="Crop price forecast")
def predict_price(data: PriceInput):
    model = _load_model(data.crop_name)
    if model is None:
        logger.warning(f"[price] No price model found for '{data.crop_name}'. Using mock mode.")
        return PriceResponse(
            crop=data.crop_name,
            harvest_date=data.harvest_date,
            predicted_price=2500.0,
            lower_bound=2400.0,
            upper_bound=2600.0,
            confidence_level="mock"
        )

    target_dt = pd.to_datetime(data.harvest_date)

    # Calculate required forecast horizon from model's last training date
    last_train_date = model.history['ds'].max()
    days_ahead = (target_dt - last_train_date).days

    if days_ahead < 0:
        # Historical date — fetch directly from training data
        historical = model.history.copy()
        historical['date_only'] = historical['ds'].dt.date
        row = historical[historical['date_only'] == target_dt.date()]
        if not row.empty:
            # Inverse log1p transform ← CRITICAL
            raw_price = float(row['y'].values[0])
            price     = round(np.expm1(raw_price), 2)
            return PriceResponse(
                crop=data.crop_name,
                harvest_date=data.harvest_date,
                predicted_price=price,
                lower_bound=price,
                upper_bound=price,
                confidence_level="historical"
            )
        days_ahead = 30  # fallback: short forecast

    periods = min(max(days_ahead + 30, 90), MAX_FORECAST_DAYS)

    try:
        future   = model.make_future_dataframe(periods=periods)
        forecast = model.predict(future)
    except Exception as e:
        logger.error(f"[price] Prophet predict error for {data.crop_name}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Price model inference failed")

    # Match target date
    forecast['date_only'] = forecast['ds'].dt.date
    target_row = forecast[forecast['date_only'] == target_dt.date()]

    if target_row.empty:
        # Fallback: nearest available date
        forecast['diff'] = (forecast['ds'] - target_dt).abs()
        target_row = forecast.loc[[forecast['diff'].idxmin()]]
        logger.warning(
            f"[price] Exact date {data.harvest_date} not in forecast range; "
            f"using nearest: {target_row['ds'].values[0]}"
        )

    # ── CRITICAL: Inverse log1p transform ────────────────────────────────
    yhat       = np.expm1(float(target_row['yhat'].values[0]))
    yhat_lower = np.expm1(float(target_row['yhat_lower'].values[0]))
    yhat_upper = np.expm1(float(target_row['yhat_upper'].values[0]))

    logger.info(
        f"[price] {data.crop_name} @ {data.harvest_date} "
        f"-> INR {yhat:.0f} [{yhat_lower:.0f}-{yhat_upper:.0f}]"
    )

    return PriceResponse(
        crop=data.crop_name,
        harvest_date=data.harvest_date,
        predicted_price=round(yhat,       2),
        lower_bound=    round(yhat_lower, 2),
        upper_bound=    round(yhat_upper, 2),
        confidence_level="90%"
    )

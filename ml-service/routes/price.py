import os
import joblib
import pandas as pd
from fastapi import APIRouter
from pydantic import BaseModel

router   = APIRouter()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class PriceInput(BaseModel):
    crop_name:    str
    harvest_date: str  # format: "2026-09-01"

@router.post("/predict/price")
def predict_price(data: PriceInput):
    model_path = os.path.join(BASE_DIR, 'models', f'prophet_{data.crop_name}.pkl')

    if not os.path.exists(model_path):
        return { "error": f"No price model found for {data.crop_name}" }

    model    = joblib.load(model_path)

    # Extend to 730 days (2 years) to cover any harvest date
    future   = model.make_future_dataframe(periods=730)
    forecast = model.predict(future)

    # Convert to date only for comparison (removes time component issues)
    target_date = pd.to_datetime(data.harvest_date).date()
    forecast['date_only'] = forecast['ds'].dt.date

    target = forecast[forecast['date_only'] == target_date]

    if target.empty:
        # Return closest available date prediction
        forecast['diff'] = abs(forecast['ds'] - pd.to_datetime(data.harvest_date))
        target = forecast.loc[[forecast['diff'].idxmin()]]

    return {
        "crop":            data.crop_name,
        "harvest_date":    data.harvest_date,
        "predicted_price": round(float(target['yhat'].values[0]), 2),
        "lower":           round(float(target['yhat_lower'].values[0]), 2),
        "upper":           round(float(target['yhat_upper'].values[0]), 2)
    }

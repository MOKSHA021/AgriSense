import os
import json
import joblib
from fastapi import APIRouter
from pydantic import BaseModel

router   = APIRouter()
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

model = joblib.load(os.path.join(BASE_DIR, 'models', 'crop_model.pkl'))
le    = joblib.load(os.path.join(BASE_DIR, 'models', 'label_encoder.pkl'))
npk   = json.load(open(os.path.join(BASE_DIR, 'data', 'soil_npk.json')))

class CropInput(BaseModel):
    soil_type:   str
    temperature: float
    humidity:    float
    rainfall:    float

@router.post("/predict/crop")
def predict_crop(data: CropInput):
    s        = npk[data.soil_type]
    features = [[s['N'], s['P'], s['K'],
                 data.temperature, data.humidity,
                 s['ph'], data.rainfall]]
    probs    = model.predict_proba(features)[0]
    top5_idx = probs.argsort()[-5:][::-1]
    return {
        "crops": [
            { "crop": le.classes_[i], "score": round(probs[i], 4) }
            for i in top5_idx
        ]
    }

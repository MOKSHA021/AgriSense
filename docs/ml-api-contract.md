# AgriSense ML API Contract

The React frontend must call ML through the Express backend. The frontend should not call the FastAPI service directly.

## Service URLs

- Frontend to backend: `http://localhost:5000/api`
- Backend to ML service: `ML_SERVICE_URL`, default `http://localhost:8000`

## Health And Model Status

### `GET /api/ml/health`

Returns backend and ML-service health.

### `GET /api/ml/models/status`

Returns model artifact coverage. Use this before deployment to catch missing or stale models.

Important fields:

- `crop_model`: `true` when `crop_model.pkl` exists.
- `label_encoder`: `true` when `label_encoder.pkl` exists.
- `soil_model`: `true` when `soil_model.pt` exists.
- `price_models`: one item per supported Prophet crop.
- `warnings`: stale/missing report problems that should be fixed before release.

## Soil Classification

### `POST /api/ml/predict/soil`

Authenticated multipart upload.

Request:

- field name: `file`
- allowed types: `image/jpeg`, `image/png`, `image/webp`
- max size: `10 MB`

Response:

```json
{
  "soil_type": "Red_Soil",
  "soil_type_clean": "Red",
  "confidence": 0.82,
  "raw_model_scores": {},
  "visual_scores": {},
  "visual_assessment": {
    "dominant_color": "reddish brown",
    "visual_prior_weight": 0.35
  },
  "correction_applied": false,
  "model_top_soil_type": "Red_Soil",
  "is_low_confidence": false,
  "reliability": "medium",
  "decision_margin": 0.43,
  "confidence_threshold": 0.8,
  "prediction_type": "image_only",
  "top_candidates": [
    { "soil_type": "Red_Soil", "confidence": 0.82 }
  ],
  "image_quality": {
    "brightness": 0.42,
    "contrast": 0.21,
    "sharpness_proxy": 0.08
  },
  "all_scores": {}
}
```

If `is_low_confidence` is `true`, the UI should show candidates and avoid presenting the result as final. Soil image predictions are image-only signals; combine them with GPS/manual soil data before crop decisions.

## Crop Recommendation

### `POST /api/ml/predict/crop`

Authenticated JSON request.

Request:

```json
{
  "soil_type": "Alluvial",
  "temperature": 25,
  "humidity": 65,
  "rainfall": 120,
  "N": 80,
  "P": 40,
  "K": 40,
  "ph": 6.8
}
```

`N`, `P`, `K`, and `ph` are optional for backward compatibility. When present, the ML service uses them. When absent, it falls back to soil-type averages from `soil_npk.json`.

Response:

```json
{
  "soil_type": "Alluvial_Soil",
  "feature_source": "user_supplied",
  "features_used": {
    "N": 80,
    "P": 40,
    "K": 40,
    "temperature": 25,
    "humidity": 65,
    "ph": 6.8,
    "rainfall": 120
  },
  "crops": [
    { "crop": "rice", "score": 0.91 }
  ]
}
```

## Price Forecast

### `POST /api/ml/predict/price`

Authenticated JSON request.

Request:

```json
{
  "crop_name": "Wheat",
  "harvest_date": "2026-09-01"
}
```

Response:

```json
{
  "crop": "Wheat",
  "harvest_date": "2026-09-01",
  "predicted_price": 2350,
  "lower_bound": 2100,
  "upper_bound": 2600,
  "confidence_level": "90% prediction interval",
  "forecast_horizon_days": 90,
  "model_note": "Prediction interval is uncertainty range, not model accuracy."
}
```

The prediction interval is not an accuracy percentage. Show it as uncertainty.

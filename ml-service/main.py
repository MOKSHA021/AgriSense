"""
main.py  –  AgriSense ML Service entry point
FastAPI app with lifespan startup checks, structured logging, CORS, and health endpoint.
"""

import os
import logging
import sys
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ── Logging setup (before importing routes so they inherit config) ─────────────
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
REPORTS_DIR  = os.path.join(BASE_DIR, 'reports')
os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'models'), exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(REPORTS_DIR, 'api.log')),
        logging.StreamHandler(sys.stdout),
    ]
)
logger = logging.getLogger("agrisense")

# ── Import routers AFTER logging is configured ────────────────────────────────
from routes.soil     import router as soil_router      # noqa: E402
from routes.crop     import router as crop_router      # noqa: E402
from routes.price    import router as price_router     # noqa: E402
from routes.reference import router as reference_router # noqa: E402


# ── Startup / Shutdown lifecycle ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("=" * 55)
    logger.info("  AgriSense ML Service - Starting Up")
    logger.info(f"  Time    : {datetime.utcnow().isoformat()}Z")
    logger.info(f"  Base dir: {BASE_DIR}")

    # Verify all required model files exist before accepting traffic
    required_models = ['crop_model.pkl', 'label_encoder.pkl']
    missing = [
        m for m in required_models
        if not os.path.exists(os.path.join(BASE_DIR, 'models', m))
    ]
    soil_available = any(
        os.path.exists(os.path.join(BASE_DIR, 'models', name))
        for name in ('soil_model_best.pt', 'soil_model.pt')
    )
    if not soil_available:
        missing.append('soil_model_best.pt or soil_model.pt')
    if missing:
        logger.warning(f"Missing model files (run training scripts first): {missing}")
    else:
        logger.info("  All core model files found")

    logger.info("=" * 55)
    yield
    logger.info("AgriSense ML Service - Shutting Down")


# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "AgriSense ML Service",
    description = "Crop recommendation, market price forecasting, and soil classification APIs",
    version     = "2.0.0",
    docs_url    = "/docs",
    redoc_url   = "/redoc",
    lifespan    = lifespan,
)

# ── CORS (adjust origins for production) ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins     = os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)


# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )


# ── Request logging middleware ────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"-> {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"<- {request.method} {request.url.path} | {response.status_code}")
    return response


# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(soil_router)
app.include_router(crop_router)
app.include_router(price_router)
app.include_router(reference_router)


# ── Health & info endpoints ───────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status":    "running",
        "service":   "AgriSense ML Service",
        "version":   "2.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "endpoints": ["/predict/crop", "/predict/price", "/predict/soil"]
    }


@app.get("/models/status", tags=["Health"])
def models_status():
    """Returns which model files are present on disk."""
    models_dir = os.path.join(BASE_DIR, 'models')
    files      = os.listdir(models_dir) if os.path.exists(models_dir) else []
    return {
        "models_dir": models_dir,
        "files":      sorted(files),
        "crop_model":   "crop_model.pkl"   in files,
        "soil_model": any(name in files for name in ("soil_model_best.pt", "soil_model.pt")),
        "price_models": [f for f in files if f.startswith("prophet_")],
    }

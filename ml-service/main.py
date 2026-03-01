from fastapi import FastAPI
from routes.soil import router as soil_router
from routes.crop import router as crop_router
from routes.price import router as price_router

app = FastAPI(title="AgriSense ML Service")

app.include_router(soil_router)
app.include_router(crop_router)
app.include_router(price_router)

@app.get("/")
def health_check():
    return { "status": "AgriSense ML Service is running" }

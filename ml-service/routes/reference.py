"""
routes/reference.py – Reference data endpoints for crop recommendations
Handles crop data, district crop counts, and user crop choices
"""

import os
import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict

logger = logging.getLogger("agrisense")

router = APIRouter(prefix="/reference", tags=["Reference"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# File paths
CROPS_FILE = os.path.join(DATA_DIR, "crops.json")
CHOICES_FILE = os.path.join(DATA_DIR, "crop_choices.json")
DISTRICT_COUNTS_FILE = os.path.join(DATA_DIR, "district_crop_counts.json")

# Default crop data (fallback if file doesn't exist)
DEFAULT_CROPS = [
    {"name": "Rice", "N": 60, "P": 40, "K": 50, "pH": 6.5, "temp": 25, "rainfall": 200, "humidity": 70, "yield": 20, "price": 2100, "cost_pct": 0.6, "tip": "Maintain 5 cm standing water during tillering stage."},
    {"name": "Wheat", "N": 80, "P": 50, "K": 40, "pH": 7.0, "temp": 20, "rainfall": 75, "humidity": 60, "yield": 18, "price": 2275, "cost_pct": 0.6, "tip": "Sow in mid-November for optimal vernalisation."},
    {"name": "Maize", "N": 80, "P": 50, "K": 40, "pH": 6.8, "temp": 28, "rainfall": 85, "humidity": 65, "yield": 22, "price": 1870, "cost_pct": 0.6, "tip": "Apply nitrogen in three split doses for better cob filling."},
    {"name": "Sugarcane", "N": 120, "P": 60, "K": 80, "pH": 7.2, "temp": 30, "rainfall": 150, "humidity": 75, "yield": 350, "price": 350, "cost_pct": 0.6, "tip": "Use trench planting method for better ratoon management."},
    {"name": "Millets", "N": 30, "P": 20, "K": 20, "pH": 6.0, "temp": 32, "rainfall": 55, "humidity": 50, "yield": 8, "price": 2800, "cost_pct": 0.55, "tip": "Ideal for dryland farming; minimal irrigation needed."},
    {"name": "Cotton", "N": 60, "P": 40, "K": 40, "pH": 7.5, "temp": 28, "rainfall": 85, "humidity": 60, "yield": 15, "price": 6500, "cost_pct": 0.6, "tip": "Monitor for bollworm infestation during flowering."},
    {"name": "Potato", "N": 120, "P": 60, "K": 80, "pH": 5.8, "temp": 20, "rainfall": 65, "humidity": 70, "yield": 200, "price": 1200, "cost_pct": 0.6, "tip": "Hill up soil around stems every 2 weeks for higher tuber count."},
    {"name": "Soybean", "N": 20, "P": 40, "K": 30, "pH": 6.5, "temp": 26, "rainfall": 90, "humidity": 65, "yield": 12, "price": 4500, "cost_pct": 0.58, "tip": "Inoculate seeds with Rhizobium for better nitrogen fixation."},
    {"name": "Groundnut", "N": 20, "P": 35, "K": 35, "pH": 6.5, "temp": 27, "rainfall": 85, "humidity": 65, "yield": 15, "price": 5500, "cost_pct": 0.58, "tip": "Apply gypsum at pegging stage to improve pod filling."},
]

# Default threshold for overproduction safeguard
DEFAULT_THRESHOLD = 15


# ── Helper Functions ────────────────────────────────────────────────────────
def load_json_file(filepath, default):
    """Load JSON file or return default if file doesn't exist"""
    try:
        if os.path.exists(filepath):
            with open(filepath, 'r') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Error loading {filepath}: {e}")
    return default

def save_json_file(filepath, data):
    """Save data to JSON file"""
    try:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving {filepath}: {e}")
        return False


# ── Schemas ──────────────────────────────────────────────────────────────────
class CropChoice(BaseModel):
    crop: str
    district: str


class CropChoiceResponse(BaseModel):
    success: bool
    choice: Optional[Dict] = None
    message: str


class DistrictCountsResponse(BaseModel):
    counts: Dict[str, int]
    threshold: int


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.get("/crops", summary="Get all crops with their properties")
async def get_crops():
    """Return all crops with their NPK, environmental requirements, and economic data"""
    crops = load_json_file(CROPS_FILE, DEFAULT_CROPS)
    return {"crops": crops}


@router.get("/user-chosen-crop", summary="Get user's chosen crop")
async def get_user_chosen_crop():
    """Return the user's currently chosen crop and district"""
    choices = load_json_file(CHOICES_FILE, [])
    if choices:
        # Return the most recent choice
        return {"choice": choices[-1]}
    return {"choice": None}


@router.post("/choose-crop", response_model=CropChoiceResponse, summary="Save user's crop choice")
async def choose_crop(choice: CropChoice):
    """Save the user's crop choice for their district and update counts"""
    try:
        # Load existing choices
        choices = load_json_file(CHOICES_FILE, [])
        
        # Add new choice
        new_choice = {
            "crop": choice.crop,
            "district": choice.district.upper(),
            "timestamp": str(__import__('datetime').datetime.now())
        }
        choices.append(new_choice)
        
        # Save choices
        if not save_json_file(CHOICES_FILE, choices):
            return CropChoiceResponse(success=False, message="Failed to save choice")
        
        # Update district crop counts
        counts = load_json_file(DISTRICT_COUNTS_FILE, {})
        district_key = choice.district.upper()
        
        if district_key not in counts:
            counts[district_key] = {}
        
        if choice.crop not in counts[district_key]:
            counts[district_key][choice.crop] = 0
        
        counts[district_key][choice.crop] += 1
        
        # Save counts
        if not save_json_file(DISTRICT_COUNTS_FILE, counts):
            return CropChoiceResponse(success=False, message="Failed to update counts")
        
        logger.info(f"User chose {choice.crop} for district {choice.district}")
        
        return CropChoiceResponse(
            success=True,
            choice=new_choice,
            message=f"Successfully chose {choice.crop} for {choice.district}"
        )
    except Exception as e:
        logger.error(f"Error in choose-crop: {e}")
        return CropChoiceResponse(success=False, message=str(e))


@router.get("/district-crop-counts", response_model=DistrictCountsResponse, summary="Get crop counts for a district")
async def get_district_crop_counts(district: str):
    """Return the number of times each crop has been chosen in a district"""
    try:
        counts = load_json_file(DISTRICT_COUNTS_FILE, {})
        district_key = district.upper()
        
        district_counts = counts.get(district_key, {})
        
        return DistrictCountsResponse(
            counts=district_counts,
            threshold=DEFAULT_THRESHOLD
        )
    except Exception as e:
        logger.error(f"Error in district-crop-counts: {e}")
        return DistrictCountsResponse(counts={}, threshold=DEFAULT_THRESHOLD)


@router.get("/expense-categories", summary="Get expense categories")
async def get_expense_categories():
    """Return expense categories for expense tracker"""
    categories = ["Seeds", "Fertilizers", "Pesticides", "Labor", "Equipment", "Irrigation", "Transport", "Other"]
    return {"categories": categories}


@router.get("/plan-crops", summary="Get crops for planning")
async def get_plan_crops():
    """Return crops for expense planning"""
    crops = ["Rice", "Wheat", "Maize", "Sugarcane", "Millets", "Cotton", "Potato", "Soybean", "Groundnut"]
    return {"crops": crops}


@router.get("/seasons", summary="Get growing seasons")
async def get_seasons():
    """Return growing seasons"""
    seasons = ["Kharif", "Rabi", "Zaid"]
    return {"seasons": seasons}

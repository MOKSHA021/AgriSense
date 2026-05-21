# AgriSense - Project Details

## Overview
AgriSense is a comprehensive agricultural management system that provides farmers with AI-powered tools for soil analysis, crop recommendation, weather forecasting, market prices, risk assessment, expense tracking, and input advisor.

---

## Architecture

### Technology Stack
- **Frontend**: React with React Router, Context API, Axios, Tailwind CSS
- **Backend**: Node.js with Express, MongoDB
- **ML Service**: Python FastAPI with scikit-learn models
- **External APIs**: 
  - Open-Meteo (Weather)
  - data.gov.in (Mandi data)
  - todaypricerates.com (Price scraping)
  - OpenStreetMap Nominatim (Geocoding)
  - ISRIC SoilGrids (Soil properties)

### System Architecture
```
Frontend (React)
    ↓ HTTP Requests (Axios)
Backend (Express)
    ↓ Routes → Controllers → Models
MongoDB (Database)
    ↓
ML Service (FastAPI)
    ↓
External APIs
```

---

## Features

### 1. Soil Analysis

**Purpose**: Analyze soil samples using ML image classification and GPS-based soil data.

**Data Flow**:
```
Frontend (SoilAnalysis.jsx)
  ↓ API.get("/reference/soil-database")
Backend (reference.js)
  ↓ Returns SOIL_DATABASE constant
Frontend stores in state
  ↓ User uploads soil photo
  ↓ API.post("/ml/predict/soil", formData)
Backend (ml.js → mlController.js)
  ↓ Proxies to ML Service
ML Service (soil.py)
  ↓ EfficientNet-B0 model predicts soil type
  ↓ Returns { soil_type, confidence }
Frontend displays soil characteristics
  ↓ User clicks GPS button
  ↓ Fetch from ISRIC SoilGrids API (direct)
Frontend displays GPS soil data
```

**API Endpoints**:
- `GET /api/reference/soil-database` - Get soil database with characteristics
- `POST /api/ml/predict/soil` - Predict soil type from image (requires auth)

**Data Sources**:
- Reference data: Backend static data (centralized in reference.js)
- Soil type prediction: ML Service (EfficientNet-B0 model)
- GPS soil data: ISRIC SoilGrids API (external)

**Logic Type**: ML-based (EfficientNet-B0 for image classification)

**Files**:
- Frontend: `frontend/src/pages/SoilAnalysis.jsx`
- Backend Route: `backend/routes/ml.js`
- Backend Controller: `backend/controllers/mlController.js`
- ML Service: `ml-service/routes/soil.py`
- Reference Route: `backend/routes/reference.js`

---

### 2. Crop Recommendation

**Purpose**: Recommend optimal crops based on soil type, NPK levels, and climate conditions.

**Data Flow**:
```
Frontend (CropRecommend.jsx)
  ↓ API.get("/reference/soil-presets")
  ↓ API.get("/reference/crops")
Backend (reference.js)
  ↓ Returns SOIL_PRESETS and CROPS constants
Frontend stores in state
  ↓ User selects soil preset (auto-fills NPK)
  ↓ User enters climate data
  ↓ API.post("/ml/predict/crop", { soil_type, temperature, humidity, rainfall })
Backend (ml.js → mlController.js)
  ↓ Proxies to ML Service
ML Service (crop.py)
  ↓ Random Forest model predicts top 5 crops
  ↓ Returns { soil_type, crops: [{ crop, score }] }
Frontend maps ML results to crop data with financial estimates
Frontend displays top 5 recommendations
```

**API Endpoints**:
- `GET /api/reference/soil-presets` - Get soil NPK presets
- `GET /api/reference/crops` - Get crop parameters
- `POST /api/ml/predict/crop` - Predict crops using ML (requires auth)

**Data Sources**:
- Reference data: Backend static data (centralized in reference.js)
- Crop prediction: ML Service (Random Forest model)

**Logic Type**: ML-based (Random Forest for crop recommendation)

**Files**:
- Frontend: `frontend/src/pages/CropRecommend.jsx`
- Backend Route: `backend/routes/ml.js`
- Backend Controller: `backend/controllers/mlController.js`
- ML Service: `ml-service/routes/crop.py`
- Reference Route: `backend/routes/reference.js`

---

### 3. Weather Forecast

**Purpose**: Provide weather forecasts for agricultural planning.

**Data Flow**:
```
Frontend (Dashboard.jsx)
  ↓ User enters city or detects location
  ↓ Fetch from Open-Meteo API (direct)
Frontend displays weather data
```

**API Endpoints**:
- None (direct external API call)

**Data Sources**:
- Weather data: Open-Meteo API (external)

**Logic Type**: External API

**Files**:
- Frontend: `frontend/src/pages/Dashboard.jsx`

---

### 4. Market Prices

**Purpose**: Provide agricultural commodity prices from mandi markets.

**Data Flow**:
```
Frontend (MarketPrices.jsx)
  ↓ API.get("/api/market/commodity/:commodity")
Backend (market.js → marketController.js)
  ↓ Fetches from data.gov.in API
  ↓ Scrapes from todaypricerates.com
Backend returns price data
Frontend displays market prices
```

**API Endpoints**:
- `GET /api/market/commodity/:commodity` - Get market prices for commodity
- `GET /api/market/commodities` - Get list of available commodities

**Data Sources**:
- Price data: data.gov.in API, todaypricerates.com (external)

**Logic Type**: External API + Web Scraping

**Files**:
- Frontend: `frontend/src/pages/MarketPrices.jsx`
- Backend Route: `backend/routes/market.js`
- Backend Controller: `backend/controllers/marketController.js`

---

### 5. Risk Assessment

**Purpose**: Assess agricultural risks (flood, drought, heat, frost) based on weather data.

**Data Flow**:
```
Frontend (RiskAssessment.jsx)
  ↓ User enters city or detects location
  ↓ Fetch weather from Open-Meteo API (direct)
  ↓ API.post("/reference/compute-risks", { current, forecast })
Backend (reference.js)
  ↓ computeRisks() - Rule-based logic
  ↓ Returns risks with levels, descriptions, actions
Frontend stores in state
  ↓ API.post("/reference/safe-crops", { risks })
Backend (reference.js)
  ↓ getSafeCrops() - Rule-based logic
  ↓ Returns safe crop recommendations
Frontend displays risks and safe crops
```

**API Endpoints**:
- `POST /api/reference/compute-risks` - Compute risks from weather data
- `POST /api/reference/safe-crops` - Get safe crop recommendations based on risks

**Data Sources**:
- Weather data: Open-Meteo API (external)
- Risk computation: Backend rule-based logic (centralized in reference.js)
- Safe crops: Backend rule-based logic (centralized in reference.js)

**Logic Type**: Rule-based (centralized in backend, can be replaced with ML)

**Files**:
- Frontend: `frontend/src/pages/RiskAssessment.jsx`
- Reference Route: `backend/routes/reference.js`

---

### 6. Expense Tracker

**Purpose**: Track agricultural expenses and forecast costs.

**Data Flow**:
```
Frontend (ExpenseTracker.jsx)
  ↓ useEffect on mount
  ↓ API.get("/reference/expense-categories")
  ↓ API.get("/reference/plan-crops")
  ↓ API.get("/reference/seasons")
Backend (reference.js)
  ↓ Returns CATEGORIES, PLAN_CROPS, SEASONS constants
Frontend stores in state
  ↓ User adds expense
  ↓ API.post("/expenses", { expense })
Backend (expenses.js)
  ↓ Creates expense record in MongoDB
Frontend displays updated expenses
  ↓ User saves forecast plan
  ↓ API.post("/expenses/plan", { plan })
Backend (expenses.js)
  ↓ Updates plan in MongoDB
Frontend displays forecast
```

**API Endpoints**:
- `GET /api/reference/expense-categories` - Get expense categories
- `GET /api/reference/plan-crops` - Get plan crop options
- `GET /api/reference/seasons` - Get season options
- `GET /api/expenses` - Get expenses and plan
- `POST /api/expenses` - Add expense
- `POST /api/expenses/plan` - Save forecast plan

**Data Sources**:
- Reference data: Backend static data (centralized in reference.js)
- Expense data: MongoDB (ExpenseRecord model)

**Logic Type**: CRUD operations with MongoDB

**Files**:
- Frontend: `frontend/src/pages/ExpenseTracker.jsx`
- Backend Route: `backend/routes/expenses.js`
- Backend Model: `backend/models/ExpenseRecord.js`
- Reference Route: `backend/routes/reference.js`

---

### 7. Input Advisor

**Purpose**: Recommend agricultural inputs (seeds, fertilizers) with seller information.

**Data Flow**:
```
Frontend (InputAdvisor.jsx)
  ↓ useEffect on mount
  ↓ API.get("/input-advisor/crops")
Backend (inputAdvisor.js)
  ↓ Returns crops from CROP_REQUIREMENTS keys
Frontend stores in state
  ↓ User enters crop, area, location
  ↓ API.post("/input-advisor/recommend", { crop, area, location })
Backend (inputAdvisor.js)
  ↓ Uses CROP_REQUIREMENTS (hardcoded in backend)
  ↓ Queries MongoDB InputInventory for sellers
  ↓ Calculates total cost
  ↓ Returns recommendations
Frontend displays sellers and total cost
```

**API Endpoints**:
- `GET /api/input-advisor/crops` - Get available crops
- `POST /api/input-advisor/recommend` - Get input recommendations
- `GET /api/input-advisor/inventory` - Get seller inventory
- `POST /api/input-advisor/inventory` - Add seller inventory (admin)

**Data Sources**:
- Crop requirements: Backend static data (inputAdvisor.js)
- Seller inventory: MongoDB (InputInventory model)

**Logic Type**: Rule-based calculations with MongoDB

**Files**:
- Frontend: `frontend/src/pages/InputAdvisor.jsx`
- Backend Route: `backend/routes/inputAdvisor.js`
- Backend Model: `backend/models/InputInventory.js`

---

### 8. Pest Detection (Incomplete)

**Purpose**: Detect pests from crop images using ML.

**Status**: Incomplete - Feature exists but not fully implemented.

**Files**:
- Frontend: `frontend/src/pages/PestDetection.jsx` (incomplete)

---

## Reference Data API

All static reference data is centralized in `backend/routes/reference.js`:

### Endpoints
- `GET /api/reference/expense-categories` - Expense Tracker categories
- `GET /api/reference/plan-crops` - Expense Tracker crop options
- `GET /api/reference/seasons` - Season options
- `GET /api/reference/soil-database` - Soil Analysis soil characteristics
- `GET /api/reference/soil-presets` - Crop Recommendation soil NPK presets
- `GET /api/reference/crops` - Crop Recommendation crop parameters
- `GET /api/reference/input-crop-requirements` - Input Advisor crop requirements
- `POST /api/reference/safe-crops` - Risk Assessment safe crops
- `POST /api/reference/compute-risks` - Risk Assessment risk computation

### Data Types
- **Static Constants**: All reference data is stored as constants in reference.js
- **Future Improvement**: Can be moved to MongoDB for dynamic updates

---

## ML Service Endpoints

The ML Service (FastAPI) provides the following endpoints:

- `POST /predict/soil` - Soil type classification (EfficientNet-B0)
- `POST /predict/crop` - Crop recommendation (Random Forest)
- `POST /predict/price` - Price prediction (Linear Regression)
- `GET /` - Health check

### ML Models
- **Soil Classification**: EfficientNet-B0 trained on soil images
- **Crop Recommendation**: Random Forest trained on soil, climate data
- **Price Prediction**: Linear Regression trained on historical price data

---

## Database Models

### MongoDB Collections

#### ExpenseRecord
```javascript
{
  category: String,
  amount: Number,
  date: Date,
  notes: String,
  userId: ObjectId
}
```

#### InputInventory
```javascript
{
  inputName: String,
  displayName: String,
  sellerName: String,
  location: String,
  pricePerUnit: Number,
  unit: String,
  stockAvailable: Number,
  contact: String
}
```

#### User
```javascript
{
  username: String,
  email: String,
  password: String,
  role: String
}
```

---

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agrisense
ML_SERVICE_URL=http://localhost:8000
DATA_GOV_RESOURCE_ID=your_resource_id
DATA_GOV_API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### ML Service (.env)
```
No environment variables required
```

---

## Recent Improvements

### Static Data Migration
All 5 features previously using static/hardcoded data have been migrated to use backend APIs:

1. **Expense Tracker**: Categories, plan crops, seasons now fetched from `/api/reference/*`
2. **Risk Assessment**: Risk computation and safe crops logic centralized in backend
3. **Soil Analysis**: Soil database fetched from `/api/reference/soil-database`
4. **Crop Recommendation**: Soil presets and crop data fetched from `/api/reference/*`
5. **Input Advisor**: Crop list fetched from `/api/input-advisor/crops`

### ML Integration
1. **Crop Recommendation**: Now uses ML Service (Random Forest) instead of rule-based scoring
2. **Risk Assessment**: Logic centralized in backend (still rule-based, ready for ML replacement)

---

## Future Improvements

### Risk Assessment
- Replace rule-based logic with ML model for risk prediction
- Train model on historical weather data and crop outcomes

### Input Advisor
- Move CROP_REQUIREMENTS to reference API
- Implement dynamic seller data management

### Pest Detection
- Complete ML model integration for pest detection
- Implement image upload and classification

### Reference Data
- Move all reference data to MongoDB for dynamic updates
- Implement admin panel for reference data management

---

## File Structure

```
AgriSense/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── mlController.js
│   │   └── marketController.js
│   ├── models/
│   │   ├── ExpenseRecord.js
│   │   ├── InputInventory.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   ├── inputAdvisor.js
│   │   ├── market.js
│   │   ├── ml.js
│   │   └── reference.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ExpenseTracker.jsx
│   │   │   ├── InputAdvisor.jsx
│   │   │   ├── MarketPrices.jsx
│   │   │   ├── RiskAssessment.jsx
│   │   │   ├── SoilAnalysis.jsx
│   │   │   ├── CropRecommend.jsx
│   │   │   └── PestDetection.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── package.json
├── ml-service/
│   ├── models/
│   │   ├── crop_model.pkl
│   │   ├── label_encoder.pkl
│   │   └── soil_model.pkl
│   ├── routes/
│   │   ├── crop.py
│   │   ├── price.py
│   │   └── soil.py
│   ├── data/
│   │   └── soil_npk.json
│   └── main.py
├── PROJECT_DETAILS.md
└── README.md
```

---

## API Summary

### Reference API
- `GET /api/reference/expense-categories`
- `GET /api/reference/plan-crops`
- `GET /api/reference/seasons`
- `GET /api/reference/soil-database`
- `GET /api/reference/soil-presets`
- `GET /api/reference/crops`
- `GET /api/reference/input-crop-requirements`
- `POST /api/reference/safe-crops`
- `POST /api/reference/compute-risks`

### ML API (requires auth)
- `GET /api/ml/health`
- `POST /api/ml/predict/soil`
- `POST /api/ml/predict/crop`
- `POST /api/ml/predict/price`

### Expense API (requires auth)
- `GET /api/expenses`
- `POST /api/expenses`
- `POST /api/expenses/plan`

### Input Advisor API (requires auth)
- `GET /api/input-advisor/crops`
- `POST /api/input-advisor/recommend`
- `GET /api/input-advisor/inventory`
- `POST /api/input-advisor/inventory`

### Market API
- `GET /api/market/commodities`
- `GET /api/market/commodity/:commodity`

### Auth API
- `POST /api/auth/register`
- `POST /api/auth/login`

---

## Status Summary

| Feature | Data Source | Logic Type | Status |
|---------|-------------|------------|--------|
| Soil Analysis | Backend API + ML Service | ML-based | ✅ Complete |
| Crop Recommendation | Backend API + ML Service | ML-based | ✅ Complete |
| Weather Forecast | External API | External API | ✅ Complete |
| Market Prices | External APIs | External API + Scraping | ✅ Complete |
| Risk Assessment | Backend API | Rule-based (centralized) | ✅ Complete |
| Expense Tracker | Backend API + MongoDB | CRUD | ✅ Complete |
| Input Advisor | Backend API + MongoDB | Rule-based | ✅ Complete |
| Pest Detection | - | - | ⏳ Incomplete |

---

## Last Updated
May 21, 2026

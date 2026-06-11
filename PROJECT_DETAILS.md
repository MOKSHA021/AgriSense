# AgriSense - Comprehensive Project Details

> **Last Updated**: June 11, 2026
> This document describes the current AgriSense implementation with the Java Spring Boot backend as the authoritative backend service.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Project Structure](#4-project-structure)
5. [Frontend Implementation](#5-frontend-implementation)
6. [Java Backend Implementation](#6-java-backend-implementation)
7. [ML Service Implementation](#7-ml-service-implementation)
8. [Feature Workflows](#8-feature-workflows)
9. [Database Models](#9-database-models)
10. [API Reference](#10-api-reference)
11. [Environment Variables](#11-environment-variables)
12. [Running the Project](#12-running-the-project)
13. [Current Status](#13-current-status)

---

## 1. Project Overview

AgriSense is a full-stack agricultural intelligence platform for farmers. It provides:

- Soil image classification and GPS-based soil information
- Crop recommendations based on soil and weather conditions
- Agricultural weather forecasts and risk assessment
- Mandi discovery, live crop prices, and price forecasting
- Expense tracking and crop-season planning
- Fertilizer, seed, and input recommendations
- JWT authentication with email OTP verification

The application consists of three active services:

1. React frontend on port `5173`
2. Java Spring Boot backend on port `5000`
3. Python FastAPI ML service on port `8000`

MongoDB stores users, expenses, selected crops, and input inventory.

---

## 2. Technology Stack

### Frontend

| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 19 + Vite | Component-based user interface |
| Routing | React Router | Public and protected page routing |
| State | React Context API | Authentication and language state |
| HTTP | Axios | Calls the Java backend and injects JWT headers |
| Styling | CSS | Responsive dark UI and animations |
| Maps | Leaflet / React Leaflet | Mandi and route visualization |
| Internationalization | Custom LanguageProvider | Multilingual labels and content |

### Java Backend

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Java 17 | Backend runtime |
| Framework | Spring Boot 3.2.5 | REST API and application lifecycle |
| Web | Spring MVC | Controllers, multipart requests, and JSON responses |
| Security | Spring Security | Stateless route protection and CORS |
| Authentication | JJWT 0.12.5 | JWT creation and validation |
| Passwords | BCryptPasswordEncoder | Password hashing and comparison |
| Database | MongoDB | Persistent application data |
| Data Access | Spring Data MongoDB | Documents, repositories, indexes, and auditing |
| Rate Limiting | Bucket4j | Per-IP token bucket for `/api/**` |
| HTTP Client | RestTemplate | FastAPI, Brevo, and data.gov.in requests |
| Scraping | Jsoup | todaypricerates.com HTML parsing |
| Email | Brevo REST API | OTP email delivery |
| Build | Maven | Dependency management, compilation, and startup |
| Boilerplate | Lombok | Model getters, setters, and constructors |

### ML Service

| Layer | Technology | Purpose |
|---|---|---|
| Framework | FastAPI | ML HTTP endpoints |
| Server | Uvicorn | ASGI server |
| Deep Learning | PyTorch + torchvision | EfficientNet-B0 soil classifier |
| Machine Learning | scikit-learn | Crop recommendation pipeline |
| Forecasting | Prophet | Crop price forecasting |
| Data | Pandas + NumPy | Dataset and forecast processing |
| Images | Pillow | Soil image decoding |
| Serialization | joblib | Model artifact loading |

### External Services

| Service | Usage |
|---|---|
| Open-Meteo | Weather and forecast data |
| ISRIC SoilGrids | GPS-based soil properties |
| data.gov.in | Agmarknet mandi records |
| todaypricerates.com | Live-price fallback scraped with Jsoup |
| OpenStreetMap Nominatim | Location and mandi geocoding |
| Brevo | OTP email delivery |

---

## 3. System Architecture

```text
React + Vite (5173)
        |
        | Axios, JSON/multipart, Bearer JWT
        v
Spring Boot Java Backend (5000)
        |
        +---- Spring Security + JwtAuthFilter
        +---- Bucket4j rate limiting
        +---- Spring Data MongoDB ----------> MongoDB (27017)
        +---- RestTemplate -----------------> FastAPI ML Service (8000)
        +---- RestTemplate -----------------> data.gov.in / Brevo
        +---- Jsoup ------------------------> todaypricerates.com

Frontend direct calls:
        +---- Open-Meteo
        +---- ISRIC SoilGrids
        +---- OpenStreetMap Nominatim
```

### Request Flow

```text
Frontend
  -> http://localhost:5000/api
  -> Spring controller
  -> security and validation
  -> MongoDB, external API, or FastAPI
  -> JSON response
  -> frontend state and UI
```

The frontend does not need to call FastAPI directly. ML requests are proxied through `MlProxyController`.

---

## 4. Project Structure

```text
AgriSense/
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- services/api.js
|   |   |-- translations/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- package.json
|   `-- vite.config.js
|
|-- backend-java/
|   |-- src/main/java/com/agrisense/backend/
|   |   |-- AgriSenseApplication.java
|   |   |-- config/
|   |   |   |-- AppConfig.java
|   |   |   |-- SecurityConfig.java
|   |   |   `-- WebConfig.java
|   |   |-- controller/
|   |   |   |-- AuthController.java
|   |   |   |-- ExpensesController.java
|   |   |   |-- InputAdvisorController.java
|   |   |   |-- MarketController.java
|   |   |   |-- MlProxyController.java
|   |   |   `-- ReferenceController.java
|   |   |-- interceptor/RateLimitInterceptor.java
|   |   |-- model/
|   |   |   |-- User.java
|   |   |   |-- ExpenseRecord.java
|   |   |   |-- InputInventory.java
|   |   |   `-- ChosenCrop.java
|   |   |-- repository/
|   |   |-- security/
|   |   |   |-- AgriSensePrincipal.java
|   |   |   |-- JwtAuthFilter.java
|   |   |   `-- JwtUtil.java
|   |   |-- service/
|   |   |   |-- DataGovService.java
|   |   |   |-- EmailService.java
|   |   |   |-- InputInventorySeeder.java
|   |   |   `-- ScraperService.java
|   |   `-- store/OtpStore.java
|   |-- src/main/resources/application.properties
|   |-- pom.xml
|   `-- start.ps1
|
|-- ml-service/
|   |-- routes/
|   |   |-- crop.py
|   |   |-- price.py
|   |   |-- reference.py
|   |   `-- soil.py
|   |-- train/
|   |-- models/
|   |-- reports/
|   |-- main.py
|   `-- requirements.txt
|
|-- docs/
|-- run-logs/
|-- PROJECT_DETAILS.md
`-- README.md
```

---

## 5. Frontend Implementation

### API Client

`frontend/src/services/api.js` creates the shared Axios client:

```javascript
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 30000,
});
```

The request interceptor reads `agrisense_user` from local storage and adds:

```http
Authorization: Bearer <jwt>
```

### Main Pages

| Page | Purpose |
|---|---|
| `LandingPage.jsx` | Public product overview |
| `Login.jsx` | User login |
| `Register.jsx` | Registration and OTP request |
| `VerifyOTP.jsx` | OTP verification |
| `Dashboard.jsx` | Authenticated home |
| `SoilAnalysis.jsx` | Soil image prediction |
| `CropRecommend.jsx` | Crop recommendation |
| `Weather.jsx` | Weather dashboard |
| `RiskAssessment.jsx` | Weather-based agricultural risks |
| `BestMandi.jsx` | Mandi ranking and map |
| `LivePricesDashboard.jsx` | Current market prices |
| `PriceForecast.jsx` | ML price forecast |
| `ExpenseTracker.jsx` | Expense and crop-plan management |
| `InputAdvisor.jsx` | Input quantities, sellers, and cost |

---

## 6. Java Backend Implementation

### 6.1 Application Startup

`AgriSenseApplication.java` is the Spring Boot entry point.

Configuration is loaded from `application.properties` and environment variables. The default backend port is `5000`.

`start.ps1`:

1. Loads `backend-java/.env` when present.
2. Defaults `PORT` to `5000`.
3. Runs `mvn spring-boot:run`.

### 6.2 Security

`SecurityConfig.java` configures:

- Stateless Spring Security sessions
- Disabled CSRF for the REST API
- Configurable CORS origins
- Public authentication endpoints
- Public reference endpoints
- Public `/api/ml/health` and `/api/ml/status`
- JWT authentication for protected endpoints

`JwtAuthFilter.java` reads the Bearer token, validates it with `JwtUtil`, and creates an `AgriSensePrincipal`.

`JwtUtil.java` signs tokens with HS256-compatible key material and a default seven-day expiration.

### 6.3 Rate Limiting

`RateLimitInterceptor.java` uses Bucket4j:

- Scope: all `/api/**` requests
- Capacity: 100 requests per IP
- Refill interval: 15 minutes
- Rejection status: HTTP `429`

`WebConfig.java` registers the interceptor and enables MongoDB auditing.

### 6.4 Authentication and OTP

`AuthController.java` provides:

- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `POST /api/auth/login`
- `POST /api/auth/resend-otp`

Registration flow:

1. Validate name, email, and password.
2. Hash the password with BCrypt.
3. Store temporary registration data in `OtpStore`.
4. Generate a six-digit OTP with a ten-minute TTL.
5. Send the OTP through `EmailService` and Brevo.
6. Verify the OTP, create the MongoDB user, and return a JWT.

`OtpStore.java` uses thread-safe `ConcurrentHashMap` instances and scheduled expiry. It is process-local memory, so pending OTPs are lost when the Java backend restarts.

### 6.5 ML Proxy

`MlProxyController.java` proxies requests to `ML_SERVICE_URL`, defaulting to `http://localhost:8000`.

| Java Endpoint | FastAPI Endpoint |
|---|---|
| `POST /api/ml/predict/soil` | `POST /predict/soil` |
| `POST /api/ml/predict/crop` | `POST /predict/crop` |
| `POST /api/ml/predict/price` | `POST /predict/price` |
| `GET /api/ml/health` | `GET /` |
| `GET /api/ml/status` | `GET /models/status` |

The shared `RestTemplate` has a 3-second connection timeout and a 30-second read timeout. Connection failures return a clear HTTP `503` response.

### 6.6 Market Data

`MarketController.java` provides:

- District lookup
- Live prices
- Best mandi ranking
- Rule/statistics-based market price prediction

`DataGovService.java` calls data.gov.in using `RestTemplate`.

`ScraperService.java` uses Jsoup as the live-price fallback. It parses static price-table HTML from todaypricerates.com and returns normalized commodity, unit, mandi price, range, trend, date, and source fields.

### 6.7 Reference Data

`ReferenceController.java` centralizes:

- Expense categories
- Plan crops and seasons
- Soil descriptions and presets
- Crop reference data
- Input requirements
- Weather risk rules
- Safe-crop rules
- Chosen-crop persistence and district counts

Static reference endpoints are public. User-specific chosen-crop endpoints require JWT authentication.

### 6.8 Expenses

`ExpensesController.java` stores one `ExpenseRecord` document per user.

Supported operations:

- Load or create the user's expense record
- Add an expense
- Delete one expense
- Clear expenses
- Update the crop plan with `PUT` or `POST /api/expenses/plan`

### 6.9 Input Advisor

`InputAdvisorController.java` exposes:

- `GET /api/input-advisor/crops`
- `POST /api/input-advisor/recommend`

The recommendation endpoint:

1. Looks up per-acre requirements for the selected crop.
2. Multiplies requirements by the requested area.
3. Queries MongoDB seller inventory.
4. Scores sellers by stock, location, price, and distance.
5. Returns up to three sellers per input and the total estimated cost.

`InputInventorySeeder.java` seeds demonstration seller records when required.

### 6.10 Email Service

`EmailService.java` sends OTP messages through the Brevo REST API. Configuration comes from:

- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `brevo.sender-name`

---

## 7. ML Service Implementation

### FastAPI App

`ml-service/main.py`:

- Configures file and console logging
- Creates the FastAPI app
- Registers CORS
- Includes soil, crop, price, and reference routers
- Exposes health and model-status endpoints
- Reports missing model artifacts without crashing the whole service

### Soil Classification

`routes/soil.py` uses EfficientNet-B0 with seven soil classes:

- Alluvial
- Arid
- Black
- Laterite
- Mountain
- Red
- Yellow

The service prefers `models/soil_model_best.pt` and falls back to `models/soil_model.pt`.

If neither checkpoint exists, FastAPI still starts and `/predict/soil` returns HTTP `503` with a clear training instruction.

### Crop Recommendation

`routes/crop.py` uses:

- `models/crop_model.pkl`
- `models/label_encoder.pkl`
- Soil NPK and pH reference values

The full model path uses a scikit-learn pipeline and returns ranked crop probabilities. Built-in soil defaults allow the endpoint contract to remain available when the external soil reference JSON is absent.

### Price Forecast

`routes/price.py` lazily loads `prophet_<CropName>.pkl` files and forecasts:

- Wheat
- Rice
- Maize
- Mustard
- Tomato
- Potato
- Onion

The model output is converted from the training `log1p` scale using `expm1`.

---

## 8. Feature Workflows

### Soil Analysis

```text
SoilAnalysis.jsx
  -> POST /api/ml/predict/soil
  -> MlProxyController
  -> FastAPI /predict/soil
  -> EfficientNet prediction
  -> soil type, confidence, and score map
```

GPS soil properties are fetched directly by the frontend from ISRIC SoilGrids.

### Crop Recommendation

```text
CropRecommend.jsx
  -> Java reference endpoints for crop and soil data
  -> POST /api/ml/predict/crop
  -> MlProxyController
  -> FastAPI Random Forest pipeline
  -> ranked crop recommendations
```

### Market Intelligence

```text
BestMandi / LivePrices
  -> MarketController
  -> data.gov.in
  -> Jsoup fallback when required
  -> normalized market response
```

Mandi geocoding and map rendering happen in the frontend.

### Expense Tracker

```text
ExpenseTracker.jsx
  -> JWT-protected ExpensesController
  -> ExpenseRecordRepository
  -> MongoDB expenserecords collection
```

### Input Advisor

```text
InputAdvisor.jsx
  -> GET /api/input-advisor/crops
  -> POST /api/input-advisor/recommend
  -> requirement calculation + MongoDB seller ranking
  -> quantities, sellers, availability, and total cost
```

---

## 9. Database Models

### User

File: `backend-java/src/main/java/com/agrisense/backend/model/User.java`

Collection: `users`

| Field | Type | Notes |
|---|---|---|
| `id` | String | MongoDB ID |
| `name` | String | Display name |
| `email` | String | Unique indexed email |
| `password` | String | BCrypt hash |
| `isVerified` | boolean | OTP verification state |
| `createdAt` | LocalDateTime | Audited |
| `updatedAt` | LocalDateTime | Audited |

### ExpenseRecord

File: `backend-java/src/main/java/com/agrisense/backend/model/ExpenseRecord.java`

Collection: `expenserecords`

One document is stored per user. It contains:

- Unique `user` ID
- Crop plan
- Expense item list
- Created and updated timestamps

### InputInventory

File: `backend-java/src/main/java/com/agrisense/backend/model/InputInventory.java`

Collection: `inputinventories`

Stores crop/input name, quantity per acre, seller, district, state, distance, price, stock, phone, and source.

### ChosenCrop

File: `backend-java/src/main/java/com/agrisense/backend/model/ChosenCrop.java`

Collection: `chosencrops`

Stores one chosen crop and district per user.

---

## 10. API Reference

### Authentication

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/verify-otp` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/resend-otp` | Public |

### ML Proxy

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/ml/health` | Public |
| GET | `/api/ml/status` | Public |
| POST | `/api/ml/predict/soil` | JWT |
| POST | `/api/ml/predict/crop` | JWT |
| POST | `/api/ml/predict/price` | JWT |

### Market

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/market/districts` | JWT |
| GET | `/api/market/live-prices` | JWT |
| POST | `/api/market/best-mandis` | JWT |
| POST | `/api/market/predict` | JWT |

### Expenses

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/expenses` | JWT |
| POST | `/api/expenses` | JWT |
| DELETE | `/api/expenses/{id}` | JWT |
| DELETE | `/api/expenses` | JWT |
| DELETE | `/api/expenses/clear` | JWT |
| PUT or POST | `/api/expenses/plan` | JWT |

### Input Advisor

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/api/input-advisor/crops` | JWT |
| POST | `/api/input-advisor/recommend` | JWT |

### Reference

Public reference endpoints include:

- `/api/reference/expense-categories`
- `/api/reference/plan-crops`
- `/api/reference/seasons`
- `/api/reference/soil-database`
- `/api/reference/soil-presets`
- `/api/reference/crops`
- `/api/reference/input-crop-requirements`
- `/api/reference/compute-risks`
- `/api/reference/safe-crops`
- `/api/reference/district-crop-counts`

Chosen-crop write/read endpoints require JWT authentication.

### FastAPI Direct

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Health |
| GET | `/models/status` | Available model artifacts |
| GET | `/docs` | Swagger UI |
| POST | `/predict/soil` | Soil image classification |
| POST | `/predict/crop` | Crop recommendation |
| POST | `/predict/price` | Price forecast |

---

## 11. Environment Variables

### Java Backend

File: `backend-java/.env`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/agrisense
JWT_SECRET=replace_with_a_secure_secret
ML_SERVICE_URL=http://localhost:8000
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

DATA_GOV_API_KEY=
DATA_GOV_RESOURCE_ID=35985678-0d79-46b4-9ed6-6f13308a1d24

BREVO_API_KEY=
BREVO_SENDER_EMAIL=agrisense@example.com
```

### Frontend

File: `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### ML Service

```env
ALLOWED_ORIGINS=http://localhost:5000,http://localhost:5173
```

---

## 12. Running the Project

### 1. MongoDB

Start MongoDB on:

```text
mongodb://localhost:27017/agrisense
```

### 2. ML Service

```powershell
cd C:\Agri\AgriSense\ml-service
python -m pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
```

Health:

```text
http://localhost:8000/
```

### 3. Java Backend

```powershell
cd C:\Agri\AgriSense\backend-java
.\start.ps1
```

Equivalent Maven command:

```powershell
mvn spring-boot:run
```

ML connection checks:

```text
http://localhost:5000/api/ml/health
http://localhost:5000/api/ml/status
```

### 4. Frontend

```powershell
cd C:\Agri\AgriSense\frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 13. Current Status

| Feature | Java Backend Component | Status |
|---|---|---|
| Authentication | `AuthController`, `JwtAuthFilter`, `OtpStore` | Complete |
| MongoDB persistence | Models and Spring Data repositories | Complete |
| Soil proxy | `MlProxyController` | Complete; trained checkpoint required for inference |
| Crop recommendation proxy | `MlProxyController` | Complete |
| Price forecast proxy | `MlProxyController` | Complete |
| ML health/status | `MlProxyController` | Complete |
| Market and mandi data | `MarketController`, `DataGovService` | Complete |
| Live-price fallback | `ScraperService` with Jsoup | Complete |
| Risk and reference data | `ReferenceController` | Complete |
| Expense tracker | `ExpensesController` | Complete |
| Input advisor | `InputAdvisorController`, inventory seeder | Complete |
| Rate limiting | `RateLimitInterceptor` | Complete |
| Pest detection | No active Java endpoint/model | Incomplete |

---

*AgriSense is built with React, Java Spring Boot, FastAPI, MongoDB, PyTorch, scikit-learn, and Prophet.*

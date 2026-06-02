# 🌱 AgriSense: AI-Powered Agricultural Management System

Welcome to **AgriSense**, a comprehensive, intelligent agricultural management platform designed to empower farmers with data-driven insights. AgriSense leverages Machine Learning, real-time APIs, and advanced analytics to optimize crop yields, assess environmental risks, predict market prices, and manage farming expenses.

---

## ✨ Key Features

### 🔬 Intelligent Soil Analysis & Crop Recommendation
* **ML Soil Classification**: Upload a photo of your soil, and our EfficientNet-B0 model will classify it and provide physical characteristics.
* **GPS Soil Data integration**: Direct integration with ISRIC SoilGrids API to pull accurate soil compositions based on your coordinates.
* **Crop Recommendations**: A Random Forest ML model suggests the top 5 most profitable crops based on your soil's NPK levels, pH, temperature, and rainfall.

### 🌤️ Weather Forecasting & Risk Assessment
* **Live Weather Data**: Real-time tracking and 5-day forecasts via Open-Meteo.
* **Dynamic Risk Alerts**: Rule-based backend logic analyzes upcoming weather to warn you of impending Floods, Droughts, Heat Stress, or Frost.
* **Safe Crop Suggester**: Recommends resilient crops based on your current active weather risks.

### 📈 Market Insights & Price Prediction
* **Live Mandi Prices**: Scrapes daily commodity prices from `data.gov.in` and `todaypricerates.com`.
* **Best Mandi Locator**: Uses OpenStreetMap Nominatim geocoding to find the nearest and most profitable markets for your produce.
* **Price Forecasting**: ML Time-Series Prediction (Prophet model) helps you decide the best time to sell your harvest.

### 💰 Expense Tracking & Input Advisor
* **Financial Management**: Track seed, fertilizer, pesticide, and labor costs season by season.
* **Input Requirements**: Get precise quantity recommendations for seeds and fertilizers (DAP, Urea, MOP) based on your specific crop.

---

## 🛠️ Technology Stack

AgriSense uses a modern, modular architecture split into three distinct layers:

**1. Frontend (User Interface)**
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4
- **Maps**: Leaflet & React-Leaflet
- **Icons**: Lucide-React

**2. Backend (API & Business Logic)**
- **Environment**: Node.js & Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Role**: Centralizes rule-based logic (Risk Assessment) and manages the Expense/User database.

**3. ML Service (Prediction Engine)**
- **Framework**: Python FastAPI
- **Models**: Scikit-Learn (Random Forest), Prophet (Time-series), EfficientNet-B0 (Image Classification)

---

## 🚀 Getting Started

Follow these instructions to get the AgriSense environment up and running on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (3.9+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/AgriSense.git
cd AgriSense
```

### 2. Setup the Backend (Node.js/Express)
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agrisense
ML_SERVICE_URL=http://localhost:8000
DATA_GOV_RESOURCE_ID=your_resource_id
DATA_GOV_API_KEY=your_api_key
JWT_SECRET=your_super_secret_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the ML Service (Python/FastAPI)
Open a new terminal window:
```bash
cd ml-service
pip install -r requirements.txt
```
Start the ML service:
```bash
uvicorn main:app --reload --port 8000
```

### 4. Setup the Frontend (React/Vite)
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000
```
Start the development server:
```bash
npm run dev
```

The application will now be running at `http://localhost:5173`.

---

## 📂 Project Structure

```text
AgriSense/
├── backend/            # Express.js server, MongoDB models, reference APIs
├── frontend/           # React application, Tailwind styling, UI components
├── ml-service/         # FastAPI server, pre-trained .pkl models, dataset logic
└── PROJECT_DETAILS.md  # Detailed architectural diagrams and endpoint documentation
```

---

## 🗺️ Roadmap & Future Improvements

- [ ] **Pest Detection**: Complete the integration of the ML image classifier to detect common crop diseases and pests.
- [ ] **Dynamic Reference Data**: Migrate static agricultural reference data (Soil presets, Crop NPK values) from the backend directly into MongoDB for easier admin updates.
- [ ] **ML Risk Assessment**: Replace the current rule-based risk calculation with a trained machine learning model based on historical climate damage data.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/AgriSense/issues).

---
*Built to empower the future of farming.* 🌾
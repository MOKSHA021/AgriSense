# AgriSense — Smart Farming Intelligence Platform
## Technical Architecture & Implementation Deep-Dive

This document provides a comprehensive, interview-ready breakdown of every technology, architecture decision, and feature implemented in AgriSense. For each component, it details **What it is**, **Why it was chosen** over alternatives, and **How it was implemented** in the codebase.

---

## 1. Core Technologies

### React
* **What it is:** A declarative, component-based JavaScript library for building user interfaces.
* **Why I chose it:** React's virtual DOM provides the high-performance rendering required for dynamic, data-heavy dashboards (like live market prices and weather updates). Its component architecture allowed me to build reusable UI elements (e.g., standardizing charts and forms) across the application. It's much lighter than Angular for this scale and more maintainable than Vanilla JS.
* **How I did it:** Used Vite to scaffold the application for faster hot-module replacement during development. The app is divided into modular page components (`Dashboard.jsx`, `SoilAnalysis.jsx`, etc.) and reusable functional components (`Navbar.jsx`, `WeatherSidePanel.jsx`). State is managed primarily via React Hooks (`useState`, `useEffect`) and Context API for global state.

### Node.js (with Express)
* **What it is:** An asynchronous, event-driven JavaScript runtime environment and a minimal, flexible web application framework.
* **Why I chose it:** Node.js excels at highly concurrent, I/O-bound operations. It serves as an excellent API Gateway to handle authentication, routing, and database queries without blocking. Using JavaScript on both the frontend and backend reduced context switching and development time compared to using Java Spring Boot or Django for the core API.
* **How I did it:** Set up an Express server (`backend/server.js`) with middleware for CORS, JSON parsing, and custom error handling. The backend is structured using an MVC-like pattern with isolated controllers and routes (e.g., `marketController.js`, `routes/market.js`) for clean separation of concerns.

### FastAPI (Python)
* **What it is:** A modern, fast (high-performance) web framework for building APIs with Python 3.7+ based on standard Python type hints.
* **Why I chose it:** I needed a dedicated service to handle heavy Machine Learning inference, which would block the single-threaded Node.js event loop. Python is the industry standard for ML. FastAPI was chosen over Flask because it is natively asynchronous, significantly faster, and automatically generates interactive API documentation (Swagger/OpenAPI).
* **How I did it:** Created a standalone `ml-service` directory. Endpoints like `POST /predict/soil` and `POST /predict/crop` parse incoming JSON or multipart form data, run the loaded scikit-learn or PyTorch models, and return the predictions.

### PyTorch (EfficientNet-B0)
* **What it is:** An open-source machine learning framework (PyTorch) running a specific convolutional neural network architecture (EfficientNet-B0) optimized for image classification.
* **Why I chose it:** EfficientNet-B0 provides state-of-the-art accuracy for image classification while using significantly fewer parameters than older models like ResNet or VGG. This was critical for keeping inference times low and resource consumption minimal in a microservice environment.
* **How I did it:** The model was trained on a dataset of soil images to classify soil types based on visual characteristics. The trained weights are loaded into the FastAPI service. When a user uploads a soil image via the React frontend, Node.js proxies it to FastAPI, where PyTorch processes the image tensor and returns the classified soil type and confidence score.

### scikit-learn (Random Forest)
* **What it is:** A widely used machine learning library in Python. Random Forest is an ensemble learning method that constructs a multitude of decision trees for classification or regression.
* **Why I chose it:** Random Forest excels at handling tabular, non-linear data (like NPK levels, pH, and climate data) common in agriculture. It is highly resistant to overfitting and provides excellent interpretability (feature importance), which deep learning "black boxes" lack.
* **How I did it:** The model (`crop_model.pkl`) was trained on agricultural datasets mapping soil and climate metrics to optimal crops. In FastAPI (`routes/crop.py`), the model takes parameters from the Node.js API (temperature, humidity, rainfall, soil type) and outputs the top 5 recommended crops.

### MongoDB
* **What it is:** A flexible, NoSQL document database that stores data in JSON-like BSON formats.
* **Why I chose it:** Agricultural data can be highly dynamic. A rigid relational database (like PostgreSQL) would require frequent schema migrations if we wanted to add new fields to crops, user profiles, or market tracking. MongoDB's flexible schema is perfectly suited for rapidly prototyping and scaling these dynamic features.
* **How I did it:** Integrated via the Mongoose ODM in the Node.js backend. Created structured schemas and models (e.g., `ExpenseRecord.js`, `InputInventory.js`, `User.js`) to validate data before persisting it, ensuring a degree of data integrity within the NoSQL environment.

### Redis (Concepts applied via TTL/In-Memory Cache)
* **What it is:** An in-memory data structure store used as a database, cache, message broker, and streaming engine.
* **Why I chose it:** Standard databases are too slow for highly ephemeral, frequently accessed data like One-Time Passwords (OTPs) or active session states. An in-memory store prevents unnecessary disk reads/writes and automatically expires stale data, enhancing security and performance.
* **How I did it:** Implemented an in-memory session/OTP store utilizing Time-To-Live (TTL) mechanisms to mimic Redis behavior. This securely caches OTPs during the login/registration flow and automatically purges them upon expiration, protecting against replay attacks without bloating the primary MongoDB database.

---

## 2. Key Architectural Decisions & Features

### Decoupled Node.js and FastAPI Microservice Architecture
* **What it is:** Splitting the backend into two distinct services: Node.js for standard web traffic/CRUD operations, and FastAPI for computationally heavy tasks.
* **Why I chose it:** Node.js runs on a single thread. If I ran heavy PyTorch image classification directly in Node.js, it would block the event loop, causing all other users to experience severe lag. Decoupling ensures the core API remains highly responsive.
* **How I did it:** The React frontend only communicates with the Node.js API. For ML tasks, Node.js acts as a secure proxy, forwarding the necessary data to the isolated FastAPI service (e.g., via `http://localhost:8000/predict/crop`), awaiting the result, and returning it to the client.

### React Context API for JWT State Management
* **What it is:** Using React's built-in Context API to store and distribute JSON Web Tokens (JWT) and user authentication state globally across the application.
* **Why I chose it:** Prop drilling (passing auth state down through every component layer) is unmaintainable. While Redux is powerful, it is too boilerplate-heavy for simple auth state. Context API provides a lightweight, native solution to make user state accessible anywhere.
* **How I did it:** Created an `AuthContext` provider wrapping the application root. Upon successful login, the Node.js API returns a JWT. This token is stored in the Context state (and `localStorage` for persistence), allowing components like `Navbar` or protected routes to instantly verify if a user is authenticated.

### Leaflet.js for Mapping Optimal Markets
* **What it is:** An open-source JavaScript library for mobile-friendly interactive maps.
* **Why I chose it:** I needed a way to visually display the best agricultural markets (Mandis) based on the user's location. Google Maps API is expensive and proprietary. Leaflet is free, lightweight, highly customizable, and integrates smoothly with React.
* **How I did it:** In `BestMandi.jsx`, the user's location is geocoded using the OpenStreetMap Nominatim API. Leaflet map components are rendered, placing interactive markers on the calculated optimal markets, allowing farmers to visually plan their logistics.

### Prophet Time-Series Model for Price Forecasting
* **What it is:** A procedure developed by Facebook's Core Data Science team for forecasting time series data based on an additive model where non-linear trends are fit with yearly, weekly, and daily seasonality.
* **Why I chose it:** Agricultural prices are heavily influenced by seasonal trends (harvest times, monsoons). Standard linear regression fails to capture this seasonality. Prophet is robust to missing data, handles outliers well, and is specifically designed to model strong seasonal effects natively.
* **How I did it:** The model is hosted in the FastAPI service (`price.py`). It takes historical price data scraped from the backend, fits the Prophet model, and returns a forecasted trend line (with confidence intervals) to the frontend, visualized in `PriceForecast.jsx`.

### MongoDB Expense Tracker
* **What it is:** A dedicated feature module for farmers to log, categorize, and track their agricultural expenditures.
* **Why I chose it:** Farmers need financial visibility to ensure profitability. Building a custom tracker tailored to agricultural categories (seeds, fertilizers, labor) provides immediate value over generic expense apps.
* **How I did it:** Implemented standard CRUD operations in Node.js (`routes/expenses.js`). Expenses are saved in MongoDB using the `ExpenseRecord` schema. The React frontend (`ExpenseTracker.jsx`) queries these records and visualizes spending breakdowns over time.

### Resilient Cheerio Web-Scraping Fallback
* **What it is:** Using Cheerio (a fast, flexible, and lean implementation of core jQuery) to scrape HTML from live market websites when official APIs fail.
* **Why I chose it:** Official government APIs (like data.gov.in) can be unreliable, rate-limited, or delayed. To ensure farmers always have access to live prices, a fallback mechanism was necessary. Cheerio is vastly faster and less resource-intensive than headless browsers like Puppeteer.
* **How I did it:** In `marketController.js`, the system first attempts to fetch JSON from the primary API. If it times out or fails, a fallback function uses `axios` to fetch the HTML of portals like `todaypricerates.com`, and `cheerio` parses the DOM to extract the current commodity prices, normalizing the data before sending it to the frontend.

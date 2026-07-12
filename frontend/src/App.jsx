import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./translations";
import ProtectedRoute from "./components/core/ProtectedRoute";
import AnimatedBackground from "./components/layout/AnimatedBackground";

import LandingPage from "./pages/core/LandingPage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyOTP from "./pages/auth/VerifyOTP";
import Dashboard from "./pages/core/Dashboard";

import SoilAnalysis from "./pages/agriculture/SoilAnalysis";       // ← NEW: dedicated soil page
import CropRecommend from "./pages/agriculture/CropRecommend";
import BestMandi from "./pages/market/BestMandi";
import LivePricesDashboard from "./pages/market/LivePricesDashboard";
import PriceForecast from "./pages/market/PriceForecast";
import RiskAssessment from "./pages/core/RiskAssessment";
import ExpenseTracker from "./pages/finance/ExpenseTracker";
import Weather from "./pages/core/Weather";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AnimatedBackground />
        <BrowserRouter>
          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />

            {/* ── Protected Dashboard ── */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* ── ML Feature Pages ── */}
            <Route path="/dashboard/soil"          element={<ProtectedRoute><SoilAnalysis /></ProtectedRoute>} />
            <Route path="/dashboard/recommend"     element={<ProtectedRoute><CropRecommend /></ProtectedRoute>} />
            <Route path="/dashboard/weather"       element={<ProtectedRoute><Weather /></ProtectedRoute>} />
            <Route path="/dashboard/risk"          element={<ProtectedRoute><RiskAssessment /></ProtectedRoute>} />

            {/* ── Market Pages ── */}
            <Route path="/dashboard/best-mandi"    element={<ProtectedRoute><BestMandi /></ProtectedRoute>} />
            <Route path="/dashboard/live-prices"   element={<ProtectedRoute><LivePricesDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/price-forecast"element={<ProtectedRoute><PriceForecast /></ProtectedRoute>} />

            {/* ── Finance ── */}
            <Route path="/dashboard/expenses"      element={<ProtectedRoute><ExpenseTracker /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

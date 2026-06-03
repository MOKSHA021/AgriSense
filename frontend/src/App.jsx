import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AnimatedBackground from "./components/AnimatedBackground";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import Dashboard from "./pages/Dashboard";

import SoilAnalysis from "./pages/SoilAnalysis";       // ← NEW: dedicated soil page
import CropRecommend from "./pages/CropRecommend";
import BestMandi from "./pages/BestMandi";
import LivePricesDashboard from "./pages/LivePricesDashboard";
import PriceForecast from "./pages/PriceForecast";
import RiskAssessment from "./pages/RiskAssessment";
import ExpenseTracker from "./pages/ExpenseTracker";
import Weather from "./pages/Weather";

function App() {
  return (
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
  );
}

export default App;

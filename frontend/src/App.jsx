import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOTP from "./pages/VerifyOTP";
import Dashboard from "./pages/Dashboard";
import SoilAnalysis from "./pages/SoilAnalysis";
import CropRecommend from "./pages/CropRecommend";
import Weather from "./pages/Weather";
import Market from "./pages/Market";
import RiskAssessment from "./pages/RiskAssessment";
import ExpenseTracker from "./pages/ExpenseTracker";
import InputAdvisor from "./pages/InputAdvisor";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/soil" element={<ProtectedRoute><SoilAnalysis /></ProtectedRoute>} />
          <Route path="/dashboard/recommend" element={<ProtectedRoute><CropRecommend /></ProtectedRoute>} />
          <Route path="/dashboard/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
          <Route path="/dashboard/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
          <Route path="/dashboard/risk" element={<ProtectedRoute><RiskAssessment /></ProtectedRoute>} />
          <Route path="/dashboard/expenses" element={<ProtectedRoute><ExpenseTracker /></ProtectedRoute>} />
          <Route path="/dashboard/inputs" element={<ProtectedRoute><InputAdvisor /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

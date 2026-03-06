import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userName = user?.user?.name || user?.name || "Farmer";
  const initials = userName.charAt(0).toUpperCase();

  const navLinks = [
    { label: "Home",    icon: "🏠", path: "/dashboard" },
    { label: "Crops",   icon: "🌱", path: "/dashboard/recommend" },
    { label: "Market",  icon: "📊", path: "/dashboard/market" },
    { label: "Weather", icon: "🌦️", path: "/dashboard/weather" },
  ];

  const features = [
    {
      icon: "🌱",
      title: "Crop Recommendation",
      desc: "ML-powered crop suggestions based on your soil type, pH, and local weather patterns.",
      path: "/dashboard/recommend",
      gradient: "from-emerald-400 to-green-600",
      bg: "bg-gradient-to-br from-emerald-50 to-green-100",
      border: "border-emerald-200",
      btn: "bg-emerald-600 hover:bg-emerald-700",
      badge: "AI Powered",
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: "📊",
      title: "Market Prices",
      desc: "Live mandi prices and ML predictions for wheat, rice, tomato and 20+ crops.",
      path: "/dashboard/market",
      gradient: "from-amber-400 to-orange-500",
      bg: "bg-gradient-to-br from-amber-50 to-orange-100",
      border: "border-amber-200",
      btn: "bg-amber-500 hover:bg-amber-600",
      badge: "Live Data",
      badgeColor: "bg-amber-100 text-amber-700",
    },
    {
      icon: "🌦️",
      title: "Weather Insights",
      desc: "7-day hyper-local forecasts and smart alerts for sowing and harvesting windows.",
      path: "/dashboard/weather",
      gradient: "from-sky-400 to-blue-600",
      bg: "bg-gradient-to-br from-sky-50 to-blue-100",
      border: "border-sky-200",
      btn: "bg-sky-500 hover:bg-sky-600",
      badge: "Real-time",
      badgeColor: "bg-sky-100 text-sky-700",
    },
    {
      icon: "📋",
      title: "My Reports",
      desc: "All your past crop recommendations, price predictions and weather summaries.",
      path: "/dashboard/reports",
      gradient: "from-violet-400 to-purple-600",
      bg: "bg-gradient-to-br from-violet-50 to-purple-100",
      border: "border-violet-200",
      btn: "bg-violet-600 hover:bg-violet-700",
      badge: "History",
      badgeColor: "bg-violet-100 text-violet-700",
    },
  ];

  const stats = [
    { label: "Crops Analysed", value: "24+", icon: "🌾" },
    { label: "Price Predictions", value: "12", icon: "📈" },
    { label: "Weather Alerts", value: "3", icon: "⚡" },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-[#f4f7f4]">

      {/* ── Navbar ── */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow">
            <span className="text-lg">🌾</span>
          </div>
          <span className="text-lg font-extrabold text-green-800 tracking-tight">AgriSense</span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5
                ${location.pathname === link.path
                  ? "bg-green-100 text-green-800 font-semibold"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
            >
              <span>{link.icon}</span> {link.label}
            </button>
          ))}
        </div>

        {/* Right — Avatar + Logout */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <span className="text-sm font-medium text-green-800 hidden sm:block">{userName}</span>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 bg-red-50 text-red-500 font-medium rounded-xl hover:bg-red-100 border border-red-100 transition-all duration-200"
          >
            Logout
          </button>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-3 flex flex-col gap-2 shadow-md">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => { navigate(link.path); setMenuOpen(false); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-800 transition"
            >
              {link.icon} {link.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* ── Hero Banner ── */}
        <div className="relative bg-gradient-to-r from-green-700 via-emerald-600 to-teal-500 rounded-3xl p-8 text-white shadow-xl overflow-hidden">
          {/* Background blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 blur-2xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-green-200 text-sm font-medium mb-1">{greeting()}, 👋</p>
              <h1 className="text-3xl font-extrabold tracking-tight">{userName}!</h1>
              <p className="text-green-100 text-sm mt-2 max-w-md">
                Your smart farming assistant is ready. Check crop advice, market prices, or today's weather.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 flex-wrap">
              {stats.map((s) => (
                <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3 text-center min-w-[90px] border border-white/20">
                  <div className="text-xl">{s.icon}</div>
                  <div className="text-2xl font-bold mt-1">{s.value}</div>
                  <div className="text-green-200 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section Title ── */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">What do you need today?</h2>
          <p className="text-gray-400 text-sm mt-1">Choose a tool below to get started</p>
        </div>

        {/* ── Feature Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group ${f.bg} border ${f.border} rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col gap-4 cursor-pointer hover:-translate-y-1`}
              onClick={() => navigate(f.path)}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-2xl shadow-md`}>
                  {f.icon}
                </div>
                {/* Badge */}
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${f.badgeColor}`}>
                  {f.badge}
                </span>
              </div>

              {/* Text */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-gray-900">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">{f.desc}</p>
              </div>

              {/* Button */}
              <button
                className={`${f.btn} text-white text-sm font-semibold px-5 py-2.5 rounded-xl self-start shadow-sm transition-all duration-200 mt-auto`}
                onClick={(e) => { e.stopPropagation(); navigate(f.path); }}
              >
                Open →
              </button>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-xs text-gray-400 pb-4">
          🌾 AgriSense · Smart Farming Powered by AI · © {new Date().getFullYear()}
        </p>

      </main>
    </div>
  );
};

export default Dashboard;

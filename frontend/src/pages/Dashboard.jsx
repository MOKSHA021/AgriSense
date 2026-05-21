import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
  FlaskConical, Sprout, CloudSun, TrendingUp,
  ShieldAlert, Wallet, ShoppingCart, ArrowRight,
  Thermometer, Droplets, Wind, Cpu,
} from "lucide-react";

const features = [
  {
    icon: FlaskConical,
    title: "Soil Analysis",
    desc: "Detect soil type from photo using AI",
    path: "/dashboard/soil",
    badge: "AI Vision",
    gradient: "from-amber-500 to-yellow-600",
    glow: "shadow-amber-900/30",
    bg: "from-amber-500/10 to-yellow-500/5",
    border: "border-amber-500/20",
  },
  {
    icon: Sprout,
    title: "Crop Recommendation",
    desc: "ML model finds best crops for your land",
    path: "/dashboard/recommend",
    badge: "Random Forest",
    gradient: "from-green-500 to-emerald-600",
    glow: "shadow-green-900/30",
    bg: "from-green-500/10 to-emerald-500/5",
    border: "border-green-500/20",
  },
  {
    icon: CloudSun,
    title: "Weather Forecast",
    desc: "Live weather with farming-specific advice",
    path: "/dashboard/weather",
    badge: "Real-time",
    gradient: "from-blue-500 to-cyan-600",
    glow: "shadow-blue-900/30",
    bg: "from-blue-500/10 to-cyan-500/5",
    border: "border-blue-500/20",
  },
  {
    icon: TrendingUp,
    title: "Best Mandi Finder",
    desc: "Find nearest profitable market routes",
    path: "/dashboard/best-mandi",
    badge: "Best Route",
    gradient: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-900/30",
    bg: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-500/20",
  },
  {
    icon: TrendingUp,
    title: "Live Prices",
    desc: "Current mandi rates across India",
    path: "/dashboard/live-prices",
    badge: "Live Data",
    gradient: "from-pink-500 to-rose-600",
    glow: "shadow-pink-900/30",
    bg: "from-pink-500/10 to-rose-500/5",
    border: "border-pink-500/20",
  },
  {
    icon: TrendingUp,
    title: "Price Forecast",
    desc: "Prophet ML future price predictions",
    path: "/dashboard/price-forecast",
    badge: "Prophet ML",
    gradient: "from-indigo-500 to-violet-600",
    glow: "shadow-indigo-900/30",
    bg: "from-indigo-500/10 to-violet-500/5",
    border: "border-indigo-500/20",
  },
  {
    icon: ShieldAlert,
    title: "Risk Assessment",
    desc: "Flood, drought & heat alerts",
    path: "/dashboard/risk",
    badge: "Live Data",
    gradient: "from-red-500 to-orange-600",
    glow: "shadow-red-900/30",
    bg: "from-red-500/10 to-orange-500/5",
    border: "border-red-500/20",
  },
  {
    icon: Wallet,
    title: "Expense Tracker",
    desc: "Track costs vs predicted profit",
    path: "/dashboard/expenses",
    badge: "Finance",
    gradient: "from-purple-500 to-fuchsia-600",
    glow: "shadow-purple-900/30",
    bg: "from-purple-500/10 to-fuchsia-500/5",
    border: "border-purple-500/20",
  }
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const userName = user?.user?.name || user?.name || "Farmer";

  const [weather, setWeather] = useState(null);
  const [weatherCity, setWeatherCity] = useState("");

  // Fetch quick weather for header widget
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const [wr, gr] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`),
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, { headers: { "User-Agent": "AgriSense/1.0" } }),
        ]);
        const wd = await wr.json();
        const gd = await gr.json();
        setWeather(wd.current);
        setWeatherCity(gd.address?.city || gd.address?.town || gd.address?.village || "Your location");
      } catch { /* ignore */ }
    }, () => {});
  }, []);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 py-10">
          {/* ── Header Row ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-white/40 text-sm mb-1">{today}</p>
              <h1 className="text-3xl font-bold text-white">
                {getGreeting()},{" "}
                <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  {userName}
                </span>{" "}
                👋
              </h1>
              <p className="text-white/50 text-sm mt-1">What would you like to do today?</p>
            </div>

            {/* Weather widget */}
            {weather && (
              <div
                onClick={() => navigate("/dashboard/weather")}
                className="cursor-pointer flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4 hover:bg-black/60 transition-all shadow-lg min-w-[220px]"
              >
                <div className="text-4xl">
                  {weather.weather_code === 0 ? "☀️" : weather.weather_code <= 3 ? "⛅" : weather.weather_code <= 67 ? "🌧️" : "☁️"}
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{Math.round(weather.temperature_2m)}°C</p>
                  <p className="text-xs text-white/50">{weatherCity}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Droplets className="w-3 h-3" />{weather.relative_humidity_2m}%</span>
                    <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{Math.round(weather.wind_speed_10m)} km/h</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── ML Status Banner ── */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 mb-8 w-fit">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-300 font-medium">ML Service Active — Soil · Crop · Price models ready</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
          </div>

          {/* ── Feature Cards Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  onClick={() => navigate(f.path)}
                  className={`group relative bg-gradient-to-br ${f.bg} border ${f.border} rounded-2xl p-5 cursor-pointer hover:scale-[1.03] hover:shadow-xl ${f.glow} transition-all duration-300 overflow-hidden`}
                >
                  {/* Hover glow */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${f.bg} pointer-events-none`} />

                  <div className="relative">
                    {/* Icon */}
                    <div className={`w-10 h-10 bg-gradient-to-br ${f.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Badge */}
                    <span className="absolute top-0 right-0 text-[10px] font-semibold bg-white/10 border border-white/10 text-white/50 px-2 py-0.5 rounded-full">
                      {f.badge}
                    </span>

                    <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-white/50 leading-relaxed mb-4">{f.desc}</p>

                    <div className="flex items-center gap-1 text-xs text-white/40 group-hover:text-white/70 transition-colors">
                      <span>Open</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Quick Tips Footer ── */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: "🌱", tip: "Upload a soil photo to get instant ML-powered soil classification and crop recommendations." },
              { icon: "💹", tip: "Check the Market tab — Prophet AI can forecast crop prices up to 3 years ahead for 7 crops." },
              { icon: "⚠️", tip: "Risk Assessment auto-detects your location and checks flood, drought and heat conditions." },
            ].map((t, i) => (
              <div key={i} className="bg-black/30 border border-white/5 rounded-xl px-4 py-3 flex items-start gap-3">
                <span className="text-xl shrink-0">{t.icon}</span>
                <p className="text-xs text-white/40 leading-relaxed">{t.tip}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

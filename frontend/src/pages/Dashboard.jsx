import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import {
  FlaskConical, Sprout, CloudSun, TrendingUp,
  ShieldAlert, Wallet, ArrowRight, Droplets, Wind, Cpu, Map, Activity, Bot
} from "lucide-react";

const features = [
  {
    icon: FlaskConical,
    title: "Soil Analysis",
    desc: "Detect soil type from photo using AI vision models",
    path: "/dashboard/soil",
    badge: "AI Vision",
  },
  {
    icon: Sprout,
    title: "Crop Recommendation",
    desc: "ML model finds the best crops for your specific land",
    path: "/dashboard/recommend",
    badge: "Random Forest",
  },
  {
    icon: CloudSun,
    title: "Weather Forecast",
    desc: "Live climate data with farming-specific advice",
    path: "/dashboard/weather",
    badge: "Real-time",
  },
  {
    icon: Map,
    title: "Best Mandi Finder",
    desc: "Find nearest profitable market routes and costs",
    path: "/dashboard/best-mandi",
    badge: "Best Route",
  },
  {
    icon: Activity,
    title: "Live Prices",
    desc: "Current live mandi rates across all of India",
    path: "/dashboard/live-prices",
    badge: "Live Data",
  },
  {
    icon: Bot,
    title: "Price Forecast",
    desc: "Prophet ML future price predictions up to 3 years",
    path: "/dashboard/price-forecast",
    badge: "Prophet ML",
  },
  {
    icon: ShieldAlert,
    title: "Risk Assessment",
    desc: "Auto-detected flood, drought & heat wave alerts",
    path: "/dashboard/risk",
    badge: "Live Data",
  },
  {
    icon: Wallet,
    title: "Expense Tracker",
    desc: "Track operating costs vs predicted profit margins",
    path: "/dashboard/expenses",
    badge: "Finance",
  }
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
};

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

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const [wr, gd] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`),
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, { headers: { "Accept-Language": "en-US,en;q=0.9" } })
            .then(res => res.ok ? res.json() : {})
            .catch(() => ({})),
        ]);
        const wd = await wr.json();
        setWeather(wd.current);
        setWeatherCity(gd.address?.city || gd.address?.town || gd.address?.village || "Hyderabad");
      } catch { /* ignore */ }
    }, () => {});
  }, []);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-emerald-500/30">
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        
        {/* ── Header Section ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12"
        >
          <div>
            <p className="text-white/40 text-xs font-semibold tracking-widest uppercase mb-3">{today}</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              {getGreeting()},{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {userName}
              </span>
            </h1>
            <p className="text-white/40 text-lg mt-3 font-medium">Your farm's intelligence hub.</p>
          </div>

          {/* Minimalist Weather Widget */}
          {weather && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate("/dashboard/weather")}
              className="cursor-pointer flex items-center gap-5 bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 hover:bg-white/[0.04] transition-colors shadow-2xl backdrop-blur-md min-w-[260px]"
            >
              <div className="text-4xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                {weather.weather_code === 0 ? "☀️" : weather.weather_code <= 3 ? "⛅" : weather.weather_code <= 67 ? "🌧️" : "☁️"}
              </div>
              <div>
                <p className="text-3xl font-bold text-white tracking-tighter">{Math.round(weather.temperature_2m)}°C</p>
                <p className="text-xs text-emerald-400/80 font-medium tracking-wide truncate max-w-[140px]">{weatherCity}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-white/40 font-medium">
                  <span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5" />{weather.relative_humidity_2m}%</span>
                  <span className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5" />{Math.round(weather.wind_speed_10m)} km/h</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── ML Status Banner ── */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-full px-5 py-3 mb-10 w-fit backdrop-blur-sm"
        >
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-white/60 font-medium tracking-wide">ML Service Connected — Models are loaded and ready</span>
        </motion.div>

        {/* ── Bento Grid Feature Cards ── */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                variants={fadeUp}
                key={f.title}
                onClick={() => navigate(f.path)}
                className="group relative bg-white/[0.02] border border-white/5 rounded-3xl p-6 cursor-pointer hover:bg-white/[0.05] transition-all duration-300 overflow-hidden min-h-[180px] flex flex-col justify-between"
              >
                {/* Glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative z-10 flex items-start justify-between">
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all duration-300">
                    <Icon className="w-5 h-5 text-white/70 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <span className="text-[9px] font-bold tracking-widest uppercase bg-white/5 border border-white/10 text-white/40 group-hover:text-emerald-400 px-2.5 py-1 rounded-full transition-colors">
                    {f.badge}
                  </span>
                </div>

                <div className="relative z-10 mt-6">
                  <h3 className="font-bold text-white text-base mb-1 tracking-tight group-hover:text-emerald-300 transition-colors">{f.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed font-medium group-hover:text-white/60 transition-colors">{f.desc}</p>
                </div>
                
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight className="w-5 h-5 text-emerald-400" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Quick Tips Footer ── */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: "🌱", tip: "Upload a soil photo to get instant ML-powered soil classification and crop recommendations." },
            { icon: "💹", tip: "Check the Market tab — Prophet AI can forecast crop prices up to 3 years ahead." },
            { icon: "⚠️", tip: "Risk Assessment auto-detects your location and checks flood, drought and heat conditions." },
          ].map((t, i) => (
            <div key={i} className="bg-white/[0.01] border border-white/5 rounded-2xl px-5 py-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors">
              <span className="text-xl shrink-0 opacity-80">{t.icon}</span>
              <p className="text-xs text-white/40 leading-relaxed font-medium">{t.tip}</p>
            </div>
          ))}
        </motion.div>

      </main>
    </div>
  );
};

export default Dashboard;

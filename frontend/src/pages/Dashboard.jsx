import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FlaskConical, Sprout, CloudSun, Map, Activity, Bot, ShieldAlert,
  Wallet, Droplets, Wind, ArrowRight, Sun, Sunset, Moon, Sparkles,
  TrendingUp, AlertCircle
} from "lucide-react";
import Navbar from "../components/Navbar";
import { AuthContext } from "../context/AuthContext";

/* ─────────────────────────── helpers ─────────────────────────── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { label: "Good morning", Icon: Sun };
  if (h < 17) return { label: "Good afternoon", Icon: Sunset };
  return { label: "Good evening", Icon: Moon };
};

const colorMap = {
  amber: {
    border: "border-l-4 border-l-amber-500",
    icon: "text-amber-600",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-800",
  },
  green: {
    border: "border-l-4 border-l-[#1E8E5A]",
    icon: "text-[#1E8E5A]",
    bg: "bg-[#E6F5EE]",
    badge: "bg-[#E6F5EE] text-[#0F6B4A]",
  },
  blue: {
    border: "border-l-4 border-l-[#2F80ED]",
    icon: "text-[#2F80ED]",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
  },
  teal: {
    border: "border-l-4 border-l-teal-500",
    icon: "text-teal-600",
    bg: "bg-teal-50",
    badge: "bg-teal-100 text-teal-800",
  },
  pink: {
    border: "border-l-4 border-l-rose-500",
    icon: "text-rose-600",
    bg: "bg-rose-50",
    badge: "bg-rose-100 text-rose-800",
  },
  purple: {
    border: "border-l-4 border-l-purple-500",
    icon: "text-purple-600",
    bg: "bg-purple-50",
    badge: "bg-purple-100 text-purple-800",
  },
  red: {
    border: "border-l-4 border-l-red-500",
    icon: "text-red-600",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-800",
  },
  indigo: {
    border: "border-l-4 border-l-indigo-500",
    icon: "text-indigo-600",
    bg: "bg-indigo-50",
    badge: "bg-indigo-100 text-indigo-800",
  },
};

/* ─────────────────────────── data ─────────────────────────── */
const featureCards = [
  {
    title: "Soil Analysis",
    desc: "Classify soil types instantly from photos using EfficientNet-B0 ML model.",
    path: "/dashboard/soil",
    icon: FlaskConical,
    color: "amber",
    badge: "AI Vision",
  },
  {
    title: "Crop Recommendation",
    desc: "Predict optimal crop types matching soil presets and local rainfall forecasts.",
    path: "/dashboard/recommend",
    icon: Sprout,
    color: "green",
    badge: "Random Forest",
  },
  {
    title: "Weather Radar",
    desc: "Check hyper-local atmospheric forecasts and get real-time crop advisories.",
    path: "/dashboard/weather",
    icon: CloudSun,
    color: "blue",
    badge: "Real-time GPS",
  },
  {
    title: "Best Mandi Finder",
    desc: "Calculate transportation tolls and geocode high-profit mandi market routes.",
    path: "/dashboard/best-mandi",
    icon: Map,
    color: "teal",
    badge: "Route Optimizer",
  },
  {
    title: "Live Market Prices",
    desc: "Monitor current commodity rates direct from active Agmarknet markets.",
    path: "/dashboard/live-prices",
    icon: Activity,
    color: "pink",
    badge: "Live Scraping",
  },
  {
    title: "Price Forecast",
    desc: "Project commodity market price trends up to 3 years using Prophet ML.",
    path: "/dashboard/price-forecast",
    icon: Bot,
    color: "purple",
    badge: "Time-Series AI",
  },
  {
    title: "Risk Assessment",
    desc: "Analyze extreme weather risk factors including flood, dry spells, and frost.",
    path: "/dashboard/risk",
    icon: ShieldAlert,
    color: "red",
    badge: "Climate Alert",
  },
  {
    title: "Expense Tracker",
    desc: "Log seasonal expenses and calculate net margins against predicted revenues.",
    path: "/dashboard/expenses",
    icon: Wallet,
    color: "indigo",
    badge: "Farm Finance",
  },
];

const tips = [
  {
    emoji: "💧",
    text: "Irrigation yields are optimized when applied during early morning hours to minimize water evaporation rates.",
  },
  {
    emoji: "🌱",
    text: "Rotating leguminous pulse crops back into sandy soil restores nitrogen reserves naturally by up to 25%.",
  },
  {
    emoji: "📈",
    text: "Commodity rates generally peak 4 to 6 weeks after major harvest flushes. Time sales accordingly.",
  },
];

/* ─────────────────────────── weather widget ─────────────────────────── */
function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`
        );
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const c = data.current;
        setWeather({
          temp: Math.round(c.temperature_2m),
          humidity: c.relative_humidity_2m,
          wind: Math.round(c.wind_speed_10m),
          code: c.weather_code,
        });
      } catch (e) {
        setError("Unable to load weather");
      } finally {
        setLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => fetchWeather(coords.latitude, coords.longitude),
        () => {
          // fallback: New Delhi
          fetchWeather(28.6139, 77.209);
        },
        { timeout: 6000 }
      );
    } else {
      fetchWeather(28.6139, 77.209);
    }
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm flex items-center gap-3 animate-pulse min-w-[260px]">
        <div className="w-10 h-10 bg-slate-100 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-100 rounded w-24" />
          <div className="h-3 bg-slate-100 rounded w-16" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-2 text-slate-500 text-sm min-w-[220px]">
        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
        {error}
      </div>
    );
  }

  const getWeatherIcon = (code) => {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    return "⛈️";
  };

  const getWeatherLabel = (code) => {
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code <= 48) return "Foggy";
    if (code <= 67) return "Rainy";
    if (code <= 77) return "Snowy";
    return "Thunderstorm";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm flex items-center gap-5 min-w-[280px]"
    >
      <div className="text-4xl leading-none select-none">
        {getWeatherIcon(weather.code)}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800 font-heading">
          {weather.temp}°C
          <span className="text-xs font-semibold text-slate-400 ml-2">
            {getWeatherLabel(weather.code)}
          </span>
        </p>
        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-semibold">
          <span className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-blue-500" />
            {weather.humidity}%
          </span>
          <span className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-slate-400" />
            {weather.wind} km/h
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── feature card ─────────────────────────── */
function FeatureCard({ card, index }) {
  const navigate = useNavigate();
  const c = colorMap[card.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{
        y: -4,
        boxShadow: "0 12px 30px -4px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.03)",
        borderColor: "rgba(30, 142, 90, 0.2)"
      }}
      onClick={() => navigate(card.path)}
      className={`bg-white border border-slate-200 ${c.border} rounded-2xl p-6 shadow-sm cursor-pointer group flex flex-col justify-between`}
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className={`w-11 h-11 ${c.bg} rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm`}>
            <card.icon className={`w-5.5 h-5.5 ${c.icon}`} />
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${c.badge}`}>
            {card.badge}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-slate-800 font-bold text-base mb-2 group-hover:text-[#1E8E5A] transition-colors leading-tight tracking-tight">
          {card.title}
        </h3>
        <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">{card.desc}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center text-xs font-bold text-[#1E8E5A] group-hover:text-[#0F6B4A] transition-colors pt-2 border-t border-slate-100/50">
        Launch Tool
        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── main component ─────────────────────────── */
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { label: greeting, Icon: GreetingIcon } = getGreeting();

  const displayName =
    user?.name || user?.user?.name || user?.username || user?.email?.split("@")[0] || "Farmer";

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      <Navbar />

      <main className="dashboard-main-content max-w-7xl mx-auto px-6 py-8">

        {/* ── Header Row ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 pt-4">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <GreetingIcon className="w-4 h-4 text-[#2BB673]" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{greeting}</p>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 leading-none tracking-tight font-heading">
              Welcome, {displayName}
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              AgriSense intelligence console and ML dashboard.
            </p>
          </motion.div>

          {/* Weather Widget */}
          <WeatherWidget />
        </div>

        {/* ── Live Operational Status Chips ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-10"
        >
          {[
            { icon: TrendingUp, label: "Agmarknet Scraping Online", color: "text-[#1E8E5A] bg-[#E6F5EE] border-emerald-200/50" },
            { icon: CloudSun, label: "Open-Meteo GPS Active", color: "text-[#2F80ED] bg-blue-50 border-blue-200/50" },
            { icon: Sparkles, label: "Neural Model Inferences Operational", color: "text-purple-600 bg-purple-50 border-purple-200/50" },
          ].map((chip) => (
            <div
              key={chip.label}
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-full border ${chip.color} shadow-sm`}
            >
              <chip.icon className="w-3.5 h-3.5" />
              {chip.label}
            </div>
          ))}
        </motion.div>

        {/* ── Section Divider ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex items-center gap-3 mb-6"
        >
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Platform Services</h2>
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-bold">
            {featureCards.length} Tools Available
          </span>
        </motion.div>

        {/* ── Feature Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {featureCards.map((card, i) => (
            <FeatureCard key={card.path} card={card} index={i} />
          ))}
        </div>

        {/* ── Today's Tips Section ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          aria-label="Farming Insights"
          className="pt-4"
        >
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-4 h-4 text-[#1E8E5A]" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Today's Agronomy Insights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 + i * 0.05 }}
                className="bg-[#E6F5EE] border border-emerald-200/50 border-l-4 border-l-[#1E8E5A] rounded-2xl px-5 py-4 flex items-start gap-4 shadow-sm"
              >
                <span className="text-2xl leading-none select-none shrink-0">
                  {tip.emoji}
                </span>
                <p className="text-[#0F6B4A] text-xs sm:text-sm leading-relaxed font-bold">
                  {tip.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Bottom Spacing ── */}
        <div className="h-16" />
      </main>
    </div>
  );
}

import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  FlaskConical, Sprout, CloudSun, Map, Activity, Bot, ShieldAlert,
  Wallet, Droplets, Wind, ArrowRight, Sun, Sunset, Moon, Sparkles,
  TrendingUp, AlertCircle, BarChart3, Users, Zap, Clock, ChevronRight,
  Leaf, CheckCircle2
} from "lucide-react";
import DashboardNavbar from "../../components/layout/DashboardNavbar";
import { AuthContext } from "../../context/AuthContext";
import { useTranslation } from "../../translations";
import API from "../../services/api";
/* ─────────────────────────── helpers ─────────────────────────── */
const getGreeting = (t) => {
  const h = new Date().getHours();
  if (h < 12) return { label: t('dashboard.goodMorning'), Icon: Sun };
  if (h < 17) return { label: t('dashboard.goodAfternoon'), Icon: Sunset };
  return { label: t('dashboard.goodEvening'), Icon: Moon };
};

const colorMap = {
  amber: {
    border: "border-2 border-amber-200",
    icon: "text-amber-600",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    hover: "hover:border-amber-300",
  },
  green: {
    border: "border-2 border-emerald-200",
    icon: "text-[#1E8E5A]",
    bg: "bg-[#E6F5EE]",
    badge: "bg-[#E6F5EE] text-[#0F6B4A]",
    hover: "hover:border-emerald-300",
  },
  blue: {
    border: "border-2 border-blue-200",
    icon: "text-[#2F80ED]",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    hover: "hover:border-blue-300",
  },
  teal: {
    border: "border-2 border-teal-200",
    icon: "text-teal-600",
    bg: "bg-teal-50",
    badge: "bg-teal-100 text-teal-700",
    hover: "hover:border-teal-300",
  },
  pink: {
    border: "border-2 border-rose-200",
    icon: "text-rose-600",
    bg: "bg-rose-50",
    badge: "bg-rose-100 text-rose-700",
    hover: "hover:border-rose-300",
  },
  purple: {
    border: "border-2 border-purple-200",
    icon: "text-purple-600",
    bg: "bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    hover: "hover:border-purple-300",
  },
  red: {
    border: "border-2 border-red-200",
    icon: "text-red-600",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-700",
    hover: "hover:border-red-300",
  },
  indigo: {
    border: "border-2 border-indigo-200",
    icon: "text-indigo-600",
    bg: "bg-indigo-50",
    badge: "bg-indigo-100 text-indigo-700",
    hover: "hover:border-indigo-300",
  },
};

/* ─────────────────────────── data ─────────────────────────── */
const getFeatureCards = (t) => [
  {
    title: t('dashboard.features.soilTitle'),
    desc: t('dashboard.features.soilDesc'),
    path: "/dashboard/soil",
    icon: FlaskConical,
    color: "amber",
    badge: t('dashboard.features.soilBadge'),
  },
  {
    title: t('dashboard.features.cropTitle'),
    desc: t('dashboard.features.cropDesc'),
    path: "/dashboard/recommend",
    icon: Sprout,
    color: "green",
    badge: t('dashboard.features.cropBadge'),
  },
  {
    title: t('dashboard.features.weatherTitle'),
    desc: t('dashboard.features.weatherDesc'),
    path: "/dashboard/weather",
    icon: CloudSun,
    color: "blue",
    badge: t('dashboard.features.weatherBadge'),
  },
  {
    title: t('dashboard.features.mandiTitle'),
    desc: t('dashboard.features.mandiDesc'),
    path: "/dashboard/best-mandi",
    icon: Map,
    color: "teal",
    badge: t('dashboard.features.mandiBadge'),
  },
  {
    title: t('dashboard.features.marketTitle'),
    desc: t('dashboard.features.marketDesc'),
    path: "/dashboard/live-prices",
    icon: Activity,
    color: "pink",
    badge: t('dashboard.features.marketBadge'),
  },
  {
    title: t('dashboard.features.forecastTitle'),
    desc: t('dashboard.features.forecastDesc'),
    path: "/dashboard/price-forecast",
    icon: Bot,
    color: "purple",
    badge: t('dashboard.features.forecastBadge'),
  },
  {
    title: t('dashboard.features.riskTitle'),
    desc: t('dashboard.features.riskDesc'),
    path: "/dashboard/risk",
    icon: ShieldAlert,
    color: "red",
    badge: t('dashboard.features.riskBadge'),
  },
  {
    title: t('dashboard.features.expenseTitle'),
    desc: t('dashboard.features.expenseDesc'),
    path: "/dashboard/expenses",
    icon: Wallet,
    color: "indigo",
    badge: t('dashboard.features.expenseBadge'),
  },
];

const getTips = (t) => [
  {
    emoji: "💧",
    text: t('dashboard.tips.tip1'),
  },
  {
    emoji: "🌱",
    text: t('dashboard.tips.tip2'),
  },
  {
    emoji: "📈",
    text: t('dashboard.tips.tip3'),
  },
];

/* ─────────────────────────── weather widget ─────────────────────────── */
function WeatherWidget() {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const { data } = await API.get('/weather/farm-forecast', { params: { lat, lon } });
        const c = data.current;
        setWeather({
          temp: Math.round(c.temperature),
          humidity: c.humidity,
          wind: Math.round(c.windSpeed),
          code: c.weatherCode,
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
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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
        {t('dashboard.weather.error') || "Unable to load weather"}
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
    if (code === 0) return t('dashboard.weather.clear') || "Clear Sky";
    if (code <= 3) return t('dashboard.weather.partlyCloudy') || "Partly Cloudy";
    if (code <= 48) return t('dashboard.weather.foggy') || "Foggy";
    if (code <= 67) return t('dashboard.weather.rainy') || "Rainy";
    if (code <= 77) return t('dashboard.weather.snowy') || "Snowy";
    return t('dashboard.weather.thunderstorm') || "Thunderstorm";
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
  const { t } = useTranslation();
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
        {t('dashboard.launchTool')}
        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────── main component ─────────────────────────── */
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const { label: greeting, Icon: GreetingIcon } = getGreeting(t);
  
  const featureCards = getFeatureCards(t);
  const tips = getTips(t);
  
  const heroRef = useRef(null);
  const kpiRef = useRef(null);
  const featuresRef = useRef(null);
  const tipsRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const kpiInView = useInView(kpiRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 });
  const tipsInView = useInView(tipsRef, { once: true, amount: 0.3 });

  const displayName =
    user?.name || user?.user?.name || user?.username || user?.email?.split("@")[0] || "Farmer";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar />
      
      <main className="pt-24">
        {/* Hero Banner Section */}
        <section ref={heroRef} className="relative bg-gradient-to-br from-[#0F4C3A] via-[#0F6B4A] to-[#124230] py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80')] bg-cover bg-center opacity-15" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#2BB673]/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-0 w-80 h-80 rounded-full bg-[#2F80ED]/10 blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#2BB673]/15 border border-[#2BB673]/30 text-[#2BB673] text-[11px] font-bold px-4 py-2 rounded-full tracking-widest uppercase">
                  <GreetingIcon className="w-4 h-4" />
                  {greeting}
                </div>

                <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight font-heading">
                  {t('dashboard.welcomeBack') || `${t('dashboard.welcome')} back,`} <span className="text-[#2BB673]">{displayName}</span>
                </h1>

                <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-lg">
                  {t('dashboard.dashboardDesc')}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <WeatherWidget />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={heroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden lg:flex justify-center"
              >
                <div className="w-full max-w-md bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#2BB673] rounded-2xl flex items-center justify-center">
                        <Leaf className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{t('dashboard.farmOverview')}</h3>
                        <p className="text-white/60 text-sm">{t('dashboard.realTimeIntel')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{t('dashboard.activeTools')}</p>
                        <p className="text-white text-3xl font-black font-heading">8</p>
                      </div>
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{t('dashboard.analysesCount')}</p>
                        <p className="text-white text-3xl font-black font-heading">12</p>
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#2BB673]" />
                      <p className="text-white/80 text-sm">{t('dashboard.allSystemsOp')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* KPI Cards Section */}
        <section ref={kpiRef} className="max-w-7xl mx-auto px-6 md:px-16 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={kpiInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: FlaskConical, label: t('dashboard.kpiSoil'), value: "12", change: "+3", color: "green" },
              { icon: Sprout, label: t('dashboard.kpiCrop'), value: "8", change: "+2", color: "green" },
              { icon: Activity, label: t('dashboard.kpiMarket'), value: "5", change: "+1", color: "blue" },
              { icon: ShieldAlert, label: t('dashboard.kpiRisk'), value: "2", change: "Active", color: "amber" },
            ].map((kpi, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={kpiInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 12px 30px -4px rgba(0, 0, 0, 0.1)" }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    kpi.color === 'green' ? 'bg-[#E6F5EE]' :
                    kpi.color === 'blue' ? 'bg-blue-50' :
                    kpi.color === 'amber' ? 'bg-amber-50' :
                    'bg-red-50'
                  }`}>
                    <kpi.icon className={`w-6 h-6 ${
                      kpi.color === 'green' ? 'text-[#1E8E5A]' :
                      kpi.color === 'blue' ? 'text-blue-600' :
                      kpi.color === 'amber' ? 'text-amber-600' :
                      'text-red-600'
                    }`} />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    kpi.color === 'green' ? 'bg-green-100 text-green-700' :
                    kpi.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    kpi.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {kpi.change}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-1 font-heading">{kpi.value}</h3>
                <p className="text-sm text-slate-500 font-medium">{kpi.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Feature Cards Section */}
        <section ref={featuresRef} className="max-w-7xl mx-auto px-6 md:px-16 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 font-heading">{t('dashboard.platformServices')}</h2>
                <p className="text-slate-500 mt-1">Access all your agricultural intelligence tools</p>
              </div>
              <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-4 py-2 rounded-full">
                {featureCards.length} {t('dashboard.toolsAvailable')}
              </span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featureCards.map((card, i) => (
              <FeatureCard key={card.path} card={card} index={i} />
            ))}
          </div>
        </section>

        {/* Today's Tips Section */}
        <section ref={tipsRef} className="max-w-7xl mx-auto px-6 md:px-16 py-12 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={tipsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#1E8E5A]" />
              <h2 className="text-xl font-bold text-slate-800 font-heading">{t('dashboard.todaysInsights')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={tipsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 flex items-start gap-4 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <span className="text-3xl leading-none select-none shrink-0">
                    {tip.emoji}
                  </span>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">
                    {tip.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

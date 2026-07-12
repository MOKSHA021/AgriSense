import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef as useRefHook } from "react";
import DashboardNavbar from "../../components/layout/DashboardNavbar";
import API from "../../services/api";
import {
  ShieldAlert, Search, AlertTriangle, Droplets, Sun,
  Thermometer, Snowflake, Loader, MapPin, Sprout, Clock, CheckCircle, Target, Sparkles
} from "lucide-react";
import { useTranslation } from "../../translations";

const SEASONS = ["Kharif", "Rabi", "Zaid"];

const ICON_MAP = {
  Droplets: Droplets,
  Sun: Sun,
  Thermometer: Thermometer,
  Snowflake: Snowflake,
};

const LEVEL_CONFIG = {
  HIGH:   {
    badge: "bg-red-100 text-red-700 border-red-200",
    card: "border-red-200 bg-red-50/50",
    bar: "bg-gradient-to-r from-red-500 to-rose-400",
    iconBg: "bg-red-100 border-red-200",
    iconColor: "text-red-600",
    score: 3,
  },
  MEDIUM: {
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    card: "border-amber-200 bg-amber-50/50",
    bar: "bg-gradient-to-r from-amber-500 to-orange-400",
    iconBg: "bg-amber-100 border-amber-200",
    iconColor: "text-amber-600",
    score: 1,
  },
  LOW:    {
    badge: "bg-[#D8F3DC] text-[#2D6A4F] border-[#C3E6CB]",
    card: "border-[#E0EDD9] bg-[#EBF5EE]/40",
    bar: "bg-gradient-to-r from-[#2D6A4F] to-[#52B788]",
    iconBg: "bg-[#D8F3DC] border-[#C3E6CB]",
    iconColor: "text-[#2D6A4F]",
    score: 0,
  },
};

const RiskAssessment = () => {
  const { t } = useTranslation();
  const [cityInput, setCityInput] = useState("");
  const [season, setSeason] = useState("Kharif");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [risks, setRisks] = useState(null);
  const [cityName, setCityName] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [safeCrops, setSafeCrops] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const headerRef = useRefHook(null);
  const contentRef = useRefHook(null);
  
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const contentInView = useInView(contentRef, { once: true, amount: 0.3 });

  const fetchAndAssess = async (query) => {
    setLoading(true); setError(""); setRisks(null);
    try {
      let params = {};
      if (query.startsWith("lat=")) {
        const parts = Object.fromEntries(query.split("&").map((p) => p.split("=")));
        params = { lat: parts.lat, lon: parts.lon };
      } else {
        const cName = decodeURIComponent(query.split("=")[1]);
        params = { q: cName };
      }
      
      const { data: resData } = await API.get("/weather/farm-forecast", { params });
      const data = resData.raw;
      const resolvedName = resData.location?.displayName || params.q || "Unknown Location";
      
      const current = { main: { temp: data.current.temperature_2m, humidity: data.current.relative_humidity_2m } };
      const forecast = (data.hourly?.precipitation || []).map((p) => ({ rain: { "3h": p } }));
      setCityName(resolvedName); setCityInput(resolvedName);

      // Compute risks using backend API
      try {
        const { data: risksData } = await API.post("/reference/compute-risks", { current, forecast });
        setRisks(risksData.risks);

        // Fetch safe crops from backend
        try {
          const { data: safeCropsData } = await API.post("/reference/safe-crops", { risks: risksData.risks });
          setSafeCrops(safeCropsData.safeCrops || []);
        } catch (err) {
          console.error("Failed to fetch safe crops:", err);
          setSafeCrops([]);
        }
      } catch (err) {
        console.error("Failed to compute risks:", err);
        setError("Failed to compute risks. Please try again.");
      }
    } catch (err) { setError(err.response?.data?.message || err.message || "Could not fetch weather data"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setDetecting(false); fetchAndAssess(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`); },
      () => setDetecting(false),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssess = (e) => { e.preventDefault(); if (!cityInput.trim()) return; fetchAndAssess(`q=${encodeURIComponent(cityInput.trim())}`); };
  const handleAutoDetect = () => {
    if (!navigator.geolocation) { setError(t('risk.errorGeolocation')); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setDetecting(false); fetchAndAssess(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`); },
      () => { setDetecting(false); setError(t('risk.errorDetect')); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const highCount = risks ? risks.filter((r) => r.level === "HIGH").length : 0;
  const totalScore = risks ? risks.reduce((s, r) => s + LEVEL_CONFIG[r.level].score, 0) : 0;
  const maxScore = 12;
  const riskPct = Math.round((totalScore / maxScore) * 100);
  const overallLabel = riskPct >= 60 ? t('risk.criticalRisk') : riskPct >= 30 ? t('risk.moderateRisk') : t('risk.optimal');
  const overallColor = riskPct >= 60 ? "text-red-600" : riskPct >= 30 ? "text-amber-600" : "text-[#2D6A4F]";
  const overallBadgeBg = riskPct >= 60 ? "bg-red-50 border-red-200 text-red-600" : riskPct >= 30 ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-[#EBF5EE] border-[#C3E6CB] text-[#2D6A4F]";
  const overallBarColor = riskPct >= 60 ? "bg-gradient-to-r from-red-500 to-rose-400" : riskPct >= 30 ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-[#2D6A4F] to-[#52B788]";
  const showDelayedSowing = highCount >= 2;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0F4C3A] via-[#0F6B4A] to-[#124230] py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1598110844738-ccaa804e8dc6?w=1920&q=80')] bg-cover bg-center opacity-10" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-bold px-4 py-2 rounded-full tracking-widest uppercase">
                  <ShieldAlert className="w-4 h-4" />
                  {t('risk.criticalAlert')}
                </div>

                <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight font-heading">
                  {t('risk.title')}
                  <span className="block text-[#2BB673] mt-2">{t('risk.subtitle')}</span>
                </h1>

                <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-lg">
                  {t('risk.desc')}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden lg:flex justify-center"
              >
                <div className="w-full max-w-md bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center">
                        <ShieldAlert className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{t('risk.riskRadar')}</h3>
                        <p className="text-white/60 text-sm">{t('risk.climateAlertSystem')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{t('risk.risks')}</p>
                        <p className="text-white text-3xl font-black font-heading">4</p>
                      </div>
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{t('risk.alerts')}</p>
                        <p className="text-white text-3xl font-black font-heading">{t('risk.real')}</p>
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#2BB673]" />
                      <p className="text-white/80 text-sm">{t('risk.proactiveGuides')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-6 md:px-16 py-12">
          {/* Header */}
          <div ref={headerRef} className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-200">
                  <ShieldAlert className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 font-heading">{t('risk.headerTitle')}</h1>
                  <p className="text-sm text-slate-500">{t('risk.headerDesc')}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Input Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleAssess}
            className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)}
                  placeholder={t('risk.enterCity')}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1E8E5A] focus:ring-2 focus:ring-[#1E8E5A]/20 transition-colors"
                />
              </div>
              <button type="button" onClick={handleAutoDetect} disabled={detecting}
                className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm font-semibold uppercase tracking-wider text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all w-full sm:w-auto h-full">
                {detecting ? <Loader className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                <span>{t('risk.detect')}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-2">{t('risk.seasonLabel')}</label>
              {SEASONS.map((s) => (
                <button key={s} type="button" onClick={() => setSeason(s)}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all ${season === s ? "bg-[#1E8E5A] text-white shadow-sm border border-[#1E8E5A]" : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-800"}`}>
                  {s}
                </button>
              ))}
            </div>

            <button type="submit" disabled={loading || !cityInput.trim()}
              className="w-full py-3 bg-[#1E8E5A] hover:bg-[#0F6B4A] text-white text-sm font-semibold uppercase tracking-wider rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center justify-center gap-2">
              {loading ? <><Loader className="w-5 h-5 animate-spin" /> {t('risk.assessing')}</> : <><Target className="w-5 h-5" /> {t('risk.assessBtn')}</>}
            </button>
          </motion.form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 border border-red-200 bg-red-50 text-red-600 text-sm font-medium rounded-xl px-5 py-4 mb-6"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" /><span>{error}</span>
            </motion.div>
          )}

          {risks && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Overall Risk Score */}
              <div className="bg-white border border-[#E0EDD9] rounded-[2rem] p-8 shadow-sm relative overflow-hidden">
                {/* Color-coded top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] ${overallBarColor}`} />

                <div className="flex items-center justify-between mb-6 relative z-10 mt-2">
                  <div>
                    <h2 className="text-xl font-bold text-[#1B4332] tracking-tight">{cityName}</h2>
                    <p className="text-sm font-medium text-[#6B8C7B] uppercase tracking-widest mt-1">{season} {t('risk.seasonLabelCard')}</p>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-3 inline-block px-3 py-1 rounded-full border ${overallBadgeBg}`}>{overallLabel}</p>
                  </div>
                  <div className="text-right">
                    {/* Circular score indicator */}
                    <div className={`text-6xl font-black tracking-tighter ${overallColor}`}>{riskPct}%</div>
                    <p className="text-xs text-[#6B8C7B] mt-1 uppercase tracking-wider">{t('risk.riskScore')}</p>
                  </div>
                </div>

                {/* Overall progress bar */}
                <div className="w-full h-4 bg-[#F0F7EE] rounded-full overflow-hidden border border-[#E0EDD9] shadow-inner relative z-10">
                  <div className={`h-full rounded-full transition-all duration-1000 ease-out ${overallBarColor}`} style={{ width: `${riskPct}%` }} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8C7B] mt-4 text-center relative z-10">{t('risk.riskScoreComputed')}</p>
              </div>

              {/* Delayed Sowing */}
              {showDelayedSowing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-start gap-4 border border-amber-200 rounded-2xl p-6 bg-amber-50 shadow-sm"
                >
                  <Clock className="w-6 h-6 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="text-base font-bold text-amber-700 tracking-tight">{t('risk.sowingDelay')}</p>
                    <p className="text-sm font-medium text-amber-600 mt-2 leading-relaxed">{t('risk.sowingDelayDesc')}</p>
                  </div>
                </motion.div>
              )}

              {/* Risk Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {risks.length > 0 ? (
                  risks.map((risk, i) => {
                    const Icon = ICON_MAP[risk.icon] || AlertTriangle;
                    const cfg = LEVEL_CONFIG[risk.level];
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={risk.name}
                        className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow ${cfg.card}`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cfg.iconBg}`}>
                              <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                            </div>
                            <span className="text-base font-bold text-[#1B3A28] tracking-tight">{risk.name}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${cfg.badge}`}>{risk.level}</span>
                        </div>
                        {/* Level bar */}
                        <div className="w-full h-2 bg-[#F0F7EE] rounded-full mb-4 border border-[#E0EDD9]">
                          <div className={`h-full ${cfg.bar} rounded-full`} style={{ width: risk.level === "HIGH" ? "100%" : risk.level === "MEDIUM" ? "55%" : "18%" }} />
                        </div>
                        <p className="text-sm font-medium text-[#6B8C7B] mb-3 leading-relaxed">{risk.description}</p>
                        <div className="bg-[#F7F4EE] rounded-xl p-3 border border-[#E0EDD9]">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8C7B] mb-1">{t('risk.recommendedAction')}</p>
                          <p className="text-sm font-semibold text-[#1B3A28]">{risk.action}</p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-full bg-[#EBF5EE] border border-[#C3E6CB] rounded-[2rem] p-10 text-center flex flex-col items-center justify-center shadow-sm"
                  >
                    <CheckCircle className="w-12 h-12 text-[#2D6A4F] mb-4" />
                    <h3 className="text-2xl font-black text-[#1B4332] tracking-tight">{t('risk.optimalConditions')}</h3>
                    <p className="text-sm font-medium text-[#2D6A4F] mt-2 max-w-lg leading-relaxed">
                      {t('risk.optimalConditionsDesc')}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Safe Crops */}
              <div className="bg-white border border-[#E0EDD9] rounded-[2rem] p-8 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#6B8C7B] mb-6 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-[#2D6A4F]" />
                  {t('risk.recommendedSafeCrops')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {safeCrops.map((crop, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={crop.name}
                      className="flex items-start gap-4 bg-[#EBF5EE] border border-[#C3E6CB] rounded-2xl p-5 hover:bg-[#D8F3DC] transition-colors"
                    >
                      <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#2D6A4F]" />
                      <div>
                        <p className="text-base font-bold text-[#1B4332] tracking-tight">{crop.name}</p>
                        <p className="text-xs font-medium text-[#6B8C7B] mt-1 leading-relaxed">{crop.reason}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </section>
      </main>
    </div>
  );
};

export default RiskAssessment;
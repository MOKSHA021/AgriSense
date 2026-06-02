import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import {
  ShieldAlert, Search, AlertTriangle, Droplets, Sun,
  Thermometer, Snowflake, Loader, MapPin, Sprout, Clock, CheckCircle, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SEASONS = ["Kharif", "Rabi", "Zaid"];

const ICON_MAP = {
  Droplets: Droplets,
  Sun: Sun,
  Thermometer: Thermometer,
  Snowflake: Snowflake,
};

const LEVEL_CONFIG = {
  HIGH:   { badge: "bg-red-500/20 text-red-300 border-red-500/30",    card: "from-red-500/10 to-red-900/5 border-red-500/20",    bar: "bg-gradient-to-r from-red-500 to-rose-400",    score: 3 },
  MEDIUM: { badge: "bg-amber-500/20 text-amber-300 border-amber-500/30", card: "from-amber-500/10 to-amber-900/5 border-amber-500/20", bar: "bg-gradient-to-r from-amber-500 to-orange-400", score: 1 },
  LOW:    { badge: "bg-green-500/20 text-green-300 border-green-500/30", card: "from-green-500/5 to-green-900/5 border-green-500/10", bar: "bg-gradient-to-r from-green-500 to-emerald-400", score: 0 },
};

const RiskAssessment = () => {
  const [cityInput, setCityInput] = useState("");
  const [season, setSeason] = useState("Kharif");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [risks, setRisks] = useState(null);
  const [cityName, setCityName] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [safeCrops, setSafeCrops] = useState([]);

  const fetchAndAssess = async (query) => {
    setLoading(true); setError(""); setRisks(null);
    try {
      let lat, lon, resolvedName;
      if (query.startsWith("lat=")) {
        const parts = Object.fromEntries(query.split("&").map((p) => p.split("=")));
        lat = parts.lat; lon = parts.lon;
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, { headers: { "Accept-Language": "en-US,en;q=0.9" } });
          if (!geoRes.ok) throw new Error();
          const geo = await geoRes.json();
          resolvedName = geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || "Hyderabad";
        } catch {
          resolvedName = "Hyderabad";
        }
      } else {
        const cName = decodeURIComponent(query.split("=")[1]);
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cName)}&count=1&language=en`);
        const geoData = await geoRes.json();
        if (!geoData.results?.length) throw new Error("City not found. Please check the name and try again.");
        lat = geoData.results[0].latitude; lon = geoData.results[0].longitude; resolvedName = geoData.results[0].name;
      }
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&hourly=precipitation&timezone=auto&forecast_days=5`);
      if (!weatherRes.ok) throw new Error("Failed to fetch weather data");
      const data = await weatherRes.json();
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
    } catch (err) { setError(err.message || "Could not fetch weather data"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setDetecting(false); fetchAndAssess(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`); },
      () => setDetecting(false)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssess = (e) => { e.preventDefault(); if (!cityInput.trim()) return; fetchAndAssess(`q=${encodeURIComponent(cityInput.trim())}`); };
  const handleAutoDetect = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported."); return; }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setDetecting(false); fetchAndAssess(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`); },
      () => { setDetecting(false); setError("Could not detect location. Please enter a city manually."); }
    );
  };

  const highCount = risks ? risks.filter((r) => r.level === "HIGH").length : 0;
  const totalScore = risks ? risks.reduce((s, r) => s + LEVEL_CONFIG[r.level].score, 0) : 0;
  const maxScore = 12;
  const riskPct = Math.round((totalScore / maxScore) * 100);
  const overallLabel = riskPct >= 60 ? "CRITICAL RISK" : riskPct >= 30 ? "MODERATE RISK" : "OPTIMAL";
  const overallColor = riskPct >= 60 ? "text-red-400" : riskPct >= 30 ? "text-amber-400" : "text-emerald-400";
  const overallBarColor = riskPct >= 60 ? "bg-gradient-to-r from-red-500 to-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]" : riskPct >= 30 ? "bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]";
  const showDelayedSowing = highCount >= 2;

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-orange-500/30">
      <Navbar />

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
            <ShieldAlert className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Risk Assessment</h1>
            <p className="text-white/40 text-sm mt-1 font-medium">Analyze weather data to identify farming risks and get crop safety recommendations.</p>
          </div>
        </motion.div>

        {/* Input Form */}
        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleAssess} 
          className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 mb-8 shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)}
                placeholder="Enter city name..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <button type="button" onClick={handleAutoDetect} disabled={detecting}
              className="flex items-center justify-center gap-2 px-6 py-4 border border-white/10 bg-white/5 rounded-xl text-sm font-bold uppercase tracking-wider text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-50 transition-all w-full sm:w-auto h-full">
              {detecting ? <Loader className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              <span>Detect</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <label className="text-xs font-bold uppercase tracking-wider text-white/40 mr-2">Season:</label>
            {SEASONS.map((s) => (
              <button key={s} type="button" onClick={() => setSeason(s)}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${season === s ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] border border-orange-400" : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10"}`}>
                {s}
              </button>
            ))}
          </div>

          <button type="submit" disabled={loading || !cityInput.trim()}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:from-orange-400 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all flex items-center justify-center gap-2">
            {loading ? <><Loader className="w-5 h-5 animate-spin" /> Assessing Environment...</> : <><Target className="w-5 h-5" /> Evaluate Risks</>}
          </button>
        </motion.form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-medium rounded-xl px-5 py-4 mb-6"
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
              <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative glowing orb based on risk */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-20 pointer-events-none ${riskPct >= 60 ? 'bg-red-500' : riskPct >= 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} />

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{cityName}</h2>
                    <p className="text-sm font-medium text-white/40 uppercase tracking-widest mt-1">{season} Season</p>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-3 ${overallColor} bg-white/5 inline-block px-3 py-1 rounded-full border border-white/5`}>{overallLabel}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-6xl font-black tracking-tighter ${overallColor} drop-shadow-lg`}>{riskPct}%</div>
                  </div>
                </div>
                <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner relative z-10">
                  <div className={`h-full rounded-full transition-all duration-1000 ease-out ${overallBarColor}`} style={{ width: `${riskPct}%` }} />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-4 text-center relative z-10">Risk score computed via predictive meteorological analysis</p>
              </div>

              {/* Delayed Sowing */}
              {showDelayedSowing && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-start gap-4 border border-amber-500/20 rounded-2xl p-6 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                  <Clock className="w-6 h-6 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <p className="text-base font-bold text-amber-300 tracking-tight">Sowing Delay Recommended</p>
                    <p className="text-sm font-medium text-amber-400/80 mt-2 leading-relaxed">Multiple critical risk conditions detected. We advise delaying sowing operations by 1–2 weeks until meteorological conditions stabilize. Monitor ongoing forecasts.</p>
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
                        className={`bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-lg hover:bg-white/[0.04] transition-colors`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                              <Icon className="w-5 h-5 text-white/70" />
                            </div>
                            <span className="text-base font-bold text-white tracking-tight">{risk.name}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${cfg.badge}`}>{risk.level}</span>
                        </div>
                        {/* Level bar */}
                        <div className="w-full h-2 bg-white/5 rounded-full mb-4 shadow-inner">
                          <div className={`h-full ${cfg.bar} rounded-full shadow-sm`} style={{ width: risk.level === "HIGH" ? "100%" : risk.level === "MEDIUM" ? "55%" : "18%" }} />
                        </div>
                        <p className="text-sm font-medium text-white/60 mb-3 leading-relaxed">{risk.description}</p>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Recommended Action</p>
                          <p className="text-sm font-semibold text-white/80">{risk.action}</p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-full bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-10 text-center flex flex-col items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                    <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
                    <h3 className="text-2xl font-black text-emerald-300 tracking-tight">Optimal Conditions</h3>
                    <p className="text-sm font-medium text-emerald-400/80 mt-2 max-w-lg leading-relaxed">
                      Zero significant meteorological risks detected for the 5-day forecast horizon. Conditions are highly favorable for all scheduled farming operations.
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Safe Crops */}
              <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 shadow-xl">
                <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  Recommended Safe Crops
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {safeCrops.map((crop, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={crop.name} 
                      className="flex items-start gap-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 hover:bg-emerald-500/10 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                      <div>
                        <p className="text-base font-bold text-white tracking-tight">{crop.name}</p>
                        <p className="text-xs font-medium text-white/50 mt-1 leading-relaxed">{crop.reason}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default RiskAssessment;
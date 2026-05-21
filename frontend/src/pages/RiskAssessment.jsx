import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import {
  ShieldAlert, Search, AlertTriangle, Droplets, Sun,
  Thermometer, Snowflake, Loader, MapPin, Sprout, Clock, CheckCircle,
} from "lucide-react";

const SEASONS = ["Kharif", "Rabi", "Zaid"];

const ICON_MAP = {
  Droplets: Droplets,
  Sun: Sun,
  Thermometer: Thermometer,
  Snowflake: Snowflake,
};

const LEVEL_CONFIG = {
  HIGH:   { badge: "bg-red-500/30 text-red-300 border-red-500/40",    card: "from-red-500/20 to-red-900/10 border-red-500/30",    bar: "bg-red-500",    score: 3 },
  MEDIUM: { badge: "bg-amber-500/30 text-amber-300 border-amber-500/40", card: "from-amber-500/20 to-amber-900/10 border-amber-500/30", bar: "bg-amber-500", score: 1 },
  LOW:    { badge: "bg-green-500/30 text-green-300 border-green-500/40", card: "from-green-500/10 to-green-900/5 border-green-500/20", bar: "bg-green-500", score: 0 },
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
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, { headers: { "User-Agent": "AgriSense/1.0" } });
        const geo = await geoRes.json();
        resolvedName = geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || "Your Location";
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
  const overallLabel = riskPct >= 60 ? "HIGH RISK" : riskPct >= 30 ? "MODERATE RISK" : "LOW RISK";
  const overallColor = riskPct >= 60 ? "text-red-400" : riskPct >= 30 ? "text-amber-400" : "text-green-400";
  const overallBarColor = riskPct >= 60 ? "bg-red-500" : riskPct >= 30 ? "bg-amber-500" : "bg-green-500";
  const showDelayedSowing = highCount >= 2;

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=1920&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/70" />
      </div>
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <ShieldAlert className="w-7 h-7 text-orange-400" />
              <h1 className="text-2xl font-bold text-white">Risk Assessment</h1>
            </div>
            <p className="text-sm text-white/50 ml-10">Analyze weather data to identify farming risks and get crop safety recommendations.</p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleAssess} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text" value={cityInput} onChange={(e) => setCityInput(e.target.value)}
                  placeholder="Enter city name..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <button type="button" onClick={handleAutoDetect} disabled={detecting}
                className="flex items-center gap-1.5 px-4 py-3 border border-white/20 rounded-xl text-sm text-white/60 hover:bg-white/10 disabled:opacity-50 transition-colors">
                {detecting ? <Loader className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                <span className="hidden sm:block">Detect</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <label className="text-sm font-medium text-white/60">Season:</label>
              {SEASONS.map((s) => (
                <button key={s} type="button" onClick={() => setSeason(s)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all ${season === s ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-900/30" : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"}`}>
                  {s}
                </button>
              ))}
            </div>

            <button type="submit" disabled={loading || !cityInput.trim()}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all">
              {loading ? <span className="flex items-center justify-center gap-2"><Loader className="w-4 h-4 animate-spin" /> Assessing...</span> : "🛡️ Assess Risk"}
            </button>
          </form>

          {error && (
            <div className="flex items-center gap-2 border border-red-500/30 bg-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
              <AlertTriangle className="w-4 h-4 shrink-0" /><span>{error}</span>
            </div>
          )}

          {risks && (
            <div className="space-y-6">
              {/* Overall Risk Score */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-white">{cityName} — {season} Season</h2>
                    <p className={`text-sm font-semibold mt-0.5 ${overallColor}`}>{overallLabel}</p>
                  </div>
                  <div className={`text-4xl font-black ${overallColor}`}>{riskPct}%</div>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${overallBarColor} rounded-full transition-all duration-700`} style={{ width: `${riskPct}%` }} />
                </div>
                <p className="text-xs text-white/40 mt-2">Risk score based on rainfall, temperature, and humidity analysis</p>
              </div>

              {/* Risk Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {risks.map((risk) => {
                  const Icon = ICON_MAP[risk.icon] || AlertTriangle;
                  const cfg = LEVEL_CONFIG[risk.level];
                  return (
                    <div key={risk.name} className={`bg-gradient-to-br ${cfg.card} border rounded-2xl p-5`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-white/70" />
                          <span className="text-sm font-semibold text-white">{risk.name}</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${cfg.badge}`}>{risk.level}</span>
                      </div>
                      {/* Level bar */}
                      <div className="w-full h-1.5 bg-white/10 rounded-full mb-3">
                        <div className={`h-full ${cfg.bar} rounded-full`} style={{ width: risk.level === "HIGH" ? "100%" : risk.level === "MEDIUM" ? "55%" : "18%" }} />
                      </div>
                      <p className="text-xs text-white/65 mb-2">{risk.description}</p>
                      <p className="text-xs text-white/45"><span className="font-medium text-white/55">Action: </span>{risk.action}</p>
                    </div>
                  );
                })}
              </div>

              {/* Delayed Sowing */}
              {showDelayedSowing && (
                <div className="flex items-start gap-3 border border-amber-500/30 rounded-2xl p-5 bg-amber-500/10">
                  <Clock className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <p className="text-sm font-bold text-amber-300">⚠️ Delayed Sowing Recommended</p>
                    <p className="text-xs text-amber-400/80 mt-1">Multiple high-risk conditions detected. Consider delaying sowing by 1–2 weeks until conditions improve. Monitor weather forecasts regularly before proceeding.</p>
                  </div>
                </div>
              )}

              {/* Safe Crops */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                <h2 className="text-sm font-semibold text-white/70 mb-4">
                  <Sprout className="inline w-4 h-4 text-green-400 mr-1.5 -mt-0.5" />
                  Safe Crops for Current Conditions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {safeCrops.map((crop) => (
                    <div key={crop.name} className="flex items-start gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-green-400" />
                      <div>
                        <p className="text-sm font-semibold text-white">{crop.name}</p>
                        <p className="text-xs text-white/50 mt-0.5">{crop.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default RiskAssessment;
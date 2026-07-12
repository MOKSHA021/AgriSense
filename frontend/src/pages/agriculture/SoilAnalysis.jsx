import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef as useRefHook } from "react";
import DashboardNavbar from "../../components/layout/DashboardNavbar";
import API from "../../services/api";
import {
  Upload, FlaskConical, CheckCircle2, AlertTriangle,
  Loader2, X, RefreshCw, Camera, Info,
  Wheat, Droplets, Sun, Thermometer, ChevronDown,
  Leaf, Sparkles
} from "lucide-react";
import { useTranslation } from "../../translations";

// ── Confidence threshold ─────────────────────────────────────────────────────
const CONFIDENCE_THRESHOLD = 0.65; // Below this → show low-confidence warning

// ── Soil type knowledge base ─────────────────────────────────────────────────
const SOIL_DATA = {
  "Alluvial": {
    emoji: "🏞️",
    color: "from-[#1E8E5A] to-[#0F6B4A]",
    accent: "green",
    description: "Alluvial soil is formed by river deposits. It is highly fertile, well-drained, and found in river plains and valleys. Contains good proportions of silt, clay, and sand.",
    characteristics: ["High natural fertility", "Good water retention", "Rich in minerals", "Well-drained texture"],
    crops: ["Wheat", "Rice", "Sugarcane", "Cotton", "Pulses", "Vegetables"],
    ph: "6.5 – 7.5",
    npk: "High N, Moderate P & K",
    recommendation: "Ideal for intensive farming. Maintain organic matter levels with green manuring. Avoid over-irrigation to prevent waterlogging.",
  },
  "Arid": {
    emoji: "🏜️",
    color: "from-orange-400 to-amber-500",
    accent: "orange",
    description: "Arid soil is found in dry, desert regions with low rainfall. It has low organic matter, high salt content, and poor water retention but can be cultivated with irrigation.",
    characteristics: ["Low organic matter", "High soluble salts", "Sandy texture", "Poor water retention"],
    crops: ["Bajra (Pearl Millet)", "Moth Bean", "Cluster Bean", "Jowar (Sorghum)", "Sesame"],
    ph: "7.0 – 8.5",
    npk: "Low N, Low P, Moderate K",
    recommendation: "Use drip irrigation to conserve water. Add organic compost to improve fertility. Choose drought-resistant crop varieties.",
  },
  "Black": {
    emoji: "⚫",
    color: "from-gray-700 to-zinc-800",
    accent: "zinc",
    description: "Black soil (Regur/Cotton soil) is rich in calcium carbonate, magnesium, and iron. It has high water retention and swells when wet, making it ideal for cotton cultivation.",
    characteristics: ["High clay content (montmorillonite)", "Swells when wet, cracks when dry", "High water retention", "Self-ploughing nature"],
    crops: ["Cotton", "Soybean", "Wheat", "Jowar", "Linseed", "Sunflower"],
    ph: "7.2 – 8.0",
    npk: "Moderate N, Low P, High K",
    recommendation: "Best suited for cotton. Avoid over-tilling when wet. Supplement phosphorus. Use deep-rooted crops to utilize stored moisture.",
  },
  "Laterite": {
    emoji: "🧱",
    color: "from-red-650 to-orange-750",
    accent: "red",
    description: "Laterite soil forms in high rainfall tropical regions due to intense leaching. It is acidic, low in nutrients but can be made productive with proper management.",
    characteristics: ["Acidic pH", "Iron & aluminium rich", "Low N, P, K naturally", "Hard when dry, soft when wet"],
    crops: ["Tea", "Coffee", "Rubber", "Coconut", "Cashew", "Pineapple"],
    ph: "4.5 – 6.0",
    npk: "Low N, Low P, Low K",
    recommendation: "Apply lime to correct acidity. Heavy manuring required. Suitable for plantation crops. Terracing prevents erosion.",
  },
  "Mountain": {
    emoji: "⛰️",
    color: "from-emerald-700 to-[#0F6B4A]",
    accent: "emerald",
    description: "Mountain or forest soil is found in hill regions. It is rich in organic matter from leaf litter, acidic in nature, and well-suited for horticulture and plantation crops.",
    characteristics: ["Rich in humus", "Acidic in nature", "Good drainage on slopes", "Susceptible to erosion"],
    crops: ["Tea", "Apple", "Potato", "Wheat (lower slopes)", "Ginger", "Cardamom"],
    ph: "5.0 – 6.5",
    npk: "High organic N, Low P, Low K",
    recommendation: "Contour farming to prevent erosion. Avoid deforestation. Use terracing on slopes. Ideal for high-value horticultural crops.",
  },
  "Red": {
    emoji: "🔴",
    color: "from-red-500 to-rose-600",
    accent: "rose",
    description: "Red soil is formed from weathered crystalline rocks. Its red color comes from high iron oxide content. It is porous, well-drained but low in nitrogen and organic matter.",
    characteristics: ["Iron oxide gives red color", "Well-drained & porous", "Low N & organic matter", "Good for dryland farming"],
    crops: ["Groundnut", "Cotton", "Pulses", "Millets", "Castor", "Tobacco"],
    ph: "5.5 – 7.0",
    npk: "Low N, Low P, Moderate K",
    recommendation: "Add organic manure to improve fertility. Use green manuring. Suitable for groundnut and millets. Irrigation needed for best results.",
  },
  "Yellow": {
    emoji: "🟡",
    color: "from-yellow-500 to-amber-600",
    accent: "yellow",
    description: "Yellow soil is similar to red soil but with higher moisture content which converts iron oxides to hydrated forms, giving it a yellow tint. Found in humid tropical regions.",
    characteristics: ["Yellow from hydrated iron", "Low fertility", "Porous and well-drained", "Found in humid areas"],
    crops: ["Groundnut", "Rice", "Millets", "Pulses", "Vegetables"],
    ph: "5.0 – 6.5",
    npk: "Low N, Low P, Low K",
    recommendation: "Requires significant fertilization. Organic matter addition is essential. Good for groundnut in humid conditions.",
  },
};

// ── Tips for better photos ───────────────────────────────────────────────────
const PHOTO_TIPS = [
  "Take photo in natural daylight (not direct sunlight)",
  "Fill the frame with soil — no grass or leaves",
  "Ensure soil is dry or slightly moist, not waterlogged",
  "Zoom in close — 20–30 cm from the soil surface",
  "Avoid shadows falling on the soil sample",
  "Use the phone's main camera, not wide-angle",
];

// ── Confidence Bar ───────────────────────────────────────────────────────────
const ConfidenceBar = ({ label, value, isTop }) => {
  const pct = Math.round(value * 100);
  const barColor = isTop ? "bg-[#1E8E5A]" : "bg-slate-200";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-slate-500 w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
      <span className={`text-xs font-bold w-10 text-right ${isTop ? "text-[#1E8E5A]" : "text-slate-500"}`}>
        {pct}%
      </span>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
const SoilAnalysis = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);    // { soil_type, soil_type_clean, confidence, all_scores }
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showAllScores, setShowAllScores] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const headerRef = useRefHook(null);
  const contentRef = useRefHook(null);
  
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const contentInView = useInView(contentRef, { once: true, amount: 0.3 });

  const processFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image too large. Maximum size is 10 MB.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
    setAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await API.post("/ml/predict/soil", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to analyze. Please try again.";
      setError(msg);
      setPreview(null);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setError("");
    setAnalyzing(false);
    setShowAllScores(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Derive soil info ─────────────────────────────────────────────────────
  const cleanType = result
    ? (result.soil_type_clean || (result.soil_type || "").replace(/_Soil$/i, "").replace(/_/g, " ")).trim()
    : null;
  const soilData = cleanType ? SOIL_DATA[cleanType] : null;
  const soilTranslation = cleanType ? t(`soilData.${cleanType}`) : null;
  const confidence = result?.confidence ?? 0;
  const isLowConfidence = confidence < CONFIDENCE_THRESHOLD;

  // Sort all_scores for display
  const sortedScores = result?.all_scores
    ? Object.entries(result.all_scores)
        .map(([k, v]) => ({ label: k.replace(/_Soil$/i, "").replace(/_/g, " "), value: v, key: k }))
        .sort((a, b) => b.value - a.value)
    : [];
  const topKey = sortedScores[0]?.key;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0F4C3A] via-[#0F6B4A] to-[#124230] py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=1920&q=80')] bg-cover bg-center opacity-10" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#2BB673]/10 blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#2BB673]/15 border border-[#2BB673]/30 text-[#2BB673] text-[11px] font-bold px-4 py-2 rounded-full tracking-widest uppercase">
                  <FlaskConical className="w-4 h-4" />
                  {t('soilAI.aiVision')}
                </div>

                <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight font-heading">
                  {t('soilAI.subtitle')}
                  <span className="block text-[#2BB673] mt-2">{t('soilAI.platform')}</span>
                </h1>

                <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-lg">
                  {t('soilAI.desc')}
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
                      <div className="w-14 h-14 bg-[#2BB673] rounded-2xl flex items-center justify-center">
                        <FlaskConical className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">EfficientNet-B0</h3>
                        <p className="text-white/60 text-sm">{t('soilAI.modelDesc')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{t('soilAI.accuracy')}</p>
                        <p className="text-white text-3xl font-black font-heading">87%</p>
                      </div>
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{t('soilAI.types')}</p>
                        <p className="text-white text-3xl font-black font-heading">7</p>
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#2BB673]" />
                      <p className="text-white/80 text-sm">{t('soilAI.instantAI')}</p>
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
                <div className="w-12 h-12 bg-[#E6F5EE] rounded-xl flex items-center justify-center border border-emerald-200">
                  <FlaskConical className="w-6 h-6 text-[#1E8E5A]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 font-heading">{t('soilAI.title')}</h1>
                  <p className="text-sm text-slate-500">EfficientNet-B0 Deep Learning Model · 7 Soil Type Classification</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Photo Tips Toggle */}
          <button
            onClick={() => setShowTips(t => !t)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all shadow-sm mb-6"
          >
            <Info className="w-4 h-4" />
            {t('soilAI.photoTipsToggle')}
            <ChevronDown className={`w-4 h-4 transition-transform ${showTips ? "rotate-180" : ""}`} />
          </button>

          {/* Photo Tips Panel */}
          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-500" /> {t('soilAI.photoTipsTitle')}
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PHOTO_TIPS.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-blue-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Grid */}
          <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left: Upload */}
            <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={contentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#1E8E5A]" />
                  {t('soilAI.uploadPhoto')}
                </h2>

                {!preview ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[300px] ${
                      isDragging
                        ? "border-[#1E8E5A] bg-[#E6F5EE]/40"
                        : "border-slate-200 hover:border-[#1E8E5A] hover:bg-[#E6F5EE]/20"
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all border ${isDragging ? "bg-[#E6F5EE] border-[#1E8E5A]" : "bg-slate-50 border-slate-200"}`}>
                      <Camera className={`w-6 h-6 transition-colors ${isDragging ? "text-[#0F6B4A]" : "text-slate-400"}`} />
                    </div>
                    <p className="text-sm font-bold text-slate-700 mb-1">
                      {isDragging ? t('soilAI.releaseUpload') : t('soilAI.dragDrop')}
                    </p>
                    <p className="text-xs text-slate-400 mb-4">{t('soilAI.clickBrowse')}</p>
                    <span className="text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-500 px-3 py-1.5 rounded-full">
                      {t('soilAI.formatNote')}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Image Preview */}
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-50 flex items-center justify-center">
                      <img
                        src={preview}
                        alt="Soil sample"
                        className={`w-full h-full object-cover transition-all duration-500 ${analyzing ? "blur-sm brightness-75" : ""}`}
                      />
                      {analyzing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm">
                          <Loader2 className="w-10 h-10 text-[#1E8E5A] animate-spin mb-3" />
                          <span className="text-xs text-slate-700 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
                            {t('soilAI.analyzing')}
                          </span>
                        </div>
                      )}
                      {!analyzing && (
                        <button
                          onClick={handleReset}
                          className="absolute top-3 right-3 bg-white/95 hover:bg-white text-slate-800 rounded-full p-2 transition-all shadow-md border border-slate-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Initial error or Reset options */}
              <div className="mt-6">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3.5 rounded-xl mb-4 font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                {preview && !analyzing && (
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> {t('soilAI.analyzeAnother')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>

            {/* Right: Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={contentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col gap-4"
            >
            <AnimatePresence mode="wait">
              {!result && !analyzing && (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[380px] text-center shadow-sm"
                >
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mb-4">
                    <FlaskConical className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-800 font-bold text-sm">{t('soilAI.waitingUpload')}</p>
                  <p className="text-slate-400 text-xs mt-1">{t('soilAI.waitingDesc')}</p>
                </motion.div>
              )}

              {analyzing && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[380px] shadow-sm"
                >
                  <Loader2 className="w-10 h-10 text-[#1E8E5A] animate-spin mb-4" />
                  <p className="text-slate-800 text-sm font-bold">{t('soilAI.inferencing')}</p>
                  <p className="text-slate-400 text-xs mt-1">{t('soilAI.inferencingDesc')}</p>
                </motion.div>
              )}

              {result && !analyzing && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 60 }}
                  className="space-y-6"
                >
                  {/* Low Confidence Warning */}
                  {isLowConfidence && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm"
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-700">{t('soilAI.lowConfidence')}</p>
                        <p className="text-[11px] text-amber-650 mt-0.5 leading-relaxed font-semibold">
                          {t('soilAI.lowConfidenceDesc')}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Soil Type Hero Card */}
                  {soilData ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                      {/* Accent color background overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${soilData.color} opacity-[0.03] rounded-3xl`} />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <span className="text-3xl mb-2 block select-none">{soilData.emoji}</span>
                            <h2 className="text-2xl font-black text-slate-800 font-heading">{soilTranslation?.name || cleanType} Soil</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{t('soilAI.classificationResult')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-4xl font-black text-slate-800 tracking-tighter">{Math.round(confidence * 100)}%</p>
                            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black">{t('soilAI.confidence')}</p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4 border border-slate-200/50">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(confidence * 100)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${isLowConfidence ? "bg-amber-500" : "bg-[#1E8E5A]"}`}
                          />
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{soilTranslation?.description || soilData.description}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <p className="text-lg font-bold text-slate-800">{soilTranslation?.name || cleanType} Soil</p>
                      <p className="text-xs text-[#1E8E5A] mt-1 font-bold">{t('soilAI.confidence')}: {Math.round(confidence * 100)}%</p>
                    </div>
                  )}

                  {soilData && (
                    <>
                      {/* Characteristics */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{t('soilAI.diagnosticProfile')}</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {(soilTranslation?.characteristics || soilData.characteristics).map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                              <div className="w-2 h-2 rounded-full bg-[#1E8E5A] shrink-0" />
                              <span className="truncate">{c}</span>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('soilAI.phIndex')}</p>
                            <p className="text-sm font-bold text-slate-850 mt-0.5 leading-none">{soilTranslation?.ph || soilData.ph}</p>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t('soilAI.npkRatios')}</p>
                            <p className="text-sm font-bold text-slate-850 mt-0.5 leading-none">{soilTranslation?.npk || soilData.npk}</p>
                          </div>
                        </div>
                      </div>

                      {/* Suitable Crops */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Wheat className="w-4 h-4 text-[#1E8E5A]" /> {t('soilAI.compatibleCrops')}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {(soilTranslation?.crops || soilData.crops).map((crop) => (
                            <span key={crop} className="px-3.5 py-1.5 bg-[#E6F5EE] border border-emerald-200/50 text-[#0F6B4A] text-xs rounded-full font-bold">
                              {crop}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="bg-[#E6F5EE] border border-emerald-200/40 rounded-3xl p-5 flex items-start gap-4">
                        <CheckCircle2 className="w-5.5 h-5.5 text-[#1E8E5A] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-[#0F6B4A] mb-1">{t('soilAI.agronomyAdvisory')}</p>
                          <p className="text-xs text-[#1E8E5A] leading-relaxed font-bold">{soilTranslation?.recommendation || soilData.recommendation}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* All Model Scores */}
                  {sortedScores.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                      <button
                        onClick={() => setShowAllScores(s => !s)}
                        className="flex items-center justify-between w-full text-left"
                      >
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('soilAI.modelMatrix')}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showAllScores ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {showAllScores && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-5 space-y-3.5">
                              {sortedScores.map((item) => (
                                <ConfidenceBar
                                  key={item.key}
                                  label={item.label}
                                  value={item.value}
                                  isTop={item.key === topKey}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            </motion.div>
          </div>

          {/* Bottom Info Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { icon: Sun, label: t('soilAI.corePipeline'), value: t('soilAI.modelValue'), color: "text-amber-500" },
              { icon: Droplets, label: t('soilAI.classDatabase'), value: t('soilAI.classValue'), color: "text-blue-500" },
              { icon: Thermometer, label: t('soilAI.reliability'), value: t('soilAI.reliabilityValue'), color: "text-[#1E8E5A]" },
            ].map((item) => (
              <div key={item.label} className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm">
                <item.icon className={`w-5 h-5 shrink-0 ${item.color}`} />
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="h-8" />
        </section>
      </main>
    </div>
  );
};

export default SoilAnalysis;

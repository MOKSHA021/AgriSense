import { useState } from "react";
import API from "../../services/api";
import { CROPS } from "./constants";
import { TrendingUp, Wheat, Calendar, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ML service supports: Wheat, Rice, Maize, Mustard, Tomato, Potato, Onion
const ML_SUPPORTED_CROPS = ["Wheat", "Rice", "Maize", "Mustard", "Tomato", "Potato", "Onion"];

const defaultHarvestDate = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
};

const CROP_ICONS = Object.fromEntries(CROPS.map((c) => [c.name, c.icon]));

const PricePrediction = () => {
  const [predForm, setPredForm] = useState({ crop: "", harvest_date: defaultHarvestDate() });
  const [prediction, setPrediction] = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const [predError, setPredError] = useState("");
  const [predSource, setPredSource] = useState(""); // "ml" | "fallback"

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredLoading(true); setPredError(""); setPrediction(null); setPredSource("");
    const cropName = predForm.crop;
    const isMLSupported = ML_SUPPORTED_CROPS.includes(cropName);

    if (isMLSupported) {
      try {
        const { data } = await API.post("/ml/predict/price", { crop_name: cropName, harvest_date: predForm.harvest_date });
        const range = Math.round(data.upper_bound) - Math.round(data.lower_bound);
        setPrediction({
          predicted_price:  Math.round(data.predicted_price),
          min_price:        Math.round(data.lower_bound),
          max_price:        Math.round(data.upper_bound),
          confidence:       data.confidence_level === "historical" ? 100 : data.confidence_level === "90%" ? 90 : 85,
          confidence_level: data.confidence_level,
          advice: `Prophet time-series forecast for ${data.crop} on ${data.harvest_date}. Expected price range: ₹${Math.round(data.lower_bound).toLocaleString("en-IN")} – ₹${Math.round(data.upper_bound).toLocaleString("en-IN")} (±₹${Math.round(range / 2).toLocaleString("en-IN")}).`,
          data_points: null,
          crop: data.crop,
          harvest_date: data.harvest_date,
        });
        setPredSource("ml");
      } catch (mlErr) {
        console.warn("[PricePrediction] ML failed, falling back:", mlErr.message);
        await fallbackPredict(cropName);
      }
    } else {
      await fallbackPredict(cropName);
    }
    setPredLoading(false);
  };

  const fallbackPredict = async (cropName) => {
    try {
      const month = new Date(predForm.harvest_date).getMonth() + 1;
      const year = new Date(predForm.harvest_date).getFullYear();
      const season = month >= 6 && month <= 10 ? "Kharif" : month >= 11 || month <= 3 ? "Rabi" : "Zaid";
      const { data } = await API.post("/market/predict", { crop: cropName, state: "Uttar Pradesh", season, year });
      setPrediction({ ...data, harvest_date: predForm.harvest_date, crop: cropName });
      setPredSource("fallback");
    } catch (err) {
      setPredError(err.response?.data?.message || "Prediction failed. Try again.");
    }
  };

  const mlCrops = CROPS.filter((c) => ML_SUPPORTED_CROPS.includes(c.name));
  const otherCrops = CROPS.filter((c) => !ML_SUPPORTED_CROPS.includes(c.name));

  // Price range bar calculation
  const priceRangePct = prediction
    ? Math.round(((prediction.predicted_price - prediction.min_price) / Math.max(prediction.max_price - prediction.min_price, 1)) * 100)
    : 50;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-800">
      {/* ════ Left: Form ════ */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit"
      >
        <h2 className="text-base font-bold text-slate-800 mb-1.5 font-heading">Configure Predictor</h2>
        <p className="text-xs font-semibold text-slate-400 mb-6">Choose crop and harvest targets to project rates.</p>
        
        {/* ML model support chips */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {ML_SUPPORTED_CROPS.map((c) => (
            <span key={c} className="text-[9px] font-black bg-blue-50 border border-blue-100 text-[#2F80ED] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {c}
            </span>
          ))}
        </div>

        {predError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl mb-6 font-bold">
            ⚠️ {predError}
          </div>
        )}

        <form onSubmit={handlePredict} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Wheat className="w-3.5 h-3.5 text-slate-450" /> Target Commodity
            </label>
            <select
              value={predForm.crop}
              onChange={(e) => setPredForm({ ...predForm, crop: e.target.value })}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-colors focus:border-[#1E8E5A] focus:outline-none focus:ring-2 focus:ring-[#1E8E5A]/10 appearance-none font-medium"
            >
              <option value="" className="bg-white text-slate-800">Select crop</option>
              <optgroup label="🤖 Prophet ML Model" className="bg-white text-slate-800 font-bold">
                {mlCrops.map((c) => <option key={c.name} value={c.name} className="bg-white text-slate-800">{c.icon} {c.name}</option>)}
              </optgroup>
              <optgroup label="📊 Statistical Fallback" className="bg-white text-slate-800 font-bold">
                {otherCrops.map((c) => <option key={c.name} value={c.name} className="bg-white text-slate-800">{c.icon} {c.name}</option>)}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-450" /> Target Harvest Date
            </label>
            <input
              type="date"
              value={predForm.harvest_date}
              min={new Date().toISOString().split("T")[0]}
              max={new Date(Date.now() + 3 * 365 * 86400000).toISOString().split("T")[0]}
              onChange={(e) => setPredForm({ ...predForm, harvest_date: e.target.value })}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-colors focus:border-[#1E8E5A] focus:outline-none focus:ring-2 focus:ring-[#1E8E5A]/10 font-medium"
            />
            <p className="text-[10px] text-slate-400 mt-2 font-semibold">Allows forecasts up to 3 calendar years</p>
          </div>

          <button
            type="submit"
            disabled={predLoading}
            className="w-full mt-2 py-3.5 bg-[#1E8E5A] hover:bg-[#0F6B4A] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 shadow-md shadow-[#1E8E5A]/10 active:scale-95"
          >
            {predLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
            {predLoading ? "Computing Forecasting Algorithms..." : "Forecast Rate"}
          </button>
        </form>
      </motion.div>

      {/* ════ Right: Result ════ */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="lg:col-span-7 flex flex-col gap-4"
      >
        {predLoading && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[350px] shadow-sm">
             <Loader2 className="w-8 h-8 animate-spin text-[#1E8E5A] mb-4" />
             <p className="text-slate-850 font-bold text-base font-heading">Executing Prophet Inferences</p>
             <p className="text-slate-400 text-xs font-semibold mt-1">Regulating trend margins and compiling seasonal graphs...</p>
          </div>
        )}

        <AnimatePresence mode="wait">
        {prediction && !predLoading && (
          <motion.div 
            key="prediction"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-3xl select-none">{CROP_ICONS[prediction.crop] || "🌾"}</span>
                  <h3 className="text-xl font-extrabold text-slate-800 tracking-tight font-heading">{prediction.crop}</h3>
                </div>
                <p className="text-xs font-semibold text-slate-400">Target Harvest: <span className="text-slate-650 font-bold">{prediction.harvest_date}</span></p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${predSource === "ml" ? "bg-blue-50 text-[#2F80ED] border-blue-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                  {predSource === "ml" ? "🤖 Prophet AI" : "📊 Statistical"}
                </span>
                {prediction.confidence_level && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                    {prediction.confidence_level}
                  </span>
                )}
              </div>
            </div>

            {/* Big price display */}
            <div className="text-center bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl py-8 px-5 border border-slate-200/50 shadow-inner">
              <p className="text-slate-400 text-[10px] mb-2 font-bold uppercase tracking-widest">Expected Market Price</p>
              <p className="text-6xl font-black text-slate-800 tracking-tighter">
                <span className="text-slate-450 mr-1 font-heading">₹</span>
                <span>
                  {prediction.predicted_price?.toLocaleString("en-IN") ?? "—"}
                </span>
              </p>
              <p className="text-slate-400 text-[10px] mt-2 font-bold uppercase tracking-wider">per quintal</p>
            </div>

            {/* Price Range Visual */}
            {prediction.min_price != null && prediction.max_price != null && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/50">
                <div className="flex justify-between text-xs text-slate-600 mb-3 font-bold uppercase tracking-wider">
                  <span className="text-red-650">Low: ₹{prediction.min_price?.toLocaleString("en-IN")}</span>
                  <span className="text-[#0F6B4A]">High: ₹{prediction.max_price?.toLocaleString("en-IN")}</span>
                </div>
                {/* Range bar marker */}
                <div className="relative w-full h-3.5 bg-slate-200 rounded-full shadow-inner border border-slate-200">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5.5 h-5.5 bg-white rounded-full shadow border-2 border-[#1E8E5A] transition-all duration-1000 ease-out"
                    style={{ left: `calc(${priceRangePct}% - 11px)` }}
                    title={`₹${prediction.predicted_price?.toLocaleString("en-IN")}`}
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-3 text-center font-bold uppercase tracking-widest">Price Uncertainty Margins</p>
              </div>
            )}

            {/* Confidence bar */}
            {prediction.confidence != null && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/50">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Historical Match Confidence</span>
                  <span className="text-xs font-black text-[#1E8E5A]">{prediction.confidence}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 shadow-inner">
                  <div className="bg-[#1E8E5A] h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(prediction.confidence, 100)}%` }} />
                </div>
              </div>
            )}

            {/* Advice */}
            {prediction.advice && (
              <div className="bg-[#E6F5EE] border border-emerald-200/50 rounded-2xl p-5 flex gap-3.5">
                <span className="text-2xl shrink-0 select-none">💡</span>
                <p className="text-xs font-bold text-[#0F6B4A] leading-relaxed">{prediction.advice}</p>
              </div>
            )}

            {/* Footer */}
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center">
              {predSource === "ml"
                ? "📈 Facebook Prophet Model Trained Over Historical Agmarknet Pricing Series"
                : "📊 Baseline Multi-Average Historical Seasonality Index Mapping"}
            </p>
          </motion.div>
        )}
        </AnimatePresence>

        {!prediction && !predLoading && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[350px] shadow-sm text-center">
            <TrendingUp className="w-8 h-8 text-slate-305 mb-4" />
            <p className="text-slate-800 font-bold text-sm mb-1">Forecasting engine primed</p>
            <p className="text-slate-400 text-xs font-semibold">Select crop variables above to check Prophet ML forecasts.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PricePrediction;

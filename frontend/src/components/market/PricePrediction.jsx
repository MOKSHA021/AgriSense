import { useState } from "react";
import API from "../../services/api";
import { CROPS } from "./constants";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* ════ Left: Form ════ */}
      <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-7 shadow-xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-1">🤖 Price Prediction</h2>
        <p className="text-white/40 text-sm mb-1">Facebook Prophet time-series model for 7 crops.</p>
        <div className="flex flex-wrap gap-1.5 mb-6">
          {ML_SUPPORTED_CROPS.map((c) => (
            <span key={c} className="text-[10px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{c}</span>
          ))}
        </div>

        {predError && (
          <div className="bg-red-500/20 text-red-300 text-sm px-4 py-3 rounded-2xl mb-4 border border-red-500/30">⚠️ {predError}</div>
        )}

        <form onSubmit={handlePredict} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold text-white/60 mb-1.5 block">🌾 Crop</label>
            <select
              value={predForm.crop}
              onChange={(e) => setPredForm({ ...predForm, crop: e.target.value })}
              required
              className="w-full px-4 py-3 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/5"
            >
              <option value="" className="bg-zinc-900 text-white">Select crop</option>
              <optgroup label="🤖 Prophet ML Model" className="bg-zinc-900 text-white">
                {mlCrops.map((c) => <option key={c.name} value={c.name} className="bg-zinc-900 text-white">{c.icon} {c.name}</option>)}
              </optgroup>
              <optgroup label="📊 Statistical Fallback" className="bg-zinc-900 text-white">
                {otherCrops.map((c) => <option key={c.name} value={c.name} className="bg-zinc-900 text-white">{c.icon} {c.name}</option>)}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-white/60 mb-1.5 block">📅 Expected Harvest Date</label>
            <input
              type="date"
              value={predForm.harvest_date}
              min={new Date().toISOString().split("T")[0]}
              max={new Date(Date.now() + 3 * 365 * 86400000).toISOString().split("T")[0]}
              onChange={(e) => setPredForm({ ...predForm, harvest_date: e.target.value })}
              required
              className="w-full px-4 py-3 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white/5"
            />
            <p className="text-xs text-white/30 mt-1">Prophet forecasts up to 3 years ahead</p>
          </div>

          <button
            type="submit"
            disabled={predLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 shadow-lg shadow-green-900/30 transition-all"
          >
            {predLoading ? "⏳ Running Prophet Model..." : "🤖 Predict Price →"}
          </button>
        </form>
      </div>

      {/* ════ Right: Result ════ */}
      <div className="flex flex-col gap-4">
        {predLoading && (
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 flex items-center justify-center min-h-[350px]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <span className="text-3xl animate-spin">⚙️</span>
              </div>
              <p className="text-white/50 text-sm">Running Prophet model...</p>
              <div className="flex gap-1 justify-center">
                {[0,1,2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {prediction && !predLoading && (
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-7 shadow-xl border border-white/10 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{CROP_ICONS[prediction.crop] || "🌾"}</span>
                  <h3 className="text-lg font-bold text-white">{prediction.crop}</h3>
                </div>
                <p className="text-xs text-white/40">Harvest: {prediction.harvest_date}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${predSource === "ml" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-orange-500/20 text-orange-300 border-orange-500/30"}`}>
                  {predSource === "ml" ? "🤖 Prophet ML" : "📊 Statistical"}
                </span>
                {prediction.confidence_level && (
                  <span className="text-xs font-semibold bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30">{prediction.confidence_level}</span>
                )}
              </div>
            </div>

            {/* Big price */}
            <div className="text-center bg-gradient-to-br from-emerald-500/20 to-green-500/10 rounded-2xl py-8 px-4 border border-emerald-500/30">
              <p className="text-white/40 text-xs mb-2 uppercase tracking-widest">Predicted Price</p>
              <p className="text-6xl font-black text-white">
                ₹<span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                  {prediction.predicted_price?.toLocaleString("en-IN") ?? "—"}
                </span>
              </p>
              <p className="text-white/30 text-xs mt-2">per quintal</p>
            </div>

            {/* Price Range Visual */}
            {prediction.min_price != null && prediction.max_price != null && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex justify-between text-xs text-white/50 mb-2">
                  <span className="text-red-400 font-semibold">Low: ₹{prediction.min_price?.toLocaleString("en-IN")}</span>
                  <span className="text-green-400 font-semibold">High: ₹{prediction.max_price?.toLocaleString("en-IN")}</span>
                </div>
                {/* Range bar with marker */}
                <div className="relative w-full h-4 bg-gradient-to-r from-red-500/40 via-yellow-500/40 to-green-500/40 rounded-full">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-xl border-2 border-emerald-400 transition-all duration-700"
                    style={{ left: `calc(${priceRangePct}% - 10px)` }}
                    title={`₹${prediction.predicted_price?.toLocaleString("en-IN")}`}
                  />
                </div>
                <p className="text-xs text-white/30 mt-2 text-center">Price uncertainty band</p>
              </div>
            )}

            {/* Confidence */}
            {prediction.confidence != null && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-white/50 font-medium">Model Confidence</span>
                  <span className="text-sm font-bold text-emerald-400">{prediction.confidence}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full transition-all duration-700" style={{ width: `${Math.min(prediction.confidence, 100)}%` }} />
                </div>
                {prediction.data_points != null && (
                  <p className="text-xs text-white/30 mt-1.5 text-right">Based on {prediction.data_points} records</p>
                )}
              </div>
            )}

            {/* Advice */}
            {prediction.advice && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
                <span className="text-xl shrink-0">💡</span>
                <p className="text-sm text-amber-300/90 leading-relaxed">{prediction.advice}</p>
              </div>
            )}

            {/* Footer */}
            <p className="text-xs text-white/30 text-center">
              {predSource === "ml"
                ? "📈 Facebook Prophet time-series model trained on historical mandi data"
                : "📊 Statistical model based on historical price averages"}
            </p>
          </div>
        )}

        {!prediction && !predLoading && (
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 flex items-center justify-center min-h-[350px]">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <TrendingUp className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-white/50 font-semibold text-sm">No prediction yet</p>
              <p className="text-white/30 text-xs">Select a crop and harvest date to get an AI price forecast</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricePrediction;

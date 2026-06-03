import { useState } from "react";
import API from "../../services/api";
import { CROPS } from "./constants";
import { TrendingUp, Wheat, Calendar, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../translations";

// ML service supports: Wheat, Rice, Maize, Mustard, Tomato, Potato, Onion
const ML_SUPPORTED_CROPS = ["Wheat", "Rice", "Maize", "Mustard", "Tomato", "Potato", "Onion"];

const defaultHarvestDate = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
};

const CROP_ICONS = Object.fromEntries(CROPS.map((c) => [c.name, c.icon]));

const PricePrediction = () => {
  const { t } = useTranslation();
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
          predicted_price: Math.round(data.predicted_price),
          min_price: Math.round(data.lower_bound),
          max_price: Math.round(data.upper_bound),
          confidence: data.confidence_level === "historical" ? 100 : data.confidence_level === "90%" ? 90 : 85,
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
      setPredError(err.response?.data?.message || t('market.predictionFailed'));
    }
  };

  const mlCrops = CROPS.filter((c) => ML_SUPPORTED_CROPS.includes(c.name));
  const otherCrops = CROPS.filter((c) => !ML_SUPPORTED_CROPS.includes(c.name));

  // Price range bar calculation
  const priceRangePct = prediction
    ? Math.round(((prediction.predicted_price - prediction.min_price) / Math.max(prediction.max_price - prediction.min_price, 1)) * 100)
    : 50;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ════ Left: Form ════ */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="lg:col-span-5 bg-white shadow-xl rounded-[2rem] p-8 shadow-2xl border border-slate-200 h-fit"
      >
        <h2 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">{t('market.configureModel')}</h2>
        <p className="text-slate-500 text-sm mb-6 font-medium">{t('market.prophetModelDesc')}</p>
        <div className="flex flex-wrap gap-2 mb-8">
          {ML_SUPPORTED_CROPS.map((c) => (
            <span key={c} className="text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {t(`crops.${c}`)}
            </span>
          ))}
        </div>

        {predError && (
          <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 border border-red-500/20 font-medium">
            ⚠️ {predError}
          </div>
        )}

        <form onSubmit={handlePredict} className="flex flex-col gap-6">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Wheat className="w-3.5 h-3.5" /> {t('market.crop')}
            </label>
            <select
              value={predForm.crop}
              onChange={(e) => setPredForm({ ...predForm, crop: e.target.value })}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 bg-white/5 transition-colors appearance-none"
            >
              <option value="" className="bg-white text-slate-800">{t('market.selectCrop')}</option>
              <optgroup label={t('market.prophetMLModel')} className="bg-white text-slate-800">
                {mlCrops.map((c) => <option key={c.name} value={c.name} className="bg-white text-slate-800">{c.icon} {t(`crops.${c.name}`)}</option>)}
              </optgroup>
              <optgroup label={t('market.statisticalFallback')} className="bg-white text-slate-800">
                {otherCrops.map((c) => <option key={c.name} value={c.name} className="bg-white text-slate-800">{c.icon} {t(`crops.${c.name}`)}</option>)}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {t('market.expectedHarvestDate')}
            </label>
            <input
              type="date"
              value={predForm.harvest_date}
              min={new Date().toISOString().split("T")[0]}
              max={new Date(Date.now() + 3 * 365 * 86400000).toISOString().split("T")[0]}
              onChange={(e) => setPredForm({ ...predForm, harvest_date: e.target.value })}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 bg-white/5 transition-colors"
            />
            <p className="text-xs text-slate-800/30 mt-2 font-medium">{t('market.prophetForecastNote')}</p>
          </div>

          <button
            type="submit"
            disabled={predLoading}
            className="w-full mt-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-bold rounded-xl hover:from-blue-500 hover:to-indigo-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            {predLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
            {predLoading ? t('market.runningProphet') : t('market.predictPrice')}
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
          <div className="bg-white shadow-xl rounded-[2rem] p-12 border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p className="text-slate-800 font-bold text-lg">{t('market.runningProphet')}</p>
            <p className="text-slate-500 text-sm font-medium mt-1">{t('market.analyzingData')}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {prediction && !predLoading && (
            <motion.div
              key="prediction"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white shadow-xl rounded-[2rem] p-8 shadow-2xl border border-slate-200 space-y-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl">{CROP_ICONS[prediction.crop] || "🌾"}</span>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{t(`crops.${prediction.crop}`)}</h3>
                  </div>
                  <p className="text-sm font-medium text-slate-500">{t('market.harvest')} <span className="text-slate-600">{prediction.harvest_date}</span></p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${predSource === "ml" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" : "bg-orange-500/20 text-orange-300 border-orange-500/30"}`}>
                    {predSource === "ml" ? t('market.prophetML') : t('market.statistical')}
                  </span>
                  {prediction.confidence_level && (
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                      {prediction.confidence_level}
                    </span>
                  )}
                </div>
              </div>

              {/* Big price */}
              <div className="text-center bg-gradient-to-br from-blue-500/10 to-indigo-500/5 rounded-3xl py-10 px-6 border border-blue-500/20 shadow-inner">
                <p className="text-blue-400/60 text-xs mb-3 font-bold uppercase tracking-[0.2em]">{t('market.predictedPrice')}</p>
                <p className="text-7xl font-black text-slate-800 tracking-tighter">
                  <span className="text-blue-500/50 mr-1">₹</span>
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                    {prediction.predicted_price?.toLocaleString("en-IN") ?? "—"}
                  </span>
                </p>
                <p className="text-slate-800/30 text-sm mt-3 font-medium uppercase tracking-wider">{t('market.perQuintal')}</p>
              </div>

              {/* Price Range Visual */}
              {prediction.min_price != null && prediction.max_price != null && (
                <div className="bg-white/5 rounded-2xl p-5 border border-slate-200">
                  <div className="flex justify-between text-xs text-slate-500 mb-3 font-bold uppercase tracking-wider">
                    <span className="text-red-400">{t('market.low')} ₹{prediction.min_price?.toLocaleString("en-IN")}</span>
                    <span className="text-emerald-400">{t('market.high')} ₹{prediction.max_price?.toLocaleString("en-IN")}</span>
                  </div>
                  {/* Range bar with marker */}
                  <div className="relative w-full h-4 bg-gradient-to-r from-red-500/40 via-yellow-500/40 to-emerald-500/40 rounded-full shadow-inner">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] border-4 border-blue-500 transition-all duration-1000 ease-out"
                      style={{ left: `calc(${priceRangePct}% - 12px)` }}
                      title={`₹${prediction.predicted_price?.toLocaleString("en-IN")}`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-800/30 mt-3 text-center font-bold uppercase tracking-widest">{t('market.priceUncertaintyBand')}</p>
                </div>
              )}

              {/* Confidence */}
              {prediction.confidence != null && (
                <div className="bg-white/5 rounded-2xl p-5 border border-slate-200">
                  <div className="flex justify-between mb-3">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('market.modelConfidence')}</span>
                    <span className="text-sm font-black text-blue-400">{prediction.confidence}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 shadow-inner">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-400 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${Math.min(prediction.confidence, 100)}%` }} />
                  </div>
                  {prediction.data_points != null && (
                    <p className="text-[10px] text-slate-800/30 mt-3 text-right font-bold uppercase tracking-widest">{t('market.basedOnRecords')} {prediction.data_points}</p>
                  )}
                </div>
              )}

              {/* Advice */}
              {prediction.advice && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex gap-4">
                  <span className="text-2xl shrink-0">💡</span>
                  <p className="text-sm font-medium text-blue-200/90 leading-relaxed">{prediction.advice}</p>
                </div>
              )}

              {/* Footer */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-800/30 text-center">
                {predSource === "ml"
                  ? t('market.prophetFooter')
                  : t('market.statisticalFooter')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {!prediction && !predLoading && (
          <div className="bg-white shadow-xl rounded-[2rem] p-12 border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
            <TrendingUp className="w-10 h-10 text-slate-800/20 mb-4" />
            <p className="text-slate-800 font-bold text-lg mb-1">{t('market.noPredictionYet')}</p>
            <p className="text-slate-500 text-sm font-medium">{t('market.selectCropAndDate')}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PricePrediction;

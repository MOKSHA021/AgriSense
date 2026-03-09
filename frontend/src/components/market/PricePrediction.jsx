import { useState } from "react";
import API from "../../services/api";
import { CROPS, STATES, SEASONS } from "./constants";

const PricePrediction = () => {
  const [predForm, setPredForm] = useState({
    crop: "",
    state: "",
    season: "",
    year: new Date().getFullYear(),
  });
  const [prediction, setPrediction] = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const [predError, setPredError] = useState("");

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredLoading(true);
    setPredError("");
    setPrediction(null);
    try {
      const { data } = await API.post("/market/predict", predForm);
      // Backend sends: { predicted_price, min_price, max_price,
      //                  confidence, advice, data_points, crop, state, season, year }
      setPrediction(data);
    } catch (err) {
      setPredError(err.response?.data?.message || "Prediction failed. Try again.");
    } finally {
      setPredLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* ════ Left: Form ════ */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-1">🤖 Price Prediction</h2>
        <p className="text-gray-400 text-sm mb-6">
          AI-powered future price forecast for your crop.
        </p>

        {predError && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-2xl mb-4 border border-red-100">
            ⚠️ {predError}
          </div>
        )}

        <form onSubmit={handlePredict} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">🌾 Crop</label>
            <select
              value={predForm.crop}
              onChange={(e) => setPredForm({ ...predForm, crop: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
            >
              <option value="">Select crop</option>
              {CROPS.map((c) => (
                <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">📍 State</label>
            <select
              value={predForm.state}
              onChange={(e) => setPredForm({ ...predForm, state: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
            >
              <option value="">Select state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">🗓️ Season</label>
            <select
              value={predForm.season}
              onChange={(e) => setPredForm({ ...predForm, season: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
            >
              <option value="">Select season</option>
              {SEASONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">📅 Year</label>
            <input
              type="number"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 5}
              value={predForm.year}
              onChange={(e) => setPredForm({ ...predForm, year: Number(e.target.value) })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
            />
          </div>

          <button
            type="submit"
            disabled={predLoading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 shadow-md transition"
          >
            {predLoading ? "⏳ Running model..." : "🤖 Predict Price →"}
          </button>
        </form>
      </div>

      {/* ════ Right: Result ════ */}
      <div className="flex flex-col gap-4">

        {predLoading && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-3">
              <p className="text-3xl animate-spin">⚙️</p>
              <p className="text-gray-400 text-sm animate-pulse">Running prediction model...</p>
            </div>
          </div>
        )}

        {prediction && !predLoading && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-5">

            {/* Context pills */}
            <div className="flex flex-wrap gap-2">
              {[prediction.crop, prediction.state, prediction.season, prediction.year].map((v, i) => (
                <span
                  key={i}
                  className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium border border-emerald-100"
                >
                  {v}
                </span>
              ))}
            </div>

            {/* Big predicted price — backend field: predicted_price */}
            <div className="text-center bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl py-6 px-4 border border-emerald-100">
              <p className="text-gray-500 text-xs mb-2 uppercase tracking-wide">Predicted Price</p>
              <p className="text-5xl font-extrabold text-emerald-600">
                ₹{prediction.predicted_price?.toLocaleString() ?? "—"}
              </p>
              <p className="text-gray-400 text-xs mt-2">per quintal</p>
            </div>

            {/* Confidence — backend field: confidence */}
            {prediction.confidence != null && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600 font-medium">Model Confidence</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {prediction.confidence}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(prediction.confidence, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">
                  Based on {prediction.data_points} historical records
                </p>
              </div>
            )}

            {/* Price Range — backend fields: min_price, max_price */}
            {prediction.min_price != null && prediction.max_price != null && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
                  <p className="text-xs text-gray-400 mb-1">Low Estimate</p>
                  <p className="font-bold text-red-500 text-xl">
                    ₹{prediction.min_price?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                  <p className="text-xs text-gray-400 mb-1">High Estimate</p>
                  <p className="font-bold text-green-600 text-xl">
                    ₹{prediction.max_price?.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Advice — backend field: advice (season-specific string) */}
            {prediction.advice && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                <span className="text-xl flex-shrink-0">💡</span>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {prediction.advice}
                </p>
              </div>
            )}

            {/* Data points footer */}
            {prediction.data_points != null && (
              <p className="text-xs text-gray-400 text-center">
                📊 Prediction based on {prediction.data_points} historical price records from {prediction.state}
              </p>
            )}
          </div>
        )}

        {!prediction && !predLoading && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-2">
              <p className="text-4xl">🤖</p>
              <p className="text-gray-500 font-semibold text-sm">No prediction yet</p>
              <p className="text-gray-400 text-xs">Fill the form to get an AI price forecast</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricePrediction;

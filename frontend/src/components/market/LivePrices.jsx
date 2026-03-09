import { useState } from "react";
import API from "../../services/api";
import { CROPS, STATES } from "./constants";

const LivePrices = () => {
  const [liveCrop, setLiveCrop] = useState("");
  const [liveState, setLiveState] = useState("");
  const [liveData, setLiveData] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState("");

  const handleLiveFetch = async (e) => {
    e.preventDefault();
    setLiveLoading(true);
    setLiveError("");
    setLiveData(null);
    try {
      const { data } = await API.get("/market/live-prices", {
        params: { crop: liveCrop, state: liveState },
      });

      // Backend sends: { markets, avgModal, minPrice, maxPrice, crop, state, source }
      setLiveData(data);

    } catch (err) {
      setLiveError(err.response?.data?.message || "Failed to fetch prices");
    } finally {
      setLiveLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* ════ Left: Form ════ */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-1">📋 Live Market Prices</h2>
        <p className="text-gray-400 text-sm mb-6">Today's prices from mandis across India.</p>

        {liveError && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-2xl mb-4 border border-red-100">
            ⚠️ {liveError}
          </div>
        )}

        <form onSubmit={handleLiveFetch} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1.5 block">🌾 Crop</label>
            <select
              value={liveCrop}
              onChange={(e) => setLiveCrop(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
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
              value={liveState}
              onChange={(e) => setLiveState(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
            >
              <option value="">Select state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={liveLoading}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 shadow-md transition"
          >
            {liveLoading ? "⏳ Fetching..." : "📊 Get Live Prices →"}
          </button>
        </form>
      </div>

      {/* ════ Right: Results ════ */}
      <div className="flex flex-col gap-4">

        {liveLoading && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-3">
              <p className="text-3xl animate-bounce">📊</p>
              <p className="text-gray-400 text-sm animate-pulse">Fetching live prices...</p>
            </div>
          </div>
        )}

        {liveData && !liveLoading && (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl px-5 py-3 text-white flex items-center justify-between">
              <span className="font-semibold text-sm">
                🌾 {liveData.crop} in {liveData.state}
              </span>
              <span className="text-orange-100 text-xs">
                {liveData.markets?.length} markets · 📡 {liveData.source}
              </span>
            </div>

            {/* Summary Stats — exactly matches backend fields */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Avg Modal</p>
                <p className="font-bold text-blue-600 text-lg">
                  ₹{liveData.avgModal?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Lowest</p>
                <p className="font-bold text-red-500 text-lg">
                  ₹{liveData.minPrice?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Highest</p>
                <p className="font-bold text-green-600 text-lg">
                  ₹{liveData.maxPrice?.toLocaleString() ?? "—"}
                </p>
              </div>
            </div>

            {/* Zero markets */}
            {liveData.markets?.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-yellow-700 font-semibold text-sm">
                  No price data found for {liveData.crop} in {liveData.state}
                </p>
                <p className="text-yellow-600 text-xs mt-1">
                  Try a different crop or state combination.
                </p>
              </div>
            )}

            {/* Market Cards — scraper returns: { commodity, unit, mandiPrice, minPrice, maxPrice } */}
            <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1">
              {liveData.markets?.map((r, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800">
                        {r.mandi || r.market || r.Market || `Market ${i + 1}`}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {r.commodity || liveData.crop}
                        {r.unit && ` · per ${r.unit}`}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      🟢 Live
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-red-50 rounded-xl py-2.5">
                      <p className="text-xs text-gray-400">Min</p>
                      <p className="font-bold text-red-500 text-sm">
                        ₹{r.minPrice?.toLocaleString() ?? "—"}
                      </p>
                    </div>
                    {/* mandiPrice = modal price from scraper */}
                    <div className="bg-blue-50 rounded-xl py-2.5">
                      <p className="text-xs text-gray-400">Modal</p>
                      <p className="font-bold text-blue-600 text-sm">
                        ₹{(r.mandiPrice ?? r.modalPrice)?.toLocaleString() ?? "—"}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl py-2.5">
                      <p className="text-xs text-gray-400">Max</p>
                      <p className="font-bold text-green-600 text-sm">
                        ₹{r.maxPrice?.toLocaleString() ?? "—"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!liveData && !liveLoading && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-2">
              <p className="text-4xl">📋</p>
              <p className="text-gray-500 font-semibold text-sm">No data yet</p>
              <p className="text-gray-400 text-xs">Select a crop and state to see live prices</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePrices;

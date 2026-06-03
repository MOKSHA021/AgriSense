import { useState } from "react";
import API from "../../services/api";
import { CROPS, STATES } from "./constants";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, MapPin, Wheat } from "lucide-react";

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
      setLiveData(data);
    } catch (err) {
      setLiveError(err.response?.data?.message || "Failed to fetch prices");
    } finally {
      setLiveLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-800">

      {/* ════ Left: Form ════ */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit"
      >
        <h2 className="text-base font-bold text-slate-800 mb-1.5 font-heading">Search Mandis</h2>
        <p className="text-xs font-semibold text-slate-400 mb-6">Select commodity and state to fetch current prices.</p>

        {liveError && (
          <div className="bg-red-50 text-red-650 text-xs px-4 py-3 rounded-xl mb-5 border border-red-200 font-bold">
            {liveError}
          </div>
        )}

        <form onSubmit={handleLiveFetch} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Wheat className="w-3.5 h-3.5 text-slate-400" /> Commodity
            </label>
            <select
              value={liveCrop}
              onChange={(e) => setLiveCrop(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-colors focus:border-[#1E8E5A] focus:outline-none focus:ring-2 focus:ring-[#1E8E5A]/10 appearance-none"
            >
              <option value="" className="bg-white text-slate-800">Select crop</option>
              {CROPS.map((c) => (
                <option key={c.name} value={c.name} className="bg-white text-slate-800">{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> State
            </label>
            <select
              value={liveState}
              onChange={(e) => setLiveState(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-colors focus:border-[#1E8E5A] focus:outline-none focus:ring-2 focus:ring-[#1E8E5A]/10 appearance-none"
            >
              <option value="" className="bg-white text-slate-800">Select state</option>
              {STATES.map((s) => (
                <option key={s} value={s} className="bg-white text-slate-800">{s}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={liveLoading}
            className="w-full mt-2 py-3.5 bg-[#1E8E5A] hover:bg-[#0F6B4A] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 shadow-md shadow-[#1E8E5A]/10 active:scale-95"
          >
            {liveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {liveLoading ? "Scraping Data..." : "Locate Markets"}
          </button>
        </form>
      </motion.div>

      {/* ════ Right: Results ════ */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="lg:col-span-8 flex flex-col gap-4"
      >

        {liveLoading && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[350px] shadow-sm">
             <Loader2 className="w-8 h-8 animate-spin text-[#1E8E5A] mb-4" />
             <p className="text-slate-800 font-bold text-base font-heading">Querying Agmarknet Databases</p>
             <p className="text-slate-400 text-xs font-semibold mt-1">Establishing secure connection and scraping daily tables...</p>
          </div>
        )}

        <AnimatePresence mode="wait">
        {liveData && !liveLoading && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Header banner */}
            <div className="bg-[#1E8E5A] rounded-2xl px-6 py-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-[#1E8E5A]">
              <div>
                <span className="text-[9px] font-bold tracking-widest text-emerald-100 uppercase mb-0.5 block font-sans">Live Mandi Analytics</span>
                <span className="font-extrabold text-xl tracking-tight font-heading">
                  {liveData.crop} in {liveData.state}
                </span>
              </div>
              <div className="bg-white/15 border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                <span className="text-[10px] font-bold text-white tracking-wider uppercase">
                  {liveData.markets?.length} Trades Active
                </span>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Average Rate</p>
                <p className="font-black text-[#2F80ED] text-2xl tracking-tighter">
                  ₹{liveData.avgModal?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Minimum Rate</p>
                <p className="font-black text-red-600 text-2xl tracking-tighter">
                  ₹{liveData.minPrice?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Maximum Rate</p>
                <p className="font-black text-[#1E8E5A] text-2xl tracking-tighter">
                  ₹{liveData.maxPrice?.toLocaleString() ?? "—"}
                </p>
              </div>
            </div>

            {/* Zero markets found */}
            {liveData.markets?.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                <p className="text-3xl mb-3 select-none">🔍</p>
                <p className="text-slate-800 font-bold text-sm mb-1">
                  No active trades compiled
                </p>
                <p className="text-slate-400 text-xs font-semibold">
                  There are no recorded Agmarknet listings for {liveData.crop} in {liveData.state} today.
                </p>
              </div>
            )}

            {/* Market Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {liveData.markets?.map((r, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-0.5 font-heading">
                        {r.mandi || r.market || r.Market || `Market ${i + 1}`}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        per {r.unit || "Quintal"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-red-50 rounded-xl py-2.5 border border-red-100">
                      <p className="text-[9px] font-bold text-red-700/60 uppercase tracking-widest mb-0.5">Min</p>
                      <p className="font-bold text-red-700">
                        ₹{r.minPrice?.toLocaleString() ?? "—"}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-xl py-2.5 border border-blue-100">
                      <p className="text-[9px] font-bold text-blue-700/60 uppercase tracking-widest mb-0.5">Modal</p>
                      <p className="font-black text-blue-700">
                        ₹{(r.mandiPrice ?? r.modalPrice)?.toLocaleString() ?? "—"}
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl py-2.5 border border-emerald-100">
                      <p className="text-[9px] font-bold text-[#0F6B4A]/60 uppercase tracking-widest mb-0.5">Max</p>
                      <p className="font-bold text-[#0F6B4A]">
                        ₹{r.maxPrice?.toLocaleString() ?? "—"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        </AnimatePresence>

        {!liveData && !liveLoading && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center min-h-[350px] shadow-sm text-center">
            <Search className="w-8 h-8 text-slate-350 mb-4" />
            <p className="text-slate-800 font-bold text-sm mb-1">Mandi database ready</p>
            <p className="text-slate-400 text-xs font-semibold">Select a commodity and state parameters to initiate Live Scraping.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LivePrices;

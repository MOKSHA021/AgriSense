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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* ════ Left: Form ════ */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="lg:col-span-4 bg-white/[0.02] backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl border border-white/5 h-fit"
      >
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Search Prices</h2>
        <p className="text-white/40 text-sm mb-8 font-medium">Select commodity and state to view live data.</p>

        {liveError && (
          <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-xl mb-6 border border-red-500/20 font-medium">
            {liveError}
          </div>
        )}

        <form onSubmit={handleLiveFetch} className="flex flex-col gap-6">
          <div>
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Wheat className="w-3.5 h-3.5" /> Commodity
            </label>
            <select
              value={liveCrop}
              onChange={(e) => setLiveCrop(e.target.value)}
              required
              className="w-full px-4 py-3 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 bg-white/5 transition-colors appearance-none"
            >
              <option value="" className="bg-zinc-900 text-white">Select crop</option>
              {CROPS.map((c) => (
                <option key={c.name} value={c.name} className="bg-zinc-900 text-white">{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> State
            </label>
            <select
              value={liveState}
              onChange={(e) => setLiveState(e.target.value)}
              required
              className="w-full px-4 py-3 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 bg-white/5 transition-colors appearance-none"
            >
              <option value="" className="bg-zinc-900 text-white">Select state</option>
              {STATES.map((s) => (
                <option key={s} value={s} className="bg-zinc-900 text-white">{s}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={liveLoading}
            className="w-full mt-2 py-4 bg-gradient-to-r from-pink-600 to-rose-500 text-white font-bold rounded-xl hover:from-pink-500 hover:to-rose-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
          >
            {liveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {liveLoading ? "Fetching Data..." : "Find Markets"}
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
          <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[2rem] p-12 border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
             <Loader2 className="w-10 h-10 animate-spin text-pink-500 mb-4" />
             <p className="text-white font-bold text-lg">Scraping Agmarknet</p>
             <p className="text-white/40 text-sm font-medium mt-1">Establishing secure connection to live servers...</p>
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
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-600 to-rose-500 rounded-[2rem] px-8 py-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-xs font-bold tracking-widest text-pink-200 uppercase mb-1 block">Live Commodity Report</span>
                <span className="font-extrabold text-2xl tracking-tight">
                  {liveData.crop} in {liveData.state}
                </span>
              </div>
              <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold text-white tracking-wide">
                  {liveData.markets?.length} Markets Active
                </span>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-6 shadow-lg border border-white/5 flex flex-col items-center justify-center">
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2">Avg Modal</p>
                <p className="font-bold text-blue-400 text-3xl tracking-tighter">
                  ₹{liveData.avgModal?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-6 shadow-lg border border-white/5 flex flex-col items-center justify-center">
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2">Lowest</p>
                <p className="font-bold text-red-400 text-3xl tracking-tighter">
                  ₹{liveData.minPrice?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-6 shadow-lg border border-white/5 flex flex-col items-center justify-center">
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2">Highest</p>
                <p className="font-bold text-green-400 text-3xl tracking-tighter">
                  ₹{liveData.maxPrice?.toLocaleString() ?? "—"}
                </p>
              </div>
            </div>

            {/* Zero markets */}
            {liveData.markets?.length === 0 && (
              <div className="bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-[2rem] p-12 text-center mt-4">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-white font-bold text-lg mb-1">
                  No active trades found
                </p>
                <p className="text-white/40 text-sm font-medium">
                  There are no recorded prices for {liveData.crop} in {liveData.state} today.
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
                  className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-6 shadow-lg border border-white/5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-white text-lg tracking-tight mb-0.5">
                        {r.mandi || r.market || r.Market || `Market ${i + 1}`}
                      </h3>
                      <p className="text-xs text-white/40 font-medium">
                        per {r.unit || "Quintal"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-red-500/10 rounded-2xl py-3 border border-red-500/10">
                      <p className="text-[10px] font-bold text-red-400/60 uppercase tracking-widest mb-1">Min</p>
                      <p className="font-bold text-red-400 text-sm">
                        ₹{r.minPrice?.toLocaleString() ?? "—"}
                      </p>
                    </div>
                    <div className="bg-blue-500/10 rounded-2xl py-3 border border-blue-500/10">
                      <p className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest mb-1">Modal</p>
                      <p className="font-bold text-blue-400 text-base">
                        ₹{(r.mandiPrice ?? r.modalPrice)?.toLocaleString() ?? "—"}
                      </p>
                    </div>
                    <div className="bg-green-500/10 rounded-2xl py-3 border border-green-500/10">
                      <p className="text-[10px] font-bold text-green-400/60 uppercase tracking-widest mb-1">Max</p>
                      <p className="font-bold text-green-400 text-sm">
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
          <div className="bg-white/[0.02] backdrop-blur-2xl rounded-[2rem] p-12 border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
            <Search className="w-10 h-10 text-white/20 mb-4" />
            <p className="text-white font-bold text-lg mb-1">Ready to search</p>
            <p className="text-white/40 text-sm font-medium">Select a commodity and state to view live prices.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LivePrices;

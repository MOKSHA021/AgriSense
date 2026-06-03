import Navbar from "../components/Navbar";
import LivePrices from "../components/market/LivePrices";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const LivePricesDashboard = () => {
  return (
    <div className="min-h-screen bg-[#F7F9FA] selection:bg-emerald-100">
      <Navbar />

      <main className="dashboard-main-content max-w-6xl mx-auto px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4 pt-4"
        >
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
            <Activity className="w-6 h-6 text-[#1E8E5A]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F6B4A] tracking-tight font-heading">Live Market Prices</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 font-semibold">
              Real-time commodity trade rates parsed directly from active mandis.
            </p>
          </div>
        </motion.div>

        <LivePrices />
        
        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-16">
          AgriSense Market Node · Feeds powered by Agmarknet API
        </p>
      </main>
    </div>
  );
};

export default LivePricesDashboard;

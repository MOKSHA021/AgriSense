import Navbar from "../components/Navbar";
import LivePrices from "../components/market/LivePrices";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const LivePricesDashboard = () => {
  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-emerald-500/30">
      <Navbar />

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center border border-pink-500/30">
            <Activity className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Live Market Prices</h1>
            <p className="text-white/40 text-sm mt-1 font-medium">
              Real-time commodity rates straight from the mandis.
            </p>
          </div>
        </motion.div>

        <LivePrices />
        
        <p className="text-center text-xs text-white/30 font-medium mt-16">
          AgriSense · Data powered by Agmarknet · © {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
};

export default LivePricesDashboard;

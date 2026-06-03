import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef as useRefHook } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import LivePrices from "../components/market/LivePrices";
import { Activity, Sparkles } from "lucide-react";
import { useTranslation } from "../translations";

const LivePricesDashboard = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const headerRef = useRefHook(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0F4C3A] via-[#0F6B4A] to-[#124230] py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1920&q=80')] bg-cover bg-center opacity-10" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[11px] font-bold px-4 py-2 rounded-full tracking-widest uppercase">
                  <Activity className="w-4 h-4" />
                  Live Scraping
                </div>

                <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight font-heading">
                  Live Market Prices
                  <span className="block text-[#2BB673] mt-2">Intelligence Platform</span>
                </h1>

                <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-lg">
                  Monitor current commodity rates direct from active Agmarknet markets across India. Real-time data scraped to prevent middleman margin erosion.
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
                      <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center">
                        <Activity className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">Agmarknet Data</h3>
                        <p className="text-white/60 text-sm">Live Market Rates</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Markets</p>
                        <p className="text-white text-3xl font-black font-heading">500+</p>
                      </div>
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Updates</p>
                        <p className="text-white text-3xl font-black font-heading">Live</p>
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#2BB673]" />
                      <p className="text-white/80 text-sm">Real-time price intelligence</p>
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
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center border border-pink-200">
                  <Activity className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 font-heading">Live Market Prices</h1>
                  <p className="text-sm text-slate-500">Real-time commodity rates straight from the mandis</p>
                </div>
              </div>
            </motion.div>
          </div>

          <LivePrices />

          <p className="text-center text-xs text-slate-400 font-medium mt-16">
            AgriSense · Data powered by Agmarknet · © {new Date().getFullYear()}
          </p>
        </section>
      </main>
    </div>
  );
};

export default LivePricesDashboard;

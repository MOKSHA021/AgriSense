import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  MapPin, Cpu, FlaskConical, Sprout, CloudSun,
  ShieldAlert, ArrowRight, Leaf, ChevronRight, Activity,
  ScanSearch, Landmark, CheckCircle2, Bot
} from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useTranslation } from "../translations";

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  
  const heroRef = useRef(null);
  const platformRef = useRef(null);
  const featuresRef = useRef(null);
  const workflowRef = useRef(null);
  const benefitsRef = useRef(null);
  
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const platformInView = useInView(platformRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.3 });
  const workflowInView = useInView(workflowRef, { once: true, amount: 0.3 });
  const benefitsInView = useInView(benefitsRef, { once: true, amount: 0.3 });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    window.scrollTo(0, 0);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const workflowSteps = [
    {
      title: "Soil Scanner & Type Classification",
      desc: "Instant image recognition mapping to rich pH, nitrogen, and potassium presets using EfficientNet-B0 ML.",
      icon: FlaskConical,
      color: "text-[#2BB673]",
      bg: "bg-[#E6F5EE]"
    },
    {
      title: "Climatic AI Recommendations",
      desc: "Top 5 crop recommendations dynamically calculated using Random Forest models over current and historical rainfall indices.",
      icon: Sprout,
      color: "text-[#1E8E5A]",
      bg: "bg-emerald-50"
    },
    {
      title: "Risk Radar & Mitigations",
      desc: "Rule-based analysis parsing real-time meteorological forecasts to emit flood, frost, and dry-stress mitigation advisories.",
      icon: ShieldAlert,
      color: "text-red-500",
      bg: "bg-red-50"
    },
    {
      title: "Mandi Cost & Route Optimizer",
      desc: "Live Agmarknet prices overlaid against road mileage fuel-tolls to geocode the absolute highest net profit mandi routes.",
      icon: MapPin,
      color: "text-[#2F80ED]",
      bg: "bg-blue-50"
    }
  ];

  const features = [
    {
      icon: FlaskConical,
      title: "Soil Intelligence",
      desc: "EfficientNet deep learning classifies soil samples instantly from photos, identifying key characteristics.",
      path: "/dashboard/soil",
      badge: "AI Vision"
    },
    {
      icon: Sprout,
      title: "Crop Recommendation",
      desc: "Random Forest machine learning models match soil presets and rainfall forecasts to output high-yield crops.",
      path: "/dashboard/recommend",
      badge: "Random Forest"
    },
    {
      icon: CloudSun,
      title: "Weather Advisories",
      desc: "Hyper-local current conditions and 5-day forecasts mapped to proactive agricultural advice on spray timings and harvesting.",
      path: "/dashboard/weather",
      badge: "Real-Time GPS"
    },
    {
      icon: Activity,
      title: "Live Mandi Rates",
      desc: "Real-time rates scraped from mandis all over India to prevent middleman margin erosion.",
      path: "/dashboard/live-prices",
      badge: "Live Scraping"
    },
    {
      icon: Bot,
      title: "Price Forecasting",
      desc: "Prophet ML models projecting future agricultural rates up to 3 years ahead for smarter crop planning.",
      path: "/dashboard/price-forecast",
      badge: "Time-Series AI"
    },
    {
      icon: ShieldAlert,
      title: "Risk Alerts",
      desc: "Early warning parameters mapping severe weather indicators to actionable flood, heat, and frost mitigation guides.",
      path: "/dashboard/risk",
      badge: "Critical Alert"
    }
  ];

  return (
    <div className="font-sans text-slate-800 bg-[#F7F9FA] min-h-screen">
      
      {/* Navbar */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 px-6 md:px-16 py-4 flex items-center justify-between ${
        scrolled 
          ? "bg-white/85 backdrop-blur-md shadow-md border-b border-slate-200/50 py-3" 
          : "bg-transparent py-5"
      }`}>
        <Link to="/" className="flex items-center gap-3">
          <Leaf className={`w-7 h-7 transition-colors ${scrolled ? "text-[#1E8E5A]" : "text-white lg:text-[#2BB673]"}`} />
          <span className={`font-black text-2xl tracking-tight font-heading ${scrolled ? "text-[#0F6B4A]" : "text-white"}`}>
            Agri<span className="text-[#2BB673]">Sense</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <a href="#platform" className={`transition-colors ${scrolled ? "text-slate-600 hover:text-[#1E8E5A]" : "text-white/80 hover:text-white"}`}>
            Platform
          </a>
          <a href="#intelligence" className={`transition-colors ${scrolled ? "text-slate-600 hover:text-[#1E8E5A]" : "text-white/80 hover:text-white"}`}>
            AI Models
          </a>
          <a href="#features" className={`transition-colors ${scrolled ? "text-slate-600 hover:text-[#1E8E5A]" : "text-white/80 hover:text-white"}`}>
            Features
          </a>
          <a href="#workflow" className={`transition-colors ${scrolled ? "text-slate-600 hover:text-[#1E8E5A]" : "text-white/80 hover:text-white"}`}>
            Workflow
          </a>
          <div className="h-4 w-px bg-slate-300/30" />
          <LanguageSwitcher variant="navbar" />
          <Link to="/login" className={`transition-colors ${scrolled ? "text-slate-700 hover:text-[#1E8E5A]" : "text-white/95 hover:text-white"}`}>
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-[#1E8E5A] hover:bg-[#0F6B4A] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-md shadow-[#1E8E5A]/10"
          >
            Get Started Free
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-3">
          <LanguageSwitcher variant="navbar" />
          <Link to="/login" className="text-white text-xs font-bold bg-[#1E8E5A]/20 border border-white/20 px-3 py-1.5 rounded-full">
            Sign In
          </Link>
          <Link to="/register" className="bg-[#1E8E5A] text-white text-xs font-bold px-3 py-1.5 rounded-full">
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative bg-gradient-to-br from-[#0F4C3A] via-[#0F6B4A] to-[#124230] min-h-screen pt-28 flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80')] bg-cover bg-center opacity-10" />
        <div className="absolute top-1/4 -left-10 w-96 h-96 rounded-full bg-[#2BB673]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-80 h-80 rounded-full bg-[#2F80ED]/10 blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
          
          <motion.div 
            className="lg:col-span-6 space-y-6 text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-[#2BB673]/15 border border-[#2BB673]/30 text-[#2BB673] text-[10px] font-bold px-4 py-2 rounded-full tracking-widest uppercase">
              <Cpu className="w-3.5 h-3.5" />
              Next-Gen AgTech Intelligence Cloud
            </div>

            <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight font-heading">
              OPTIMIZE YOUR FIELD.
              <span className="block text-[#2BB673] mt-2">MAXIMIZE YOUR HARVEST.</span>
            </h1>

            <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-lg">
              AgriSense unifies crop recommendations, real-time weather risk advisories, and mandate transport cost geocoding into an enterprise platform powered by Random Forest & EfficientNet ML models.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => navigate("/register")}
                className="group inline-flex items-center gap-2 bg-[#1E8E5A] hover:bg-[#0F6B4A] text-white font-bold px-7 py-4 rounded-full text-xs transition-all shadow-xl shadow-green-950/30 hover:scale-105"
              >
                START YOUR FREE ANALYSIS
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/15 px-6 py-4 rounded-full transition-all"
              >
                Sign In to Dashboard
              </Link>
            </div>

            <div className="pt-8 flex items-center gap-8 border-t border-white/10">
              <div>
                <p className="text-white text-2xl font-black font-heading leading-none">87.8%</p>
                <p className="text-white/50 text-[10px] uppercase font-bold tracking-wider mt-1.5">Model Accuracy</p>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-green-light border-2 border-[#0F6B4A] flex items-center justify-center text-white text-[10px] font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-white/60 text-xs font-medium">Trusted by agricultural analysts and farmers.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="lg:col-span-6 relative flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.25)] border border-slate-200 overflow-hidden relative group">
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="bg-slate-200/60 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-md">
                  cloud.agrisense.co/dashboard
                </div>
                <div className="w-4 h-4" />
              </div>

              <div className="p-6 space-y-5 bg-[#F7F9FA]">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Live Soil Telemetry</p>
                    <h4 className="text-slate-800 font-bold text-base mt-0.5">Alluvial Soil Zone</h4>
                  </div>
                  <span className="bg-emerald-100 text-green-dark border border-emerald-200/50 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                    Active
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-700">NPK Nitrogen Indices</p>
                    <span className="text-[10px] font-bold text-[#2F80ED]">Optimal (65 kg/ha)</span>
                  </div>
                  <div className="flex items-end gap-2.5 h-20 pt-4">
                    {[40, 60, 45, 90, 75, 110, 85, 120].map((h, i) => (
                      <div key={i} className="flex-1 bg-slate-100 rounded-t-md h-full relative">
                        <motion.div 
                          className="bg-[#1E8E5A] rounded-t-md absolute bottom-0 inset-x-0"
                          initial={{ height: 0 }}
                          animate={{ height: `${h / 1.3}%` }}
                          transition={{ delay: 1 + i * 0.05, duration: 0.8 }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Moisture</p>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-slate-800 text-xl font-black font-heading">58%</span>
                      <span className="text-green-500 text-xs font-bold">+2.4%</span>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">pH Level</p>
                    <div className="flex items-baseline gap-1 mt-1.5">
                      <span className="text-slate-800 text-xl font-black font-heading">6.8</span>
                      <span className="text-slate-500 text-xs font-medium">Neutral</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div 
              className="absolute -top-6 -right-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl flex items-center gap-3 hidden sm:flex"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Market Rate</p>
                <p className="text-sm font-black text-slate-800 font-heading">Wheat: ₹2,350/qtl</p>
              </div>
            </motion.div>

            <motion.div 
              className="absolute -bottom-6 -left-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl flex items-center gap-3 hidden sm:flex"
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 1, ease: "easeInOut" }}
            >
              <div className="w-10 h-10 rounded-xl bg-[#E6F5EE] border border-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-mid" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Advisory Status</p>
                <p className="text-sm font-black text-slate-800 font-heading">Spraying Safe</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" ref={platformRef} className="py-24 bg-white relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&q=80')] bg-cover bg-center opacity-5" />
        <div className="max-w-7xl mx-auto px-6 md:px-16 text-center">
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Enterprise Architecture</span>
            <h2 className="text-[#0F6B4A] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-heading">
              A Unified Agriculture Intelligence Cloud
            </h2>
            <p className="text-slate-500 text-base md:text-lg">
              AgriSense connects disparate field inputs with machine learning backends to optimize the crop cycle from soil testing to final mandi sale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {[
              {
                icon: ScanSearch,
                title: "Computer Vision Imagery",
                desc: "Analyzes uploaded crop leaves and soil photographs via neural layers, mapping features back to localized diagnostic indices.",
                image: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&q=80"
              },
              {
                icon: Sprout,
                title: "Agronomy Decision Trees",
                desc: "Applies Random Forest and Prophet models to recommend high-yield crop schedules matching geographical limits.",
                image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80"
              },
              {
                icon: Landmark,
                title: "Logistics Optimization",
                desc: "Scrapes and evaluates regional mandi pricing datasets, correcting margins for travel and fuel tollage.",
                image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80"
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={platformInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center mb-2">
                      <card.icon className="w-5 h-5 text-[#1E8E5A]" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-slate-800 font-bold text-lg mb-3 tracking-tight">{card.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligence Section */}
      <section id="intelligence" className="py-24 bg-[#F7F9FA] border-t border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            className="space-y-6 text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={platformInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Predictive ML Models</span>
            <h2 className="text-[#0F6B4A] text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              Powered by Advanced Neural & Statistical Modeling
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              AgriSense integrates state-of-the-art Python ML service nodes directly into the frontend user workflow. All prediction runs happen instantly.
            </p>

            <div className="space-y-4 pt-4">
              {[
                {
                  model: "EfficientNet-B0 Image Classifier",
                  desc: "Trained on massive botanical visual logs to classify soil and leaf samples with over 87% accuracy.",
                  metric: "Deep Learning"
                },
                {
                  model: "Random Forest Recommendations",
                  desc: "Analyzes NPK, rainfall and temperature parameters to generate ranked lists of optimal crop varieties.",
                  metric: "Ensemble ML"
                },
                {
                  model: "Facebook Prophet Time Series",
                  desc: "Analyzes historic commodities market metrics to project rates up to 3 years ahead.",
                  metric: "Prophet ML"
                }
              ].map((model, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={platformInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#1E8E5A] font-bold text-xs shrink-0">
                    0{i+1}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-bold text-slate-800">{model.model}</h4>
                      <span className="bg-[#2BB673]/10 text-[#0F6B4A] text-[9px] font-bold px-2 py-0.5 rounded-full">{model.metric}</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">{model.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="flex justify-center relative">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-light/5 rounded-full blur-2xl" />
              
              <div className="flex items-center gap-3 mb-8">
                <Cpu className="w-6 h-6 text-[#1E8E5A]" />
                <h4 className="font-bold text-slate-800 text-sm">Decision Engine Node</h4>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Soil Classification</span>
                    <span>94.8% Match</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-light rounded-full" style={{ width: "94.8%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Crop Yield Confidence</span>
                    <span>89.2% Score</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-mid rounded-full" style={{ width: "89.2%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>Mandi Cost Savings</span>
                    <span>+12.6% Margin</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2F80ED] rounded-full" style={{ width: "75%" }} />
                  </div>
                </div>
              </div>

              <div className="bg-[#F7F9FA] rounded-2xl p-4 border border-slate-200 mt-8 text-xs text-slate-500 leading-relaxed flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-light shrink-0 mt-0.5" />
                <span>All modeling operations are computed on secured backend server instances and streamed via encrypted endpoints.</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-24 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6 md:px-16 text-center">
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Comprehensive Toolset</span>
            <h2 className="text-[#0F4C3A] text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              Complete Feature Suite for Precision Agriculture
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Explore how each feature converts complex field conditions into profit-maximizing insights.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative"
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                onClick={() => navigate(f.path)}
                whileHover={{ y: -8 }}
              >
                <div className="h-40 overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    i === 0 ? 'from-amber-100 to-orange-100' :
                    i === 1 ? 'from-green-100 to-emerald-100' :
                    i === 2 ? 'from-blue-100 to-cyan-100' :
                    i === 3 ? 'from-purple-100 to-pink-100' :
                    i === 4 ? 'from-indigo-100 to-violet-100' :
                    'from-red-100 to-rose-100'
                  }`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <f.icon className={`w-16 h-16 ${
                      i === 0 ? 'text-amber-600' :
                      i === 1 ? 'text-green-600' :
                      i === 2 ? 'text-blue-600' :
                      i === 3 ? 'text-purple-600' :
                      i === 4 ? 'text-indigo-600' :
                      'text-red-600'
                    } opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500`} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      i === 0 ? 'bg-amber-50' :
                      i === 1 ? 'bg-green-50' :
                      i === 2 ? 'bg-blue-50' :
                      i === 3 ? 'bg-purple-50' :
                      i === 4 ? 'bg-indigo-50' :
                      'bg-red-50'
                    }`}>
                      <f.icon className={`w-6 h-6 ${
                        i === 0 ? 'text-amber-600' :
                        i === 1 ? 'text-green-600' :
                        i === 2 ? 'text-blue-600' :
                        i === 3 ? 'text-purple-600' :
                        i === 4 ? 'text-indigo-600' :
                        'text-red-600'
                      }`} />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      i === 0 ? 'bg-amber-100 text-amber-700' :
                      i === 1 ? 'bg-green-100 text-green-700' :
                      i === 2 ? 'bg-blue-100 text-blue-700' :
                      i === 3 ? 'bg-purple-100 text-purple-700' :
                      i === 4 ? 'bg-indigo-100 text-indigo-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-slate-800 font-bold text-lg mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-4">{f.desc}</p>
                  
                  <motion.div 
                    className="overflow-hidden"
                    initial={{ height: 0 }}
                    animate={{ height: hoveredFeature === i ? 'auto' : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="pt-2">
                      <span className="text-xs font-bold text-[#1E8E5A] flex items-center gap-1">
                        Open Feature <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" ref={workflowRef} className="py-24 bg-[#F7F9FA] border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 md:px-16 text-center">
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Operational Workflow</span>
            <h2 className="text-[#0F6B4A] text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              From Soil Analysis to Mandi Sale
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              A step-by-step cycle designed to keep your agriculture pipeline completely optimized.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-3 text-left">
              {workflowSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    idx === 0 ? 'bg-white border-emerald-200 shadow-md' : 'bg-white/50 border-slate-200 hover:border-emerald-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${step.bg}`}>
                      <step.icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{step.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#E6F5EE] flex items-center justify-center">
                    <FlaskConical className="w-6 h-6 text-[#2BB673]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Soil Scanner & Type Classification</h3>
                    <p className="text-sm text-slate-500">Step 1 of 4</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Instant image recognition mapping to rich pH, nitrogen, and potassium presets using EfficientNet-B0 ML. Upload a photo of your soil sample and get instant classification results.
                </p>
                <button
                  onClick={() => navigate("/dashboard/soil")}
                  className="mt-6 bg-[#1E8E5A] hover:bg-[#0F6B4A] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all"
                >
                  Try Soil Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-16 text-center">
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Real Value</span>
            <h2 className="text-[#0F6B4A] text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
              Deliver Quantifiable Farming Success
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Why smart farming enterprises select AgriSense to monitor and forecast their agricultural investments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "87.8%", label: "Model Accuracy", desc: "EfficientNet-B0 classification accuracy" },
              { value: "3x", label: "Faster Decisions", desc: "AI-powered instant recommendations" },
              { value: "12.6%", label: "Cost Savings", desc: "Mandi route optimization margins" },
              { value: "24/7", label: "Monitoring", desc: "Real-time weather and market alerts" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="bg-[#F7F9FA] border border-slate-200 rounded-2xl p-6 text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={benefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <p className="text-4xl font-black text-[#1E8E5A] font-heading mb-2">{stat.value}</p>
                <h4 className="text-sm font-bold text-slate-800 mb-2">{stat.label}</h4>
                <p className="text-xs text-slate-500">{stat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F4C3A] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4 md:col-span-2 text-left">
              <div className="flex items-center gap-2.5">
                <Leaf className="w-6 h-6 text-green-light" />
                <span className="text-white font-extrabold text-xl tracking-tight font-heading">
                  Agri<span className="text-[#2BB673]">Sense</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed max-w-sm">
                AgriSense is an enterprise AgTech decision-engine cloud delivering local classification, predictive recommendation, time-series forecasting, and logistics routing.
              </p>
            </div>

            <div className="text-left">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Platform Core</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-white transition-colors">Dashboard Portal</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Register Account</Link></li>
                <li><a href="#platform" className="hover:text-white transition-colors">Intelligence Systems</a></li>
              </ul>
            </div>

            <div className="text-left">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Verification APIs</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-white/50">EfficientNet-B0 Model</span></li>
                <li><span className="text-white/50">Random Forest Ensemble</span></li>
                <li><span className="text-white/50">Open-Meteo & Nominatim</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-white/45">
            <p>© {new Date().getFullYear()} AgriSense Operations Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wheat, Sprout, TrendingUp, CloudSun, ArrowRight, Cpu, ShieldCheck, BarChart3, Zap } from "lucide-react";

const stats = [
  { value: "7", label: "AI Models", icon: Cpu },
  { value: "22+", label: "Crop Types", icon: Sprout },
  { value: "Live", label: "Mandi Prices", icon: TrendingUp },
  { value: "100%", label: "Free to Use", icon: ShieldCheck },
];

const features = [
  {
    icon: "🧪",
    title: "Soil Analysis",
    desc: "Upload a soil photo — our EfficientNet-B0 deep learning model instantly classifies your soil type with 90%+ accuracy.",
    badge: "AI Vision",
  },
  {
    icon: "🌾",
    title: "Crop Recommendation",
    desc: "Enter soil NPK, pH and climate data. Our Random Forest ML model ranks crops by suitability and predicted profitability.",
    badge: "Random Forest",
  },
  {
    icon: "📈",
    title: "Price Prediction",
    desc: "Prophet time-series models trained on years of mandi data forecast harvest prices up to 3 years ahead.",
    badge: "Prophet ML",
  },
  {
    icon: "🌦️",
    title: "Weather & Risk",
    desc: "5-day forecasts with farming-specific advice, flood/drought/heat alerts and safe crop suggestions.",
    badge: "Real-time",
  },
  {
    icon: "🏪",
    title: "Best Mandi Finder",
    desc: "Find top-paying mandis near you with real Agmarknet prices, road distances and transport cost calculations.",
    badge: "Live Data",
  },
  {
    icon: "💰",
    title: "Expense Tracker",
    desc: "Log your farming costs and compare against predicted revenue to see real profit margins season by season.",
    badge: "Finance",
  },
];

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 50, damping: 15 } }
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden selection:bg-emerald-500/30">
      
      {/* ── Floating Navbar ── */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-5 bg-transparent backdrop-blur-3xl border-b border-white/5"
      >
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
            <Wheat className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            AgriSense
          </span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2.5 text-white/70 rounded-xl text-sm font-semibold hover:text-white transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
          >
            Get Started
          </button>
        </div>
      </motion.nav>

      {/* ── Cinematic Hero Section ── */}
      <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 pt-20">
        
        {/* Abstract Glowing Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.15, 0.1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] left-[20%] w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.1, 0.05],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[100px]" 
          />
          {/* Noise overlay for texture */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        </div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 flex flex-col items-center w-full max-w-5xl"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full mb-8 shadow-2xl">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white/80 text-xs font-semibold tracking-wide uppercase">Powered by Advanced Machine Learning</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={fadeUp} className="text-6xl md:text-8xl font-extrabold text-white mb-6 tracking-tighter leading-[1.1]">
            Intelligence for the <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-emerald-300 via-green-400 to-teal-400 bg-clip-text text-transparent">
              Modern Farmer.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-white/50 text-lg md:text-xl mb-12 max-w-2xl leading-relaxed font-medium">
            AgriSense combines deep learning soil analysis, machine learning crop recommendations, 
            and Prophet price forecasting to maximise your harvest and profit.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 mb-24">
            <button
              onClick={() => navigate("/register")}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black text-sm font-bold rounded-2xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:scale-105"
            >
              Start for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 border border-white/10 bg-white/5 text-white/80 text-sm font-semibold rounded-2xl hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105"
            >
              Explore Platform
            </button>
          </motion.div>

          {/* Stats strip */}
          <motion.div variants={fadeScale} className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="relative group bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Icon className="w-6 h-6 text-emerald-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white mb-1 tracking-tight">{s.value}</p>
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{s.label}</p>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Bento Grid Features ── */}
      <section id="features" className="py-32 px-6 md:px-12 relative border-t border-white/5">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="relative max-w-7xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              A Complete OS for Agriculture
            </h2>
            <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Six powerful AI-powered modules seamlessly integrated into one beautiful interface.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className={`group relative bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors duration-500`}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                    {f.icon}
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-white/5 border border-white/10 text-emerald-300/80 px-3 py-1.5 rounded-full">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Minimalist CTA ── */}
      <section className="py-32 px-6 text-center relative border-t border-white/5">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="relative max-w-3xl mx-auto bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-[3rem] p-12 md:p-20 backdrop-blur-xl overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Stop guessing.<br/>Start knowing.</h2>
          <p className="text-white/40 mb-10 text-lg md:text-xl font-medium">
            Join the next generation of farmers using data to drive profitability.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="inline-flex items-center gap-2 px-10 py-5 bg-white text-black text-sm font-bold rounded-2xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)]"
          >
            Create Free Account <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50 hover:opacity-100 transition-opacity">
          <Wheat className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white tracking-tight">AgriSense</span>
        </div>
        <p className="text-xs text-white/30 font-medium">
          © {new Date().getFullYear()} AgriSense. Designed for the future of agriculture.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;

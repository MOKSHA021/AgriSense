import { useNavigate } from "react-router-dom";
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
    color: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  },
  {
    icon: "🌾",
    title: "Crop Recommendation",
    desc: "Enter soil NPK, pH and climate data. Our Random Forest ML model ranks crops by suitability and predicted profitability.",
    badge: "Random Forest",
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  },
  {
    icon: "📈",
    title: "Price Prediction",
    desc: "Prophet time-series models trained on years of mandi data forecast harvest prices up to 3 years ahead.",
    badge: "Prophet ML",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  },
  {
    icon: "🌦️",
    title: "Weather & Risk",
    desc: "5-day forecasts with farming-specific advice, flood/drought/heat alerts and safe crop suggestions.",
    badge: "Real-time",
    color: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
  },
  {
    icon: "🏪",
    title: "Best Mandi Finder",
    desc: "Find top-paying mandis near you with real Agmarknet prices, road distances and transport cost calculations.",
    badge: "Live Data",
    color: "from-orange-500/20 to-red-500/20 border-orange-500/30",
  },
  {
    icon: "💰",
    title: "Expense Tracker",
    desc: "Log your farming costs and compare against predicted revenue to see real profit margins season by season.",
    badge: "Finance",
    color: "from-teal-500/20 to-green-500/20 border-teal-500/30",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#080f0a] text-white overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-black/30 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
            <Wheat className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            AgriSense
          </span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 text-white/70 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/5 transition-all"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-green-900/30"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="min-h-screen relative flex flex-col justify-center items-center text-center px-6 pt-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
            alt="Agricultural field"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#080f0a]" />
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        {/* Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 backdrop-blur-sm text-green-300 text-xs font-semibold rounded-full mb-8 shadow-lg">
          <Zap className="w-3.5 h-3.5" />
          Powered by ML · Prophet · EfficientNet · Random Forest
        </div>

        <h1 className="relative z-10 text-5xl md:text-7xl font-bold text-white mb-6 leading-tight max-w-4xl tracking-tight">
          Farm Smarter with{" "}
          <span className="bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
            AI Intelligence
          </span>
        </h1>

        <p className="relative z-10 text-white/60 text-lg md:text-xl mb-12 max-w-2xl leading-relaxed">
          AgriSense combines deep learning soil analysis, machine learning crop recommendations,
          and Prophet price forecasting to maximise your harvest and profit.
        </p>

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 mb-20">
          <button
            onClick={() => navigate("/register")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-green-900/40"
          >
            Start for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 border border-white/15 text-white/70 text-sm font-semibold rounded-2xl hover:bg-white/5 backdrop-blur-sm transition-all"
          >
            See Features
          </button>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl py-4 px-3 text-center hover:bg-white/10 transition-all"
              >
                <Icon className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/40">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-28 px-6 md:px-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#080f0a] via-[#0a150c] to-[#080f0a]" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">
              Everything a modern farmer needs
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Six powerful AI-powered tools working together to maximise your yield and profit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className={`bg-gradient-to-br ${f.color} border rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 cursor-default`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{f.icon}</span>
                  <span className="text-xs font-semibold bg-white/10 border border-white/10 text-white/60 px-2.5 py-1 rounded-full">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-emerald-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl" />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-300 text-xs font-bold rounded-full mb-6 uppercase tracking-wider">
            <BarChart3 className="w-3.5 h-3.5" />
            Data-driven agriculture
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Ready to grow smarter?</h2>
          <p className="text-white/50 mb-10 text-lg">
            Join farmers using AI-powered insights to pick better crops, time harvests, and sell at peak prices.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-2xl hover:opacity-90 transition-all shadow-2xl shadow-green-900/50"
          >
            Create Free Account <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/25">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-600 rounded-md flex items-center justify-center">
            <Wheat className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-white/40">AgriSense</span>
        </div>
        © {new Date().getFullYear()} AgriSense · AI-powered farming intelligence
      </footer>
    </div>
  );
};

export default LandingPage;

import { useNavigate } from "react-router-dom";
import { Wheat, Sprout, TrendingUp, CloudSun, ArrowRight } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-800">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-100 fixed w-full top-0 z-50">
        <div className="flex items-center gap-2">
          <Wheat className="w-5 h-5 text-green-700" />
          <span className="text-lg font-bold text-gray-800">AgriSense</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-5 py-2 text-gray-600 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-5 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen relative flex flex-col justify-center items-center text-center px-6 pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
            alt="Agricultural field"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full mb-8">
          <Sprout className="w-3.5 h-3.5" />
          Smart farming for Indian agriculture
        </div>
        <h1 className="relative z-10 text-4xl md:text-5xl font-bold text-white mb-5 leading-tight max-w-2xl tracking-tight drop-shadow-lg">
          Know your soil. Pick the right crop. Sell at the best price.
        </h1>
        <p className="relative z-10 text-white/80 text-lg mb-10 max-w-xl leading-relaxed">
          AgriSense combines soil analysis, weather intelligence, and market data
          to help farmers make better decisions.
        </p>
        <div className="relative z-10 flex gap-4">
          <button
            onClick={() => navigate("/register")}
            className="inline-flex items-center gap-2 px-7 py-3 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition shadow-lg"
          >
            Start for Free <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="px-7 py-3 border border-white/30 text-white text-sm font-semibold rounded-lg hover:bg-white/10 backdrop-blur-sm transition"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3 text-center">Features</p>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Everything a farmer needs
          </h2>
          <p className="text-gray-500 text-center mb-16 max-w-lg mx-auto">
            Eight powerful tools working together to maximize your yield and profit.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Sprout, title: "Crop Recommendation", desc: "Enter your soil NPK, pH, and climate data. Get crop suggestions ranked by suitability and profitability." },
              { icon: TrendingUp, title: "Market Intelligence", desc: "Live mandi rates, best-mandi finder with transport costs, and AI price predictions." },
              { icon: CloudSun, title: "Weather & Risk", desc: "5-day forecasts with farming advice, flood/drought/heat alerts, and safe crop suggestions." },
            ].map((f) => (
              <div key={f.title} className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to grow smarter?</h2>
        <p className="text-gray-500 mb-8">Join farmers using data-driven agriculture.</p>
        <button
          onClick={() => navigate("/register")}
          className="inline-flex items-center gap-2 px-7 py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition"
        >
          Create Free Account <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} AgriSense
      </footer>
    </div>
  );
};

export default LandingPage;

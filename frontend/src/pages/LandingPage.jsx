import { useNavigate } from "react-router-dom";

// ── Navbar ───────────────────────────────────────────
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌾</span>
        <span className="text-xl font-bold text-green-700">AgriSense</span>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 text-green-700 border border-green-700 rounded-lg hover:bg-green-50"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
        >
          Get Started
        </button>
      </div>
    </nav>
  );
};

// ── Hero Section ─────────────────────────────────────
const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center bg-gradient-to-b from-green-50 to-white px-6 pt-20">
      <span className="text-6xl mb-4">🌱</span>
      <h1 className="text-5xl font-extrabold text-green-800 mb-4 leading-tight">
        AI-Powered Farming <br /> Made Simple
      </h1>
      <p className="text-gray-500 text-lg mb-8 max-w-xl">
        Detect soil type, get crop recommendations, track mandi prices, and
        protect your harvest — all in one place.
      </p>
      <button
        onClick={() => navigate("/register")}
        className="px-8 py-4 bg-green-700 text-white text-lg rounded-xl hover:bg-green-800 shadow-lg"
      >
        Start for Free →
      </button>
    </section>
  );
};

// ── Feature Card ─────────────────────────────────────
// 🧠 Reusable component — takes props (icon, title, desc) and renders a card
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center gap-3 hover:shadow-xl transition">
    <span className="text-5xl">{icon}</span>
    <h3 className="text-lg font-bold text-green-800">{title}</h3>
    <p className="text-gray-500 text-sm">{desc}</p>
  </div>
);

// ── Features Section ─────────────────────────────────
const Features = () => (
  <section className="py-20 px-6 bg-white">
    <h2 className="text-3xl font-bold text-center text-green-800 mb-12">
      Everything a Farmer Needs
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      <FeatureCard
        icon="🪱"
        title="Soil Intelligence"
        desc="Upload a photo — our AI detects soil type instantly and recommends crops."
      />
      <FeatureCard
        icon="🌦️"
        title="Weather Intelligence"
        desc="Auto-fetch live weather using GPS. Get flood, drought, and heatwave alerts."
      />
      <FeatureCard
        icon="📈"
        title="Mandi Price Advisor"
        desc="10-year price data tells you exactly when and where to sell your crop."
      />
    </div>
  </section>
);

// ── Footer ────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-green-800 text-white text-center py-6 text-sm">
    © 2026 AgriSense — Built for Indian Farmers 🇮🇳
  </footer>
);

// ── Main Page (combines all sections) ────────────────
const LandingPage = () => (
  <div>
    <Navbar />
    <Hero />
    <Features />
    <Footer />
  </div>
);

export default LandingPage;

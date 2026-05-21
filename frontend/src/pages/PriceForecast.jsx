import Navbar from "../components/Navbar";
import PricePrediction from "../components/market/PricePrediction";

const PriceForecast = () => {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow">🤖 Price Forecast Prediction</h1>
            <p className="text-white/70 text-sm mt-1">
              Facebook Prophet embedded time-series AI for future market prices.
            </p>
          </div>
          <PricePrediction />
          <p className="text-center text-xs text-white/40 pb-4 mt-8">
            🌾 AgriSense · Prophet ML Prediction Model 
          </p>
        </main>
      </div>
    </div>
  );
};

export default PriceForecast;

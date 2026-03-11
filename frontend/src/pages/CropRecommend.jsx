import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Sprout, TrendingUp, IndianRupee, BarChart3, MapPin, Loader } from "lucide-react";


const SOIL_PRESETS = {
  Alluvial: { N: 80, P: 40, K: 40 },
  Black: { N: 60, P: 30, K: 50 },
  Red: { N: 40, P: 20, K: 30 },
  Laterite: { N: 30, P: 15, K: 25 },
  Sandy: { N: 20, P: 10, K: 15 },
};

const CROPS = [
  {
    name: "Rice",
    N: [60, 120], P: [20, 60], K: [20, 60],
    temp: [20, 35], humidity: [60, 90], ph: [5.5, 7.0], rainfall: [150, 300],
    irrigated: true, rainfed: true,
    yield: 20, price: 2100, cost_pct: 0.6,
    tip: "Maintain 5 cm standing water during tillering stage.",
  },
  {
    name: "Wheat",
    N: [80, 150], P: [30, 60], K: [20, 50],
    temp: [10, 25], humidity: [40, 70], ph: [6.0, 7.5], rainfall: [50, 100],
    irrigated: true, rainfed: false,
    yield: 18, price: 2275, cost_pct: 0.6,
    tip: "Sow in mid-November for optimal vernalisation.",
  },
  {
    name: "Maize",
    N: [80, 150], P: [30, 60], K: [20, 50],
    temp: [18, 35], humidity: [50, 80], ph: [5.5, 7.5], rainfall: [60, 110],
    irrigated: true, rainfed: true,
    yield: 22, price: 1870, cost_pct: 0.6,
    tip: "Apply nitrogen in three split doses for better cob filling.",
  },
  {
    name: "Sugarcane",
    N: [100, 200], P: [40, 80], K: [40, 80],
    temp: [25, 40], humidity: [60, 90], ph: [6.0, 7.5], rainfall: [100, 200],
    irrigated: true, rainfed: false,
    yield: 350, price: 350, cost_pct: 0.6,
    tip: "Use trench planting method for better ratoon management.",
  },
  {
    name: "Millets",
    N: [20, 60], P: [10, 30], K: [10, 30],
    temp: [25, 40], humidity: [30, 60], ph: [5.0, 7.0], rainfall: [30, 80],
    irrigated: false, rainfed: true,
    yield: 10, price: 2350, cost_pct: 0.55,
    tip: "Ideal for dryland farming; minimal irrigation needed.",
  },
  {
    name: "Sorghum",
    N: [30, 80], P: [15, 40], K: [15, 40],
    temp: [25, 38], humidity: [30, 65], ph: [5.5, 7.5], rainfall: [40, 100],
    irrigated: false, rainfed: true,
    yield: 12, price: 2750, cost_pct: 0.55,
    tip: "Dual-purpose varieties provide both grain and fodder.",
  },
  {
    name: "Potato",
    N: [100, 180], P: [50, 80], K: [60, 100],
    temp: [15, 25], humidity: [60, 85], ph: [5.0, 6.5], rainfall: [50, 80],
    irrigated: true, rainfed: false,
    yield: 100, price: 1200, cost_pct: 0.6,
    tip: "Hill up soil around stems every 2 weeks for higher tuber count.",
  },
  {
    name: "Banana",
    N: [100, 200], P: [30, 60], K: [80, 150],
    temp: [25, 38], humidity: [70, 95], ph: [6.0, 7.5], rainfall: [120, 250],
    irrigated: true, rainfed: false,
    yield: 120, price: 800, cost_pct: 0.6,
    tip: "Desuckering improves bunch weight significantly.",
  },
  {
    name: "Cotton",
    N: [60, 120], P: [20, 50], K: [20, 50],
    temp: [22, 38], humidity: [40, 70], ph: [6.0, 8.0], rainfall: [50, 120],
    irrigated: true, rainfed: true,
    yield: 8, price: 6500, cost_pct: 0.6,
    tip: "Monitor for bollworm infestation during flowering.",
  },
  {
    name: "Groundnut",
    N: [10, 40], P: [20, 50], K: [20, 50],
    temp: [22, 35], humidity: [50, 80], ph: [5.5, 7.0], rainfall: [50, 120],
    irrigated: true, rainfed: true,
    yield: 10, price: 5550, cost_pct: 0.58,
    tip: "Apply gypsum at pegging stage to improve pod filling.",
  },
  {
    name: "Soybean",
    N: [5, 30], P: [30, 60], K: [20, 50],
    temp: [20, 32], humidity: [50, 80], ph: [6.0, 7.5], rainfall: [60, 120],
    irrigated: true, rainfed: true,
    yield: 10, price: 4300, cost_pct: 0.58,
    tip: "Inoculate seeds with Rhizobium for better nitrogen fixation.",
  },
  {
    name: "Jute",
    N: [40, 80], P: [15, 30], K: [20, 40],
    temp: [25, 38], humidity: [70, 95], ph: [5.5, 7.0], rainfall: [150, 300],
    irrigated: false, rainfed: true,
    yield: 12, price: 4750, cost_pct: 0.6,
    tip: "Ret jute in slow-flowing clean water for best fibre quality.",
  },
];

function rangeScore(value, [low, high]) {
  if (value >= low && value <= high) return 1;
  const mid = (low + high) / 2;
  const span = (high - low) / 2;
  const dist = Math.abs(value - mid);
  const score = Math.max(0, 1 - (dist - span) / span);
  return score;
}

function scoreCrop(crop, inputs) {
  const weights = { N: 1, P: 1, K: 1, temp: 1.2, humidity: 1, ph: 1.2, rainfall: 1.1 };
  let total = 0;
  let maxTotal = 0;
  for (const key of ["N", "P", "K"]) {
    total += rangeScore(inputs[key], crop[key]) * weights[key];
    maxTotal += weights[key];
  }
  total += rangeScore(inputs.temperature, crop.temp) * weights.temp;
  maxTotal += weights.temp;
  total += rangeScore(inputs.humidity, crop.humidity) * weights.humidity;
  maxTotal += weights.humidity;
  total += rangeScore(inputs.ph, crop.ph) * weights.ph;
  maxTotal += weights.ph;
  total += rangeScore(inputs.rainfall, crop.rainfall) * weights.rainfall;
  maxTotal += weights.rainfall;

  if (inputs.irrigationType === "rainfed" && !crop.rainfed) {
    total *= 0.4;
  }
  if (inputs.irrigationType === "irrigated" && !crop.irrigated) {
    total *= 0.7;
  }

  return Math.round((total / maxTotal) * 100);
}

function formatCurrency(num) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

const INITIAL = { N: "", P: "", K: "", temperature: "", humidity: "", ph: "", rainfall: "" };

export default function CropRecommend() {
  const [form, setForm] = useState(INITIAL);
  const [irrigationType, setIrrigationType] = useState("irrigated");
  const [activeSoil, setActiveSoil] = useState(null);
  const [results, setResults] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [locationName, setLocationName] = useState("");
  const [soilStatus, setSoilStatus] = useState("idle");

  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocationStatus("detecting");
    setSoilStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // Fetch weather + geocoding in parallel
        try {
          const [weatherRes, geoRes, rainRes] = await Promise.all([
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&timezone=auto`
            ),
            fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              { headers: { "User-Agent": "AgriSense/1.0" } }
            ),
            fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum&past_days=30&forecast_days=1&timezone=auto`
            ),
          ]);
          if (!weatherRes.ok) throw new Error();
          const weather = await weatherRes.json();
          const geo = await geoRes.json();
          const rainData = rainRes.ok ? await rainRes.json() : null;
          const dailySums = rainData?.daily?.precipitation_sum;
          const monthlyRainfall = Array.isArray(dailySums)
            ? Math.round(dailySums.reduce((a, b) => a + (b || 0), 0))
            : null;
          setForm((prev) => ({
            ...prev,
            temperature: Math.round(weather.current.temperature_2m),
            humidity: Math.round(weather.current.relative_humidity_2m),
            rainfall: monthlyRainfall != null ? monthlyRainfall : "",
          }));
          setLocationName(
            geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || "Your location"
          );
          setLocationStatus("done");
        } catch {
          setLocationStatus("error");
        }

        // Fetch soil data from SoilGrids (separate try-catch so weather still works if soil fails)
        try {
          const soilRes = await fetch(
            `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}&property=nitrogen&property=phh2o&property=soc&property=cec&depth=0-5cm&value=mean`
          );
          if (!soilRes.ok) throw new Error();
          const soilData = await soilRes.json();
          const layers = soilData.properties?.layers || [];
          const getValue = (name) => {
            const layer = layers.find((l) => l.name === name);
            return layer?.depths?.[0]?.values?.mean ?? null;
          };

          const rawN = getValue("nitrogen");
          const rawPh = getValue("phh2o");
          const rawSoc = getValue("soc");
          const rawCec = getValue("cec");

          const updates = {};
          if (rawN != null) updates.N = Math.max(10, Math.min(200, Math.round(rawN * 0.39)));
          if (rawSoc != null) updates.P = Math.max(5, Math.min(80, Math.round((rawSoc / 10) * 2.5)));
          if (rawCec != null) updates.K = Math.max(10, Math.min(100, Math.round(rawCec * 0.4)));
          if (rawPh != null) updates.ph = Math.round((rawPh / 10) * 10) / 10;

          if (Object.keys(updates).length > 0) {
            setForm((prev) => ({ ...prev, ...updates }));
            setActiveSoil(null);
            setSoilStatus("done");
          } else {
            setSoilStatus("error");
          }
        } catch {
          setSoilStatus("error");
        }
      },
      () => {
        setLocationStatus("error");
        setSoilStatus("error");
      }
    );
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function applySoil(name) {
    setActiveSoil(name);
    setForm((prev) => ({
      ...prev,
      N: SOIL_PRESETS[name].N,
      P: SOIL_PRESETS[name].P,
      K: SOIL_PRESETS[name].K,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const inputs = {
      N: Number(form.N),
      P: Number(form.P),
      K: Number(form.K),
      temperature: Number(form.temperature),
      humidity: Number(form.humidity),
      ph: Number(form.ph),
      rainfall: Number(form.rainfall),
      irrigationType,
    };

    const scored = CROPS.map((crop) => {
      const match = scoreCrop(crop, inputs);
      const revenue = crop.yield * crop.price;
      const cost = Math.round(revenue * crop.cost_pct);
      const profit = revenue - cost;
      return { ...crop, match, revenue, cost, profit };
    });

    scored.sort((a, b) => b.match - a.match);
    setResults(scored.slice(0, 5));
  }

  const fields = [
    { name: "N", label: "Nitrogen (N)", unit: "kg/ha" },
    { name: "P", label: "Phosphorus (P)", unit: "kg/ha" },
    { name: "K", label: "Potassium (K)", unit: "kg/ha" },
    { name: "temperature", label: "Temperature", unit: "\u00B0C" },
    { name: "humidity", label: "Humidity", unit: "%" },
    { name: "ph", label: "pH", unit: "" },
    { name: "rainfall", label: "Rainfall (monthly)", unit: "mm" },
  ];

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative z-10">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-6">
          <Sprout className="w-6 h-6 text-green-400" />
          <h1 className="text-2xl font-bold text-white drop-shadow">Crop Recommendation</h1>
        </div>

        {(locationStatus === "detecting" || soilStatus === "detecting") && (
          <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Detecting location &amp; fetching soil data...</span>
          </div>
        )}
        {locationStatus === "done" && locationName && soilStatus !== "detecting" && (
          <div className="space-y-1 mb-4">
            <div className="flex items-center gap-2 text-sm text-green-300">
              <MapPin className="w-4 h-4" />
              <span>📍 {locationName} — Temperature, humidity &amp; rainfall (last 30 days) auto-filled</span>
            </div>
            {soilStatus === "done" && (
              <div className="flex items-center gap-2 text-sm text-amber-300 ml-6">
                <span>🧪 Soil nutrients (N, P, K, pH) auto-filled from SoilGrids</span>
              </div>
            )}
            {soilStatus === "error" && (
              <div className="flex items-center gap-2 text-sm text-white/40 ml-6">
                <span>⚠️ Soil data unavailable — use manual presets or enter values</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div>
            <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-white mb-4">Soil &amp; Climate Inputs</h2>

              {/* Soil presets */}
              <div className="mb-5">
                <p className="text-sm font-medium text-white/70 mb-2">Soil Type (auto-fills NPK)</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SOIL_PRESETS).map((soil) => (
                    <button
                      key={soil}
                      type="button"
                      onClick={() => applySoil(soil)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        activeSoil === soil
                          ? "border-green-400 bg-green-500/20 text-green-300"
                          : "border-white/20 text-white/60 hover:border-white/40"
                      }`}
                    >
                      {soil}
                    </button>
                  ))}
                </div>
              </div>

              {/* Numeric inputs */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                {fields.map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      {f.label} {f.unit && <span className="text-white/40">({f.unit})</span>}
                    </label>
                    <input
                      type="number"
                      name={f.name}
                      value={form[f.name]}
                      onChange={handleChange}
                      required
                      step="any"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-green-500"
                    />
                  </div>
                ))}
              </div>

              {/* Irrigation toggle */}
              <div className="mb-5">
                <p className="text-sm font-medium text-white/70 mb-2">Irrigation</p>
                <div className="flex gap-2">
                  {["irrigated", "rainfed"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setIrrigationType(type)}
                      className={`px-4 py-2 text-sm rounded-lg border capitalize transition-colors ${
                        irrigationType === type
                          ? "border-green-400 bg-green-500/20 text-green-300"
                          : "border-white/20 text-white/60 hover:border-white/40"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Get Recommendations
              </button>
            </form>
          </div>

          {/* Results */}
          <div>
            {!results && (
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center h-full text-white/50 shadow-lg">
                <BarChart3 className="w-10 h-10 mb-3" />
                <p className="text-sm">Fill the form to see crop recommendations</p>
              </div>
            )}

            {results && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white drop-shadow flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Top 5 Recommendations
                </h2>

                {results.map((crop, i) => (
                  <div key={crop.name} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white/10 text-xs font-bold text-white flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-white">{crop.name}</span>
                      </div>
                      <span className="text-sm font-medium text-green-400">{crop.match}% match</span>
                    </div>

                    {/* Match bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full mb-3">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${crop.match}%` }}
                      />
                    </div>

                    {/* Tip */}
                    <p className="text-xs text-white/50 mb-3">{crop.tip}</p>

                    {/* Profit section */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white/10 rounded-lg py-2">
                        <p className="text-xs text-white/50 mb-0.5">Revenue/acre</p>
                        <p className="text-sm font-semibold text-white flex items-center justify-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {crop.revenue.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-lg py-2">
                        <p className="text-xs text-white/50 mb-0.5">Est. Cost</p>
                        <p className="text-sm font-semibold text-white flex items-center justify-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {crop.cost.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-lg py-2">
                        <p className="text-xs text-white/50 mb-0.5">Profit</p>
                        <p className="text-sm font-semibold text-green-400 flex items-center justify-center gap-0.5">
                          <IndianRupee className="w-3.5 h-3.5" />
                          {crop.profit.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

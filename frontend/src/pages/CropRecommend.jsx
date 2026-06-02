import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../services/api";
import {
  Sprout,
  TrendingUp,
  IndianRupee,
  BarChart3,
  MapPin,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Droplets,
  Thermometer,
} from "lucide-react";

const SOIL_PRESETS = {
  Alluvial: { N: 80, P: 40, K: 40, ph: 6.5 },
  Black: { N: 60, P: 30, K: 50, ph: 7.2 },
  Red: { N: 40, P: 20, K: 30, ph: 6.0 },
  Laterite: { N: 30, P: 15, K: 25, ph: 5.5 },
  Sandy: { N: 20, P: 10, K: 15, ph: 6.5 },
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
    yield: 8, price: 2800, cost_pct: 0.4,
    tip: "Sow at onset of monsoon for best germination.",
  },
  {
    name: "Cotton",
    N: [60, 120], P: [30, 60], K: [30, 60],
    temp: [20, 35], humidity: [50, 80], ph: [6.0, 8.0], rainfall: [50, 100],
    irrigated: true, rainfed: true,
    yield: 15, price: 6500, cost_pct: 0.5,
    tip: "Ensure proper spacing for better boll development.",
  },
  {
    name: "Potato",
    N: [80, 120], P: [40, 80], K: [80, 120],
    temp: [15, 25], humidity: [70, 90], ph: [5.0, 6.5], rainfall: [40, 80],
    irrigated: true, rainfed: false,
    yield: 200, price: 1200, cost_pct: 0.5,
    tip: "Plant in well-drained sandy loam soil.",
  },
  {
    name: "Soybean",
    N: [20, 40], P: [30, 60], K: [20, 40],
    temp: [20, 30], humidity: [60, 80], ph: [6.0, 7.0], rainfall: [60, 100],
    irrigated: true, rainfed: true,
    yield: 12, price: 4500, cost_pct: 0.4,
    tip: "Inoculate seeds with rhizobium for better nitrogen fixation.",
  },
  {
    name: "Groundnut",
    N: [20, 40], P: [30, 50], K: [20, 40],
    temp: [25, 35], humidity: [50, 70], ph: [5.5, 7.0], rainfall: [50, 80],
    irrigated: true, rainfed: true,
    yield: 15, price: 5500, cost_pct: 0.4,
    tip: "Harvest when 75% of pods are mature.",
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

export default function CropRecommend() {
  const fileInputRef = useRef(null);

  // States
  const [gpsStatus, setGpsStatus] = useState("idle"); // idle | detecting | done | error
  const [locationName, setLocationName] = useState("");
  
  const [weather, setWeather] = useState({ temp: "", humidity: "", rainfall: "" });
  const [soilInfo, setSoilInfo] = useState({ type: "", N: "", P: "", K: "", ph: "" });
  
  const [preview, setPreview] = useState(null);
  const [uploadAnalyzing, setUploadAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [irrigationType, setIrrigationType] = useState("irrigated");
  const [results, setResults] = useState(null);
  const [recommending, setRecommending] = useState(false);

  // Fetch Reference Data
  const [soilPresets, setSoilPresets] = useState(SOIL_PRESETS);
  const [cropsData, setCropsData] = useState(CROPS);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [soilRes, cropsRes] = await Promise.all([
          API.get("/reference/soil-presets").catch(() => ({ data: { soilPresets: SOIL_PRESETS } })),
          API.get("/reference/crops").catch(() => ({ data: { crops: CROPS } })),
        ]);
        setSoilPresets(soilRes.data.soilPresets || SOIL_PRESETS);
        setCropsData(cropsRes.data.crops || CROPS);
      } catch (err) {
        console.error("Reference fetch error", err);
      }
    };
    loadData();
  }, []);

  // 1. GPS Auto-Detect (Weather + SoilGrids)
  const autoDetectEverything = () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    setGpsStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const [geoRes, weatherRes, soilRes] = await Promise.all([
            // Location Name
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`, { headers: { "User-Agent": "AgriSense/1.0" } }),
            // Weather from Open-Meteo
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation`),
            // Soil from SoilGrids
            fetch(`https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}&property=nitrogen&property=phh2o&property=soc&property=cec&depth=0-5cm&value=mean`)
          ]);

          const geo = await geoRes.json();
          const wData = await weatherRes.json();
          const sData = await soilRes.json();

          setLocationName(geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || "Your Location");
          
          // Set Weather
          // Using a proxy for rainfall (100mm default if no heavy precipitation now, just to have a baseline). 
          // Open-meteo current precipitation is instantaneous, not seasonal. We provide 100mm as an average seasonal placeholder, 
          // but if current rain is high, we boost it.
          const currentRain = wData.current.precipitation || 0;
          setWeather({
            temp: wData.current.temperature_2m,
            humidity: wData.current.relative_humidity_2m,
            rainfall: Math.round(100 + (currentRain * 10)), // simple heuristic
          });

          // Set Soil
          const layers = sData.properties?.layers || [];
          const getVal = (name) => layers.find((l) => l.name === name)?.depths?.[0]?.values?.mean ?? null;
          
          const rawN = getVal("nitrogen");
          const rawPh = getVal("phh2o");
          const rawSoc = getVal("soc");
          const rawCec = getVal("cec");

          setSoilInfo({
            type: "GPS Detected",
            N: rawN != null ? Math.round(rawN * 0.39) : 60,
            P: rawSoc != null ? Math.round((rawSoc / 10) * 2.5) : 30,
            K: rawCec != null ? Math.round(rawCec * 0.4) : 40,
            ph: rawPh != null ? Math.round((rawPh / 10) * 10) / 10 : 6.5,
          });

          setGpsStatus("done");
        } catch (err) {
          console.error(err);
          setGpsStatus("error");
        }
      },
      () => setGpsStatus("error")
    );
  };

  // 2. Upload Soil Image
  const analyseSoilImage = async (file) => {
    setUploadError("");
    setUploadAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await API.post("/ml/predict/soil", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const cleanType = data.soil_type_clean || (data.soil_type || "").replace(/_Soil$/i, "").replace(/_/g, " ");
      
      // Auto-fill NPK from presets based on detected type
      const preset = soilPresets[cleanType] || soilPresets["Alluvial"];
      
      setSoilInfo({
        type: cleanType,
        N: preset.N,
        P: preset.P,
        K: preset.K,
        ph: preset.ph || 6.5,
      });

    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || "Failed to analyze soil image.");
    } finally {
      setUploadAnalyzing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    analyseSoilImage(file);
  };

  // 3. Manual Preset Selection
  const applyPreset = (name) => {
    const preset = soilPresets[name];
    setSoilInfo({
      type: name,
      N: preset.N,
      P: preset.P,
      K: preset.K,
      ph: preset.ph || 6.5,
    });
  };

  // 4. Get Recommendations
  const handleRecommend = async () => {
    if (!soilInfo.N || !weather.temp) return;
    setRecommending(true);
    
    const inputs = {
      N: Number(soilInfo.N),
      P: Number(soilInfo.P),
      K: Number(soilInfo.K),
      ph: Number(soilInfo.ph),
      temperature: Number(weather.temp),
      humidity: Number(weather.humidity),
      rainfall: Number(weather.rainfall),
      irrigationType,
    };

    const sType = soilInfo.type && soilInfo.type !== "GPS Detected" ? soilInfo.type : "Alluvial";

    try {
      const { data } = await API.post("/ml/predict/crop", {
        soil_type: sType,
        temperature: inputs.temperature,
        humidity: inputs.humidity,
        rainfall: inputs.rainfall,
      });

      const mlResults = data.crops.map((mlCrop) => {
        const cropData = cropsData.find((c) => c.name === mlCrop.crop);
        if (!cropData) return null;
        const revenue = cropData.yield * cropData.price;
        const cost = Math.round(revenue * cropData.cost_pct);
        const profit = revenue - cost;
        return {
          ...cropData,
          match: Math.round(mlCrop.score * 100),
          revenue,
          cost,
          profit,
        };
      }).filter(Boolean);

      setResults(mlResults.slice(0, 5));
    } catch (err) {
      console.error("ML prediction failed, falling back to rule-based:", err);
      const scored = cropsData.map((crop) => {
        const match = scoreCrop(crop, inputs);
        const revenue = crop.yield * crop.price;
        const cost = Math.round(revenue * crop.cost_pct);
        const profit = revenue - cost;
        return { ...crop, match, revenue, cost, profit };
      });
      scored.sort((a, b) => b.match - a.match);
      setResults(scored.slice(0, 5));
    } finally {
      setRecommending(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1592982537447-6f296d9b3004?w=1920&q=80"
          alt="Agriculture"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
              <Sprout className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow">Intelligent Crop Recommendation</h1>
              <p className="text-sm text-white/60 mt-1">
                Analyze your soil and environment holistically to find the most profitable crops.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Data Acquisition */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Step 1: GPS Auto-Detect */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-400" /> Auto-Detect
                    </h2>
                    <p className="text-xs text-white/50 mt-1">Fetches Live Weather & SoilGrids NPK</p>
                  </div>
                  <button
                    onClick={autoDetectEverything}
                    disabled={gpsStatus === "detecting"}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {gpsStatus === "detecting" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Detect Everything"}
                  </button>
                </div>
                {locationName && (
                  <div className="mt-3 text-sm text-green-400 flex items-center gap-1.5 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Detected Location: {locationName}
                  </div>
                )}
                {gpsStatus === "error" && (
                  <div className="mt-3 text-sm text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Location access denied or failed.
                  </div>
                )}
              </div>

              {/* Step 2: Soil Image Upload */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                  <Camera className="w-5 h-5 text-amber-400" /> Soil Image ML
                </h2>
                <p className="text-xs text-white/50 mb-4">Upload a photo to classify soil type and estimate NPK</p>
                
                {!preview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400/50 hover:bg-amber-400/5 transition-all"
                  >
                    <Upload className="w-8 h-8 text-white/30 mb-2" />
                    <p className="text-sm text-white/60">Click to upload soil photo</p>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img src={preview} alt="Soil" className="w-full h-32 object-cover rounded-xl border border-white/10" />
                    {uploadAnalyzing && <div className="text-sm text-amber-400 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Analyzing...</div>}
                    {uploadError && <div className="text-sm text-red-400">{uploadError}</div>}
                    {!uploadAnalyzing && !uploadError && soilInfo.type && soilInfo.type !== "GPS Detected" && (
                      <div className="text-sm text-green-400 flex items-center gap-1.5 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Detected: {soilInfo.type} Soil
                      </div>
                    )}
                    <button onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-xs text-white/40 hover:text-white underline">Upload different photo</button>
                  </div>
                )}
              </div>

              {/* Step 3: Manual Presets */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-sm font-bold text-white/70 mb-3">Or select soil preset manually:</h2>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(soilPresets).map((s) => (
                    <button
                      key={s}
                      onClick={() => applyPreset(s)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        soilInfo.type === s ? "border-green-500 bg-green-500/20 text-green-300" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Parameters & Results */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Aggregated Parameters */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Aggregated Parameters</h2>
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                    {["irrigated", "rainfed"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setIrrigationType(type)}
                        className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                          irrigationType === type ? "bg-white/20 text-white shadow-sm" : "text-white/40 hover:text-white/80"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Soil Params */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-1.5"><Sprout className="w-4 h-4"/> Soil Chemistry</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-white/50 block mb-1">Nitrogen (N)</label>
                        <input type="number" value={soilInfo.N} onChange={e => setSoilInfo({...soilInfo, N: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="kg/ha" />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 block mb-1">Phosphorus (P)</label>
                        <input type="number" value={soilInfo.P} onChange={e => setSoilInfo({...soilInfo, P: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="kg/ha" />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 block mb-1">Potassium (K)</label>
                        <input type="number" value={soilInfo.K} onChange={e => setSoilInfo({...soilInfo, K: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="kg/ha" />
                      </div>
                      <div>
                        <label className="text-xs text-white/50 block mb-1">pH Level</label>
                        <input type="number" value={soilInfo.ph} onChange={e => setSoilInfo({...soilInfo, ph: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" placeholder="pH" />
                      </div>
                    </div>
                  </div>

                  {/* Weather Params */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-1.5"><Thermometer className="w-4 h-4"/> Environment</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-white/50 block mb-1">Temperature (°C)</label>
                        <input type="number" value={weather.temp} onChange={e => setWeather({...weather, temp: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="°C" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-white/50 block mb-1">Humidity (%)</label>
                          <input type="number" value={weather.humidity} onChange={e => setWeather({...weather, humidity: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="%" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50 block mb-1">Rainfall (mm)</label>
                          <input type="number" value={weather.rainfall} onChange={e => setWeather({...weather, rainfall: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="mm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRecommend}
                  disabled={recommending || !soilInfo.N || !weather.temp}
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {recommending ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                  Generate AI Recommendations
                </button>
              </div>

              {/* Results */}
              {results && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                    Top Recommendations
                  </h2>
                  
                  {results.map((crop, i) => (
                    <div key={crop.name} className="bg-black/60 backdrop-blur-xl border border-white/10 hover:border-green-500/30 transition-colors rounded-2xl p-5 shadow-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 font-bold flex items-center justify-center">
                            {i + 1}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">{crop.name}</h3>
                            <p className="text-xs text-white/50">{crop.tip}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-green-400">{crop.match}%</span>
                          <p className="text-[10px] text-green-400/60 uppercase tracking-wider font-bold">Suitability</p>
                        </div>
                      </div>
                      
                      <div className="w-full h-1.5 bg-white/10 rounded-full mb-5">
                        <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" style={{ width: `${crop.match}%` }} />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 font-semibold">Revenue / Acre</p>
                          <p className="text-sm font-bold text-white flex items-center justify-center">
                            <IndianRupee className="w-3.5 h-3.5 opacity-70" /> {crop.revenue.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 font-semibold">Est. Cost</p>
                          <p className="text-sm font-bold text-white flex items-center justify-center">
                            <IndianRupee className="w-3.5 h-3.5 opacity-70" /> {crop.cost.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-green-400/60 uppercase tracking-wider mb-1 font-bold">Net Profit</p>
                          <p className="text-sm font-black text-green-400 flex items-center justify-center">
                            <IndianRupee className="w-3.5 h-3.5 opacity-80" /> {crop.profit.toLocaleString("en-IN")}
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

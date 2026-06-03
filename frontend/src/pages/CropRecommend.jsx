import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef as useRefHook } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import API from '../services/api';
import {
  Sprout, MapPin, Camera, Upload, CheckCircle2, AlertTriangle,
  Loader2, TrendingUp, IndianRupee, Droplets, Thermometer, BarChart3,
  Leaf, ArrowRight, Sparkles, Zap
} from 'lucide-react';
import { useTranslation } from '../translations';

/* ─────────────────────────────────────────────
   CROP IMAGES
───────────────────────────────────────────── */
const CROP_IMAGES = {
  Rice: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400&q=80',
  Wheat: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80',
  Maize: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&q=80',
  Sugarcane: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80',
  Millets: 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=400&q=80',
  Cotton: 'https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=400&q=80',
  Potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
  Tomato: 'https://images.unsplash.com/photo-1558818498-28c1e002b655?w=400&q=80',
  Groundnut: 'https://images.unsplash.com/photo-1567306226408-28b57e55f7fc?w=400&q=80',
  Soybean: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&q=80',
  Chickpea: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80',
  Mustard: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80',
};

/* ─────────────────────────────────────────────
   SOIL PRESETS
───────────────────────────────────────────── */
const soilPresets = {
  Alluvial: { N: 65, P: 45, K: 55, pH: 7.0, soilMoisture: 55 },
  Black:    { N: 55, P: 35, K: 60, pH: 7.5, soilMoisture: 45 },
  Red:      { N: 40, P: 25, K: 35, pH: 6.2, soilMoisture: 35 },
  Laterite: { N: 30, P: 20, K: 25, pH: 5.5, soilMoisture: 40 },
  Sandy:    { N: 20, P: 15, K: 20, pH: 6.0, soilMoisture: 25 },
};

/* ─────────────────────────────────────────────
   CROPS DATA (NPK ranges + economics)
───────────────────────────────────────────── */
const cropsData = [
  {
    name: 'Rice',
    N: [60, 120], P: [30, 60],  K: [40, 80],  pH: [5.5, 7.0],
    temp: [20, 35], rain: [150, 300], moisture: [60, 90],
    revenue: 48000, cost: 18000, tip: 'Ensure standing water during vegetative stage.',
  },
  {
    name: 'Wheat',
    N: [80, 140], P: [40, 70],  K: [30, 60],  pH: [6.0, 7.5],
    temp: [10, 25], rain: [30, 100], moisture: [35, 60],
    revenue: 40000, cost: 14000, tip: 'Sow during cool, dry season for best yield.',
  },
  {
    name: 'Maize',
    N: [80, 160], P: [40, 80],  K: [40, 80],  pH: [5.8, 7.0],
    temp: [18, 32], rain: [50, 120], moisture: [40, 70],
    revenue: 35000, cost: 12000, tip: 'Requires well-drained fertile soil.',
  },
  {
    name: 'Sugarcane',
    N: [100, 200], P: [50, 100], K: [80, 150], pH: [6.0, 7.5],
    temp: [20, 38], rain: [100, 200], moisture: [55, 80],
    revenue: 75000, cost: 30000, tip: 'Long growing cycle; ensure consistent irrigation.',
  },
  {
    name: 'Millets',
    N: [20, 60],  P: [15, 40],  K: [15, 40],  pH: [5.5, 7.5],
    temp: [25, 40], rain: [20, 80], moisture: [20, 50],
    revenue: 28000, cost: 8000, tip: 'Extremely drought-tolerant; ideal for dry regions.',
  },
  {
    name: 'Cotton',
    N: [60, 120], P: [30, 60],  K: [40, 80],  pH: [6.0, 7.5],
    temp: [21, 37], rain: [60, 120], moisture: [40, 65],
    revenue: 60000, cost: 22000, tip: 'Requires deep black soil and moderate moisture.',
  },
  {
    name: 'Potato',
    N: [80, 150], P: [60, 100], K: [80, 140], pH: [5.0, 6.5],
    temp: [10, 22], rain: [50, 100], moisture: [50, 75],
    revenue: 55000, cost: 20000, tip: 'Cool climate crop; avoid water-logging.',
  },
  {
    name: 'Tomato',
    N: [70, 130], P: [50, 90],  K: [60, 120], pH: [5.5, 7.0],
    temp: [15, 30], rain: [40, 100], moisture: [45, 70],
    revenue: 65000, cost: 25000, tip: 'Stake plants and maintain consistent watering.',
  },
  {
    name: 'Groundnut',
    N: [15, 40],  P: [30, 60],  K: [25, 55],  pH: [6.0, 7.0],
    temp: [22, 35], rain: [50, 120], moisture: [35, 60],
    revenue: 42000, cost: 15000, tip: 'Fix atmospheric nitrogen; good for sandy loams.',
  },
  {
    name: 'Soybean',
    N: [20, 50],  P: [40, 80],  K: [30, 70],  pH: [6.0, 7.0],
    temp: [18, 30], rain: [60, 120], moisture: [40, 65],
    revenue: 38000, cost: 13000, tip: 'Nitrogen-fixing legume; improves soil health.',
  },
  {
    name: 'Chickpea',
    N: [15, 40],  P: [30, 60],  K: [20, 50],  pH: [6.0, 8.0],
    temp: [10, 25], rain: [20, 70],  moisture: [25, 55],
    revenue: 50000, cost: 14000, tip: 'Tolerates dry conditions; avoid excess moisture.',
  },
  {
    name: 'Mustard',
    N: [40, 90],  P: [25, 55],  K: [20, 50],  pH: [6.0, 7.5],
    temp: [7, 25],  rain: [20, 60],  moisture: [25, 50],
    revenue: 32000, cost: 10000, tip: 'Cool-season oilseed; sow after kharif harvest.',
  },
];

/* ─────────────────────────────────────────────
   FALLBACK SCORING
───────────────────────────────────────────── */
function scoreCrop(crop, params) {
  let score = 0;
  const inRange = (val, [lo, hi]) => val >= lo && val <= hi;
  const partial  = (val, [lo, hi]) => {
    if (inRange(val, [lo, hi])) return 1;
    const dist = val < lo ? lo - val : val - hi;
    const range = hi - lo || 1;
    return Math.max(0, 1 - dist / range);
  };
  score += partial(params.N,            crop.N)        * 25;
  score += partial(params.P,            crop.P)        * 20;
  score += partial(params.K,            crop.K)        * 20;
  score += partial(params.pH,           crop.pH)       * 15;
  score += partial(params.temperature,  crop.temp)     * 10;
  score += partial(params.rainfall,     crop.rain)     * 5;
  score += partial(params.soilMoisture, crop.moisture) * 5;
  return Math.round(score);
}

/* ─────────────────────────────────────────────
   SLIDER COMPONENT
───────────────────────────────────────────── */
function ParamSlider({ label, name, min, max, step = 1, unit, value, onChange, icon: Icon }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className="text-[#1E8E5A]" />}
          <span className="text-xs font-bold text-slate-600">{label}</span>
        </div>
        <span className="text-xs font-black text-[#1E8E5A] bg-[#E6F5EE] px-2.5 py-0.5 rounded-full">
          {value}{unit}
        </span>
      </div>
      <div className="relative h-2 bg-slate-100 border border-slate-200/50 rounded-full">
        <div
          className="absolute h-full bg-[#1E8E5A] rounded-full"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(name, Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-[#1E8E5A] shadow-md transition-transform active:scale-110 pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function CropRecommend() {
  const { t } = useTranslation();
  /* ── State ── */
  const [params, setParams] = useState({
    N: 60, P: 40, K: 50, pH: 6.5,
    temperature: 25, rainfall: 80, soilMoisture: 50,
    irrigated: true,
  });
  const [activePreset,  setActivePreset]  = useState(null);
  const [locationData,   setLocationData]  = useState(null);
  const [gpsLoading,     setGpsLoading]    = useState(false);
  const [gpsError,       setGpsError]      = useState('');
  const [soilImage,      setSoilImage]     = useState(null);
  const [soilPreview,    setSoilPreview]   = useState(null);
  const [analysingImg,   setAnalysingImg]  = useState(false);
  const [detectedSoil,   setDetectedSoil]  = useState(null);
  const [imgError,       setImgError]      = useState('');
  const [loading,        setLoading]       = useState(false);
  const [results,        setResults]       = useState([]);
  const [error,          setError]         = useState('');
  const [dragOver,       setDragOver]      = useState(false);
  const [sidebarOpen,    setSidebarOpen]   = useState(true);

  const fileInputRef = useRef(null);
  const headerRef = useRefHook(null);
  const contentRef = useRefHook(null);
  
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const contentInView = useInView(contentRef, { once: true, amount: 0.3 });

  /* ── Helpers ── */
  const updateParam = (key, val) => setParams(p => ({ ...p, [key]: val }));

  const applyPreset = (name) => {
    setActivePreset(name);
    setParams(p => ({ ...p, ...soilPresets[name] }));
  };

  /* ── GPS Auto-Detect ── */
  const autoDetectEverything = () => {
    setGpsLoading(true);
    setGpsError('');
    setLocationData(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported by your browser.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        try {
          /* Weather from open-meteo */
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,rain&daily=precipitation_sum&timezone=auto&forecast_days=1`
          );
          const weather = await weatherRes.json();
          const temp = Math.round(weather?.current?.temperature_2m ?? 25);
          const rain = Math.round(weather?.daily?.precipitation_sum?.[0] ?? 5);

          /* SoilGrids */
          const soilRes = await fetch(
            `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lon}&lat=${lat}&property=nitrogen&property=phh2o&property=soc&depth=0-5cm&value=mean`
          );
          const soilData = await soilRes.json();
          const layers   = soilData?.properties?.layers ?? [];
          const getVal   = (prop, fallback) => {
            const layer = layers.find(l => l.name === prop);
            return layer?.depths?.[0]?.values?.mean ?? fallback;
          };
          const nitrogenRaw = getVal('nitrogen', 600);
          const phRaw       = getVal('phh2o',    65);
          const N  = Math.min(140, Math.round(nitrogenRaw / 10));
          const pH = Math.min(9, Math.max(4, +(phRaw / 10).toFixed(1)));

          setParams(p => ({
            ...p,
            temperature: temp,
            rainfall: Math.min(300, rain * 30),
            N, pH,
          }));
          setLocationData({ lat: lat.toFixed(4), lon: lon.toFixed(4), temp, rain });
        } catch (err) {
          console.error(err);
          setGpsError('Could not fetch weather/soil data. Using your location only.');
          setLocationData({ lat: lat.toFixed(4), lon: lon.toFixed(4) });
        } finally {
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsError('Location access denied. Please enable GPS permission.');
        setGpsLoading(false);
      }
    );
  };

  /* ── Soil Image Analysis ── */
  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setImgError('Please upload a valid image file.');
      return;
    }
    setImgError('');
    setSoilImage(file);
    setSoilPreview(URL.createObjectURL(file));
    setDetectedSoil(null);
    analyseSoilImage(file);
  };

  const analyseSoilImage = async (file) => {
    setAnalysingImg(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await API.post('/ml/predict/soil', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const soilType = res.data?.soil_type || res.data?.prediction || 'Unknown';
      setDetectedSoil(soilType);
      if (soilPresets[soilType]) applyPreset(soilType);
    } catch {
      setDetectedSoil('Detection failed – presets unchanged.');
    } finally {
      setAnalysingImg(false);
    }
  };

  /* ── Drag & Drop ── */
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  /* ── Recommend ── */
  const handleRecommend = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const res = await API.post('/ml/predict/crop', params);
      const raw = res.data?.recommendations || res.data?.predictions || [];
      if (raw.length) {
        setResults(raw.slice(0, 5));
      } else {
        throw new Error('empty');
      }
    } catch {
      /* Fallback local scoring */
      const scored = cropsData
        .map(c => ({
          name: c.name,
          suitability: scoreCrop(c, params),
          revenue: c.revenue,
          cost:    c.cost,
          profit:  c.revenue - c.cost,
          tip:     c.tip,
        }))
        .sort((a, b) => b.suitability - a.suitability)
        .slice(0, 5);
      setResults(scored);
    } finally {
      setLoading(false);
    }
  };

  /* ── Cleanup preview URL ── */
  useEffect(() => () => { if (soilPreview) URL.revokeObjectURL(soilPreview); }, [soilPreview]);

  /* ── Derived ── */
  const presetNames = Object.keys(soilPresets);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0F4C3A] via-[#0F6B4A] to-[#124230] py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80')] bg-cover bg-center opacity-10" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#2BB673]/10 blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#2BB673]/15 border border-[#2BB673]/30 text-[#2BB673] text-[11px] font-bold px-4 py-2 rounded-full tracking-widest uppercase">
                  <Sprout className="w-4 h-4" />
                  Random Forest ML
                </div>

                <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight font-heading">
                  Crop Recommendation
                  <span className="block text-[#2BB673] mt-2">Intelligence Platform</span>
                </h1>

                <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-lg">
                  Leverage our Random Forest machine learning model to predict optimal crop varieties based on soil NPK levels, pH, rainfall, and temperature data for maximum yield.
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
                      <div className="w-14 h-14 bg-[#2BB673] rounded-2xl flex items-center justify-center">
                        <Sprout className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">Random Forest</h3>
                        <p className="text-white/60 text-sm">Machine Learning Model</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Crops</p>
                        <p className="text-white text-3xl font-black font-heading">12</p>
                      </div>
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Parameters</p>
                        <p className="text-white text-3xl font-black font-heading">5</p>
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                      <Zap className="w-5 h-5 text-[#2BB673]" />
                      <p className="text-white/80 text-sm">AI-powered yield optimization</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-6 md:px-16 py-12">
          {/* Page Header */}
          <div ref={headerRef} className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-[#E6F5EE] rounded-xl flex items-center justify-center border border-emerald-200">
                  <Sprout className="w-6 h-6 text-[#1E8E5A]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 font-heading">Crop Recommendation</h1>
                  <p className="text-sm text-slate-500">Select optimal crop varieties based on soil chemistry and climate data</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Grid */}
          <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left Column (4/12) */}
            <div className="lg:col-span-4 space-y-6">
              {/* GPS Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={contentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#E6F5EE] rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#1E8E5A]" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800">GPS Atmospheric Detect</h2>
                    <p className="text-xs text-slate-500">Auto-detect location & weather</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                  Query local meteorological & coordinates grids instantly using geolocation parameters.
                </p>
                <button
                  onClick={autoDetectEverything}
                  disabled={gpsLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#1E8E5A] hover:bg-[#0F6B4A] text-white text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-60 shadow-md shadow-[#1E8E5A]/10 active:scale-95"
                >
                  {gpsLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Querying Grids...</>
                  ) : (
                    <><MapPin size={16} /> Locate Field</>
                  )}
                </button>

                <AnimatePresence>
                  {locationData && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="bg-[#E6F5EE] border border-emerald-200/50 rounded-2xl p-4 flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#1E8E5A] mt-0.5 shrink-0" />
                        <div className="text-xs text-[#0F6B4A] space-y-1 font-semibold">
                          <p className="font-bold">Grid Parameters Synced</p>
                          <p className="opacity-80">
                            {locationData.lat}°N, {locationData.lon}°E
                            {locationData.temp != null && ` · ${locationData.temp}°C · ${locationData.rain} mm/mo`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {gpsError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
                    >
                      <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-700 font-semibold">{gpsError}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Soil Image Upload Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={contentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Camera className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800">Soil Visual Sync</h2>
                    <p className="text-xs text-slate-500">AI-powered soil classification</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                  Classify soil type from photos in real-time to pre-populate chemical parameters.
                </p>

                {soilPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={soilPreview}
                      alt="Soil sample"
                      className="w-full h-48 object-cover"
                    />
                    {analysingImg && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                        <Loader2 size={24} className="text-white animate-spin" />
                        <p className="text-white text-sm font-semibold">Predicting Structure...</p>
                      </div>
                    )}
                    {detectedSoil && !analysingImg && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-[#0F4C3A] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow">
                          {detectedSoil}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => { setSoilPreview(null); setSoilImage(null); setDetectedSoil(null); }}
                      className="absolute top-3 right-3 bg-white/95 rounded-lg w-8 h-8 flex items-center justify-center text-slate-800 text-sm font-semibold shadow border border-slate-200 hover:bg-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={`border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      dragOver
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <Upload size={28} className="text-slate-400 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Drop soil photograph</p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP (Max 10MB)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); }}
                />
                {imgError && (
                  <p className="mt-3 text-xs text-red-600 flex items-center gap-1 font-bold">
                    <AlertTriangle size={12} /> {imgError}
                  </p>
                )}
              </motion.div>

              {/* Soil Presets Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={contentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <h2 className="font-semibold text-slate-800 mb-1">Soil Chemistry Presets</h2>
                <p className="text-sm text-slate-500 mb-4">Instantly fill chemical ratios via major classifications.</p>
                <div className="flex flex-wrap gap-2">
                  {presetNames.map(name => (
                    <button
                      key={name}
                      onClick={() => applyPreset(name)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        activePreset === name
                          ? 'bg-[#1E8E5A] text-white border-[#1E8E5A] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column (8/12) */}
            <div className="lg:col-span-8 space-y-6">

              {/* Parameters Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={contentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#E6F5EE] rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-[#1E8E5A]" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800">Active Chemistry & Climate Matrices</h2>
                    <p className="text-xs text-slate-500">Adjust parameters for optimal crop selection</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Soil Chemistry */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                      Soil Chemistry
                    </p>
                    <ParamSlider
                      label="Nitrogen (N)" name="N" min={0} max={200} unit=" kg/ha"
                      value={params.N} onChange={updateParam} icon={Sprout}
                    />
                    <ParamSlider
                      label="Phosphorus (P)" name="P" min={0} max={150} unit=" kg/ha"
                      value={params.P} onChange={updateParam} icon={Sprout}
                    />
                    <ParamSlider
                      label="Potassium (K)" name="K" min={0} max={200} unit=" kg/ha"
                      value={params.K} onChange={updateParam} icon={Sprout}
                    />
                    <ParamSlider
                      label="Soil pH" name="pH" min={3} max={10} step={0.1} unit=""
                      value={params.pH} onChange={updateParam}
                    />
                    <ParamSlider
                      label="Soil Moisture" name="soilMoisture" min={0} max={100} unit="%"
                      value={params.soilMoisture} onChange={updateParam} icon={Droplets}
                    />
                  </div>

                  {/* Environment */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                      Environment Grids
                    </p>
                    <ParamSlider
                      label="Atmospheric Temp" name="temperature" min={0} max={50} unit="°C"
                      value={params.temperature} onChange={updateParam} icon={Thermometer}
                    />
                    <ParamSlider
                      label="Rainfall Forecast" name="rainfall" min={0} max={400} unit=" mm/mo"
                      value={params.rainfall} onChange={updateParam} icon={Droplets}
                    />

                    {/* Irrigation Toggle */}
                    <div className="mt-6">
                      <p className="text-sm font-semibold text-slate-600 mb-3">Irrigation Standard</p>
                      <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1">
                        <button
                          onClick={() => updateParam('irrigated', true)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            params.irrigated
                              ? 'bg-white text-[#1E8E5A] shadow-sm border border-slate-100'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Irrigated
                        </button>
                        <button
                          onClick={() => updateParam('irrigated', false)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            !params.irrigated
                              ? 'bg-white text-[#1E8E5A] shadow-sm border border-slate-100'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Rain-fed
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <button
                    onClick={handleRecommend}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#1E8E5A] hover:bg-[#0F6B4A] active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl transition-all disabled:opacity-60 text-sm shadow-md shadow-[#1E8E5A]/10"
                  >
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> Querying Engine...</>
                    ) : (
                      <><TrendingUp size={18} /> Generate Crop Recommendations</>
                    )}
                  </button>
                  {error && (
                    <p className="mt-3 text-sm text-red-600 text-center flex items-center justify-center gap-2 font-semibold">
                      <AlertTriangle size={16} /> {error}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Results */}
              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-[#E6F5EE] rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#1E8E5A]" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-slate-800">Recommended Varieties</h2>
                        <p className="text-xs text-slate-500">AI-powered crop ranking based on your parameters</p>
                      </div>
                      <span className="ml-auto text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                        {results.length} Ranked
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {results.map((crop, idx) => {
                        const imgSrc = CROP_IMAGES[crop.name] || CROP_IMAGES.default;
                        const suitability = typeof crop.suitability === 'number' ? crop.suitability : 0;
                        const revenue = crop.revenue ?? 0;
                        const cost    = crop.cost    ?? 0;
                        const profit  = crop.profit  ?? revenue - cost;
                        const tip     = crop.tip || crop.description || '';
                        const rankColors = [
                          'bg-yellow-400 text-yellow-950',
                          'bg-slate-300 text-slate-800',
                          'bg-orange-300 text-orange-950',
                          'bg-[#E6F5EE] text-[#0F6B4A]',
                          'bg-[#E6F5EE] text-[#0F6B4A]',
                        ];

                        return (
                          <motion.div
                            key={crop.name || idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -4 }}
                            className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden group"
                          >
                            {/* Crop Image */}
                            <div className="relative h-40 overflow-hidden">
                              <img
                                src={imgSrc}
                                alt={crop.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={e => { e.target.src = CROP_IMAGES.default; }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              {/* Rank Badge */}
                              <div className={`absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shadow-md ${rankColors[idx] || rankColors[3]}`}>
                                #{idx + 1}
                              </div>
                              <div className="absolute bottom-3 left-3">
                                <h3 className="text-white font-bold text-lg font-heading">{crop.name}</h3>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-[#1E8E5A]">{suitability}% Suitability</span>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full h-2 bg-slate-100 rounded-full mb-4">
                                <motion.div
                                  className="h-full bg-[#1E8E5A] rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(suitability, 100)}%` }}
                                  transition={{ duration: 0.7, delay: idx * 0.1 + 0.2 }}
                                />
                              </div>

                              {tip && (
                                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{tip}</p>
                              )}

                              {/* Metric Chips */}
                              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                                <div className="flex items-center gap-2 bg-[#E6F5EE] border border-emerald-200 rounded-lg px-3 py-1.5">
                                  <IndianRupee size={12} className="text-[#1E8E5A]" />
                                  <span className="text-xs font-semibold text-emerald-800">
                                    {(revenue / 1000).toFixed(0)}k Revenue
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                                  <IndianRupee size={12} className="text-red-500" />
                                  <span className="text-xs font-semibold text-red-800">
                                    {(cost / 1000).toFixed(0)}k Cost
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5">
                                  <TrendingUp size={12} className="text-[#2F80ED]" />
                                  <span className="text-xs font-semibold text-blue-800">
                                    {(profit / 1000).toFixed(0)}k Profit
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

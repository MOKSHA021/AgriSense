import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  Upload,
  Bug,
  AlertCircle,
  MapPin,
  Store,
  CheckCircle,
  Loader2,
  ScanSearch,
  Image as ImageIcon,
  ShieldCheck,
  RefreshCw,
  X
} from "lucide-react";

const getDiseases = (t) => [
  {
    name: "Late Blight",
    severity: "High",
    treatment: "Spray Mancozeb 2.5g/L water, repeat after 7 days.",
  },
  {
    name: "Leaf Rust",
    severity: "Medium",
    treatment: "Apply Propiconazole 1ml/L water immediately.",
  },
  {
    name: "Aphid Infestation",
    severity: "Medium",
    treatment: "Spray Imidacloprid 0.5ml/L water and monitor daily.",
  },
  {
    name: "Powdery Mildew",
    severity: "Low",
    treatment: "Apply Sulfur dust or Karathane 1ml/L to prevent spread.",
  },
  {
    name: "Healthy",
    severity: "None",
    treatment: "No treatment needed. Crop looks healthy and optimal.",
  },
];

const nearbyShops = [
  { name: "Krishna Agro Store", distance: "1.2 km", price: "280", stock: "In Stock" },
  { name: "Jai Kisan Supplies", distance: "2.5 km", price: "310", stock: "In Stock" },
  { name: "Ravi Agricultural Center", distance: "3.8 km", price: "265", stock: "Low Stock" },
];

const severityColor = {
  High: "bg-rose-50 text-rose-700 border-rose-200 shadow-rose-500/10",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-500/10",
  Low: "bg-brand-50 text-brand-700 border-brand-200 shadow-brand-500/10",
  None: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-500/10",
};

function getRandomConfidence() {
  return Math.floor(Math.random() * 11) + 85;
}

const PestDetection = () => {
  const { t } = useTranslation();
  const diseases = getDiseases(t);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let interval;
    if (analyzing) {
      interval = setInterval(() => {
        setProgress((old) => {
          if (old >= 100) {
            clearInterval(interval);
            return 100;
          }
          return old + 2;
        });
      }, 30);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  const processImage = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    setAnalyzing(true);
    setProgress(0);
    
    // Simulate ML Network Delay
    setTimeout(() => {
      const picked = diseases[Math.floor(Math.random() * diseases.length)];
      setAnalyzing(false);
      setResult({ ...picked, confidence: getRandomConfidence() });
    }, 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processImage(file);
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setAnalyzing(false);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
            <ScanSearch className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading text-slate-900">{t('pest.title')}</h1>
            <p className="text-slate-500 font-medium mt-1">
              {t('pest.desc')}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          {!preview ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-100 transition-all shadow-inner">
                <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-700 mb-1 group-hover:text-emerald-700">{t('pest.dropPhoto')}</h3>
              <p className="text-sm text-slate-500 font-medium mb-4">{t('pest.clickBrowse')}</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-xs font-semibold text-slate-500">
                <ShieldCheck className="w-4 h-4"/> {t('pest.supports')}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Preview Area */}
              <div className="space-y-4">
                <div className="relative border border-slate-200 rounded-2xl overflow-hidden shadow-inner group bg-slate-100 aspect-square flex items-center justify-center">
                  <img
                    src={preview}
                    alt="Leaf sample"
                    className={`w-full h-full object-cover transition-all duration-500 ${analyzing ? 'opacity-50 grayscale blur-sm scale-105' : 'opacity-100'}`}
                  />
                  
                  {/* Scanning overlay */}
                  {analyzing && (
                    <div className="absolute inset-0 pointer-events-none">
                       <div className="w-full h-1 bg-emerald-400 shadow-[0_0_15px_3px_rgba(52,211,153,0.5)] absolute top-1/2 animate-pulse"></div>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <ScanSearch className="w-12 h-12 text-emerald-500 animate-pulse mb-3 drop-shadow-lg"/>
                           <span className="bg-slate-900/80 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                             <Loader2 className="w-4 h-4 animate-spin"/> {t('pest.analyzing')} {progress}%
                           </span>
                       </div>
                    </div>
                  )}

                  {!analyzing && (
                     <button 
                       onClick={handleReset} 
                       className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                       title="Remove Image"
                     >
                       <X className="w-4 h-4" />
                     </button>
                  )}
                </div>
                {!analyzing && result && (
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> {t('pest.analyzeAnother')}
                  </button>
                )}
              </div>

              {/* Results Area */}
              <div className="flex flex-col">
                {analyzing ? (
                  <div className="h-full border border-slate-100 bg-slate-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                    <h3 className="text-lg font-bold font-heading text-slate-700 mb-2">{t('pest.engineActive')}</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-xs">{t('pest.engineDesc')}</p>
                  </div>
                ) : result ? (
                  <div className="space-y-5 animate-fade-in flex-1">
                    {/* Primary Result Box */}
                    <div className={`p-6 rounded-2xl border shadow-sm ${severityColor[result.severity]}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/50 backdrop-blur-sm shadow-sm`}>
                          {result.severity === "None" ? <CheckCircle className="w-6 h-6"/> : <AlertCircle className="w-6 h-6"/>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-xl font-bold font-heading">{result.name}</h3>
                            <span className="text-sm font-bold px-2 py-0.5 rounded-md bg-white/50">{result.confidence}% {t('pest.match')}</span>
                          </div>
                          <p className="text-sm font-semibold opacity-80 uppercase tracking-widest mb-3">{t('pest.severity')}: {result.severity}</p>
                          <div className="bg-white/60 rounded-xl p-3 shadow-sm border border-white/40">
                            <h4 className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">{t('pest.treatment')}</h4>
                            <p className="text-sm font-semibold leading-relaxed">{result.treatment}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stores Box */}
                    {result.severity !== "None" && (
                      <div className="border border-slate-200 bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <Store className="w-5 h-5 text-slate-400" />
                          <h4 className="font-bold font-heading text-slate-800">{t('pest.availableNear')}</h4>
                        </div>
                        <div className="space-y-3">
                          {nearbyShops.map((shop, i) => (
                            <div key={i} className="flex items-center justify-between group hover:bg-slate-50 p-3 -mx-3 rounded-xl transition-colors cursor-pointer">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors">
                                  <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{shop.name}</p>
                                  <p className="text-xs font-medium text-slate-500">{shop.distance} {t('pest.away')}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-slate-900">&#8377;{shop.price}<span className="text-xs text-slate-500 font-medium">{t('pest.btl')}</span></p>
                                <p className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${shop.stock === 'In Stock' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {shop.stock === 'In Stock' ? t('pest.inStock') : t('pest.lowStock')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PestDetection;

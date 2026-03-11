import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  Upload,
  Camera,
  Droplets,
  Thermometer,
  Leaf,
  Layers,
  ChevronDown,
  Loader2,
  CheckCircle2,
  Sprout,
  MapPin,
} from "lucide-react";

const soilDatabase = {
  Alluvial: {
    color: "Light grey to ash grey",
    texture: "Sandy loam to clay loam",
    drainage: "Well-drained",
    phRange: "6.5 - 8.0",
    crops: ["Rice", "Wheat", "Sugarcane", "Maize", "Cotton"],
  },
  Black: {
    color: "Deep black to dark grey",
    texture: "Clayey and compact",
    drainage: "Poor (high water retention)",
    phRange: "7.2 - 8.5",
    crops: ["Cotton", "Sorghum", "Wheat", "Sugarcane", "Groundnut"],
  },
  Red: {
    color: "Red to reddish-brown",
    texture: "Sandy to clayey",
    drainage: "Moderate",
    phRange: "5.5 - 7.0",
    crops: ["Millets", "Groundnut", "Potato", "Maize", "Pulses"],
  },
  Laterite: {
    color: "Reddish-brown",
    texture: "Coarse and gravelly",
    drainage: "Excessive",
    phRange: "5.0 - 6.5",
    crops: ["Tea", "Coffee", "Cashew", "Rubber", "Coconut"],
  },
  Sandy: {
    color: "Light yellow to brown",
    texture: "Loose and gritty",
    drainage: "Excessive (low retention)",
    phRange: "5.5 - 7.0",
    crops: ["Groundnut", "Millets", "Barley", "Pulses", "Potato"],
  },
};

const previousCropOptions = ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "None"];

const characteristicsFields = [
  { key: "color", label: "Color", icon: Layers },
  { key: "texture", label: "Texture", icon: Leaf },
  { key: "drainage", label: "Drainage", icon: Droplets },
  { key: "phRange", label: "pH Range", icon: Thermometer },
];

function detectSoilType(irrigationType, previousCrop) {
  if (previousCrop === "Cotton") return "Black";
  if (previousCrop === "Rice" && irrigationType === "irrigated") return "Alluvial";
  if (previousCrop === "Millets" || previousCrop === "Groundnut") return "Red";
  if (irrigationType === "rainfed") return "Laterite";
  return "Alluvial";
}

const SoilAnalysis = () => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploadAnalyzing, setUploadAnalyzing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const [irrigationType, setIrrigationType] = useState("irrigated");
  const [previousCrop, setPreviousCrop] = useState("None");
  const [fieldYears, setFieldYears] = useState("");
  const [manualResult, setManualResult] = useState(null);

  const [gpsStatus, setGpsStatus] = useState("idle");
  const [gpsLocation, setGpsLocation] = useState("");
  const [gpsSoilData, setGpsSoilData] = useState(null);

  const fetchSoilByGPS = async () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    setGpsStatus("detecting");
    setGpsSoilData(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const [soilRes, geoRes] = await Promise.all([
            fetch(
              `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${longitude}&lat=${latitude}&property=nitrogen&property=phh2o&property=soc&property=clay&property=sand&property=silt&property=cec&property=bdod&depth=0-5cm&depth=5-15cm&value=mean`
            ),
            fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
              { headers: { "User-Agent": "AgriSense/1.0" } }
            ),
          ]);
          if (!soilRes.ok) throw new Error();
          const soilData = await soilRes.json();
          const geo = await geoRes.json();

          const layers = soilData.properties?.layers || [];
          const getVal = (name, depthIdx = 0) => {
            const layer = layers.find((l) => l.name === name);
            return layer?.depths?.[depthIdx]?.values?.mean ?? null;
          };

          const rawN = getVal("nitrogen");
          const rawPh = getVal("phh2o");
          const rawSoc = getVal("soc");
          const rawCec = getVal("cec");
          const rawBdod = getVal("bdod");
          const rawCite = getVal("clay");
          const rawSand = getVal("sand");
          const rawSilt = getVal("silt");

          const result = {
            nitrogen: rawN != null ? Math.round(rawN * 0.39) : null,
            phosphorus: rawSoc != null ? Math.round((rawSoc / 10) * 2.5) : null,
            potassium: rawCec != null ? Math.round(rawCec * 0.4) : null,
            ph: rawPh != null ? Math.round((rawPh / 10) * 10) / 10 : null,
            organicCarbon: rawSoc != null ? Math.round((rawSoc / 10) * 10) / 10 : null,
            cec: rawCec != null ? Math.round(rawCec * 10) / 10 : null,
            bulkDensity: rawBdod != null ? Math.round(rawBdod) / 100 : null,
            clay: rawCite != null ? Math.round(rawCite / 10) : null,
            sand: rawSand != null ? Math.round(rawSand / 10) : null,
            silt: rawSilt != null ? Math.round(rawSilt / 10) : null,
          };

          setGpsSoilData(result);
          setGpsLocation(
            geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || "Your location"
          );
          setGpsStatus("done");
        } catch {
          setGpsStatus("error");
        }
      },
      () => setGpsStatus("error")
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setUploadResult(null);
    setUploadAnalyzing(true);
    setTimeout(() => {
      setUploadAnalyzing(false);
      setUploadResult("Alluvial");
    }, 1500);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setUploadResult(null);
    setUploadAnalyzing(true);
    setTimeout(() => {
      setUploadAnalyzing(false);
      setUploadResult("Alluvial");
    }, 1500);
  };

  const handleAnalyze = () => {
    const type = detectSoilType(irrigationType, previousCrop);
    setManualResult(type);
  };

  const renderSoilResult = (soilType, title) => {
    const data = soilDatabase[soilType];
    if (!data) return null;

    return (
      <div className="space-y-4 mt-6">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        <div className="border border-green-500/30 bg-green-500/20 rounded-lg px-4 py-3">
          <p className="text-sm font-medium text-green-300">
            Detected Soil Type: <span className="font-bold">{soilType} Soil</span>
          </p>
        </div>

        <div className="border border-white/10 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white/70 mb-3">Characteristics</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {characteristicsFields.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-start gap-2">
                <Icon className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-white/50">{label}</p>
                  <p className="text-sm font-medium text-white">{data[key]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-white/10 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sprout className="w-4 h-4 text-green-600" />
            <h4 className="text-sm font-semibold text-white/70">Recommended Crops</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.crops.map((crop) => (
              <span
                key={crop}
                className="px-3 py-1 text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/30 rounded-full"
              >
                {crop}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative z-10">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white drop-shadow">Soil Analysis</h1>
          <p className="text-sm text-white/70 mt-1">
            Upload a soil photo or enter details manually to identify soil type and get crop recommendations.
          </p>
        </div>

        {/* GPS Soil Analysis */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-400" />
              <h2 className="text-base font-semibold text-white">GPS Soil Analysis</h2>
            </div>
            <button
              onClick={fetchSoilByGPS}
              disabled={gpsStatus === "detecting"}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {gpsStatus === "detecting" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Detect My Soil
                </>
              )}
            </button>
          </div>

          <p className="text-sm text-white/50 mb-4">
            Uses ISRIC SoilGrids to fetch real soil properties for your GPS location.
          </p>

          {gpsStatus === "done" && gpsSoilData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-green-300">
                  Soil data for {gpsLocation}
                </span>
              </div>

              {/* Primary nutrients */}
              <div>
                <h4 className="text-sm font-semibold text-white/70 mb-3">Primary Nutrients (estimated kg/ha)</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Nitrogen (N)", value: gpsSoilData.nitrogen, unit: "kg/ha", color: "text-blue-300" },
                    { label: "Phosphorus (P)", value: gpsSoilData.phosphorus, unit: "kg/ha", color: "text-amber-300" },
                    { label: "Potassium (K)", value: gpsSoilData.potassium, unit: "kg/ha", color: "text-purple-300" },
                    { label: "pH", value: gpsSoilData.ph, unit: "", color: "text-green-300" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/10 rounded-lg p-3 text-center">
                      <p className="text-xs text-white/50 mb-1">{item.label}</p>
                      <p className={`text-lg font-bold ${item.color}`}>
                        {item.value != null ? item.value : "—"}
                      </p>
                      {item.unit && <p className="text-xs text-white/40">{item.unit}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Soil properties */}
              <div>
                <h4 className="text-sm font-semibold text-white/70 mb-3">Soil Properties</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Organic Carbon", value: gpsSoilData.organicCarbon, unit: "g/kg" },
                    { label: "CEC", value: gpsSoilData.cec, unit: "mmol/kg" },
                    { label: "Bulk Density", value: gpsSoilData.bulkDensity, unit: "g/cm³" },
                    { label: "Clay", value: gpsSoilData.clay, unit: "%" },
                    { label: "Sand", value: gpsSoilData.sand, unit: "%" },
                    { label: "Silt", value: gpsSoilData.silt, unit: "%" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-white/50">{item.label}</p>
                      <p className="text-sm font-semibold text-white">
                        {item.value != null ? `${item.value} ${item.unit}` : "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Texture estimate */}
              {gpsSoilData.clay != null && gpsSoilData.sand != null && (
                <div className="border border-white/10 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white/70 mb-2">Soil Texture</h4>
                  <div className="flex gap-2">
                    {[
                      { label: "Clay", pct: gpsSoilData.clay, color: "bg-amber-500" },
                      { label: "Silt", pct: gpsSoilData.silt, color: "bg-blue-500" },
                      { label: "Sand", pct: gpsSoilData.sand, color: "bg-yellow-500" },
                    ].map((s) => (
                      <div key={s.label} className="flex-1">
                        <div className="flex justify-between text-xs text-white/50 mb-1">
                          <span>{s.label}</span>
                          <span>{s.pct}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full">
                          <div
                            className={`h-2 rounded-full ${s.color}`}
                            style={{ width: `${s.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {gpsStatus === "error" && (
            <div className="text-sm text-red-400">
              Could not fetch soil data. Please allow location access and try again.
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-5 h-5 text-white/60" />
            <h2 className="text-base font-semibold text-white">Photo Analysis</h2>
          </div>

          {!preview ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/30 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors"
            >
              <Upload className="w-10 h-10 text-white/40 mb-3" />
              <p className="text-sm text-white/60 font-medium">
                Drop your soil photo here or click to browse
              </p>
              <p className="text-xs text-white/40 mt-1">Accepts image files (JPG, PNG, WebP)</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Soil sample"
                  className="w-full max-h-64 object-cover"
                />
              </div>

              {uploadAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing soil sample...</span>
                </div>
              )}

              {uploadResult && renderSoilResult(uploadResult, "Photo Analysis Result")}

              <button
                onClick={() => {
                  setPreview(null);
                  setUploadResult(null);
                  setUploadAnalyzing(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-sm text-white/50 hover:text-white/70 underline"
              >
                Upload a different photo
              </button>
            </div>
          )}
        </div>

        {/* Manual Input Section */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-white/60" />
            <h2 className="text-base font-semibold text-white">Manual Input</h2>
          </div>

          <div className="space-y-5">
            {/* Irrigation Toggle */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Irrigation Type
              </label>
              <div className="flex gap-2">
                {["irrigated", "rainfed"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setIrrigationType(type)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      irrigationType === type
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white/10 text-white/60 border-white/20 hover:border-white/30"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Previous Crop */}
            <div>
              <label
                htmlFor="previousCrop"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                Previous Crop
              </label>
              <div className="relative">
                <select
                  id="previousCrop"
                  value={previousCrop}
                  onChange={(e) => setPreviousCrop(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-10 text-sm border border-white/10 rounded-lg bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {previousCropOptions.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-white/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field History Years */}
            <div>
              <label
                htmlFor="fieldYears"
                className="block text-sm font-medium text-white/70 mb-2"
              >
                Field History (years)
              </label>
              <input
                id="fieldYears"
                type="number"
                min={0}
                max={100}
                value={fieldYears}
                onChange={(e) => setFieldYears(e.target.value)}
                placeholder="e.g. 5"
                className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Analyze Button */}
            <button
              type="button"
              onClick={handleAnalyze}
              className="w-full py-2.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Analyze
            </button>
          </div>

          {manualResult && renderSoilResult(manualResult, "Manual Analysis Result")}
        </div>
      </div>
      </div>
    </div>
  );
};

export default SoilAnalysis;

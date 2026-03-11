import { useState, useRef } from "react";
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
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>

        <div className="border border-green-200 bg-green-50 rounded-lg px-4 py-3">
          <p className="text-sm font-medium text-green-800">
            Detected Soil Type: <span className="font-bold">{soilType} Soil</span>
          </p>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Characteristics</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {characteristicsFields.map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-start gap-2">
                <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{data[key]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sprout className="w-4 h-4 text-green-600" />
            <h4 className="text-sm font-semibold text-gray-700">Recommended Crops</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.crops.map((crop) => (
              <span
                key={crop}
                className="px-3 py-1 text-sm font-medium bg-green-50 text-green-700 border border-green-200 rounded-full"
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
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Soil Analysis</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload a soil photo or enter details manually to identify soil type and get crop recommendations.
          </p>
        </div>

        {/* Upload Section */}
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-5 h-5 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-800">Photo Analysis</h2>
          </div>

          {!preview ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer hover:border-green-400 transition-colors"
            >
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 font-medium">
                Drop your soil photo here or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">Accepts image files (JPG, PNG, WebP)</p>
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
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={preview}
                  alt="Soil sample"
                  className="w-full max-h-64 object-cover"
                />
              </div>

              {uploadAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
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
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Upload a different photo
              </button>
            </div>
          )}
        </div>

        {/* Manual Input Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-800">Manual Input</h2>
          </div>

          <div className="space-y-5">
            {/* Irrigation Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
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
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Previous Crop
              </label>
              <div className="relative">
                <select
                  id="previousCrop"
                  value={previousCrop}
                  onChange={(e) => setPreviousCrop(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {previousCropOptions.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field History Years */}
            <div>
              <label
                htmlFor="fieldYears"
                className="block text-sm font-medium text-gray-700 mb-2"
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
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
  );
};

export default SoilAnalysis;

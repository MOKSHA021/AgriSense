import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import {
  Upload,
  Bug,
  AlertCircle,
  MapPin,
  Store,
  CheckCircle,
  Loader2,
} from "lucide-react";

const diseases = [
  {
    name: "Late Blight",
    severity: "High",
    treatment: "Spray Mancozeb 2.5g/L water, repeat after 7 days",
  },
  {
    name: "Leaf Rust",
    severity: "Medium",
    treatment: "Apply Propiconazole 1ml/L water",
  },
  {
    name: "Aphid Infestation",
    severity: "Medium",
    treatment: "Spray Imidacloprid 0.5ml/L water",
  },
  {
    name: "Powdery Mildew",
    severity: "Low",
    treatment: "Apply Sulfur dust or Karathane 1ml/L",
  },
  {
    name: "Healthy",
    severity: "None",
    treatment: "No treatment needed. Crop looks healthy.",
  },
];

const nearbyShops = [
  { name: "Krishna Agro Store", distance: "1.2 km", price: "280", stock: "In Stock" },
  { name: "Jai Kisan Supplies", distance: "2.5 km", price: "310", stock: "In Stock" },
  { name: "Ravi Agricultural Center", distance: "3.8 km", price: "265", stock: "Low Stock" },
];

const severityColor = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-green-50 text-green-700 border-green-200",
  None: "bg-gray-50 text-gray-600 border-gray-200",
};

function getRandomConfidence() {
  return Math.floor(Math.random() * 11) + 85;
}

const PestDetection = () => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const processImage = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
    setAnalyzing(true);
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pest Detection</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload a leaf photo to detect pests or diseases and get treatment recommendations.
          </p>
        </div>

        {/* Upload Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bug className="w-5 h-5 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-800">Leaf Analysis</h2>
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
                Drop your leaf photo here or click to browse
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
                  alt="Leaf sample"
                  className="w-full max-h-64 object-cover"
                />
              </div>

              {analyzing && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </div>
              )}

              {result && (
                <div className="space-y-4 mt-2">
                  {/* Detection Result */}
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Detection Result</h3>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                    {/* Disease Name + Confidence */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-800">
                          {result.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-500">
                        {result.confidence}% confidence
                      </span>
                    </div>

                    {/* Severity Badge */}
                    <div>
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${severityColor[result.severity]}`}
                      >
                        Severity: {result.severity}
                      </span>
                    </div>

                    {/* Treatment */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Treatment Instructions
                      </h4>
                      <ol className="list-decimal list-inside space-y-1">
                        {result.treatment.split(", ").map((step, i) => (
                          <li key={i} className="text-sm text-gray-600">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Nearby Shops */}
                  {result.severity !== "None" && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Store className="w-4 h-4 text-gray-600" />
                        <h4 className="text-sm font-semibold text-gray-700">Nearby Shops</h4>
                      </div>
                      <div className="space-y-3">
                        {nearbyShops.map((shop) => (
                          <div
                            key={shop.name}
                            className="flex items-start justify-between border border-gray-100 rounded-lg px-4 py-3"
                          >
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-800">{shop.name}</p>
                                <p className="text-xs text-gray-500">{shop.distance}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-800">
                                &#8377;{shop.price}/bottle
                              </p>
                              <p
                                className={`text-xs font-medium ${
                                  shop.stock === "Low Stock"
                                    ? "text-amber-600"
                                    : "text-green-600"
                                }`}
                              >
                                {shop.stock}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Upload a different photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PestDetection;

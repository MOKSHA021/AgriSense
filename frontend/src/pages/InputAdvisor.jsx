import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  ShoppingCart,
  MapPin,
  Store,
  Package,
  CheckCircle,
  IndianRupee,
  Search,
  Loader,
} from "lucide-react";
import API from "../services/api";

const CROPS = [
  "Wheat",
  "Rice",
  "Maize",
  "Cotton",
  "Sugarcane",
  "Potato",
  "Soybean",
  "Groundnut",
];

const InputAdvisor = () => {
  const [crop, setCrop] = useState("");
  const [area, setArea] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [dataSource, setDataSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState("");
  const [availableCrops, setAvailableCrops] = useState(CROPS);

  useEffect(() => {
    const loadAvailableCrops = async () => {
      try {
        const { data } = await API.get("/input-advisor/crops");
        setAvailableCrops(data.crops || CROPS);
      } catch (err) {
        console.error("Failed to load available crops:", err);
      }
    };
    loadAvailableCrops();
  }, []);

  const resetResults = () => {
    setResults(null);
    setTotalCost(0);
    setDataSource("");
  };

  const handleRecommend = async () => {
    if (!crop || !area || Number(area) <= 0) return;

    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/input-advisor/recommend", {
        crop,
        area,
        location,
        inStockOnly: false,
      });
      setResults(data.recommendations || []);
      setTotalCost(data.totalCost || 0);
      setDataSource(data.dataSource || "");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load input recommendations");
      resetResults();
    } finally {
      setLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Location detection is not supported in this browser");
      return;
    }

    setDetecting(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "Accept-Language": "en-US,en;q=0.9" } },
          );
          if (!response.ok) throw new Error("Fetch failed");
          const data = await response.json();
          const address = data.address || {};
          const resolved =
            address.city ||
            address.town ||
            address.village ||
            address.suburb ||
            address.county ||
            address.state ||
            "Hyderabad";
          setLocation(resolved);
          resetResults();
        } catch {
          setLocation("Hyderabad");
          resetResults();
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setDetecting(false);
        setError("Could not detect location. Please type your city or district.");
      },
    );
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1920&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/70" />
      </div>
      <div className="relative z-10">
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="mb-8">
            <div className="mb-1 flex items-center gap-3">
              <ShoppingCart className="h-7 w-7 text-green-400" />
              <h1 className="text-2xl font-bold text-white">Input Shopping Advisor</h1>
            </div>
            <p className="ml-10 text-sm text-white/50">
              Estimate required inputs and compare seller inventory by stock, price, and location.
            </p>
          </div>

          <div className="mb-8 rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    resetResults();
                  }}
                  placeholder="Enter city or district..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detecting}
                className="flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-3 text-sm text-white/60 transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                {detecting ? <Loader className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                <span className="hidden sm:block">{detecting ? "Detecting" : "Detect"}</span>
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/70">
                  Select Crop
                </label>
                <select
                  value={crop}
                  onChange={(e) => {
                    setCrop(e.target.value);
                    resetResults();
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="" className="bg-zinc-900 text-white">
                    Choose a crop
                  </option>
                  {availableCrops.map((c) => (
                    <option key={c} value={c} className="bg-zinc-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/70">
                  Area (acres)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    resetResults();
                  }}
                  placeholder="e.g. 5"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            <button
              onClick={handleRecommend}
              disabled={loading || !crop || !area || Number(area) <= 0}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-green-900/20 transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Package className="h-4 w-4" />
              {loading ? "Finding Sellers..." : "Get Recommendations"}
            </button>

            <p className="mt-3 text-xs text-white/40">
              Inventory is read from MongoDB. Current records are seeded demo sellers until real dealers are onboarded.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white drop-shadow">
                  Input Requirements for {crop} - {area} acre{Number(area) !== 1 ? "s" : ""}
                </h2>
                {dataSource && <p className="mt-1 text-xs text-white/45">{dataSource}</p>}
              </div>

              {results.map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-white/10 bg-black/40 p-5 shadow-lg backdrop-blur-xl"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-white/60" />
                      <span className="text-base font-semibold text-white">
                        {item.displayName || item.name}
                      </span>
                    </div>
                    <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-0.5 text-sm font-medium text-green-300">
                      {item.totalQty.toLocaleString()} {item.unit}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {item.sellers.map((seller) => {
                      const isBest = seller.price === item.bestPrice && seller.inStock;
                      return (
                        <div
                          key={seller.id}
                          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                            isBest
                              ? "border-green-500/30 bg-green-500/15"
                              : "border-white/10 bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Store className="h-4 w-4 text-white/50" />
                            <div>
                              <p className="font-medium text-white">
                                {seller.name}
                                {isBest && (
                                  <span className="ml-2 text-xs font-semibold text-green-300">
                                    Best Price
                                  </span>
                                )}
                              </p>
                              <p className="flex items-center gap-1 text-xs text-white/50">
                                <MapPin className="h-3 w-3" />
                                {seller.district}, {seller.state} - {seller.distanceKm} km
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            <span className="flex items-center gap-0.5 font-medium text-white">
                              <IndianRupee className="h-3.5 w-3.5" />
                              {seller.price}/{item.unit === "buds" ? "bud" : "kg"}
                            </span>
                            <span
                              className={`flex items-center gap-1 text-xs font-medium ${
                                seller.inStock ? "text-green-300" : "text-red-300"
                              }`}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              {seller.inStock
                                ? `${seller.stockQty.toLocaleString()} ${item.unit} in stock`
                                : "Low Stock"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-6 py-4 shadow-lg backdrop-blur-xl">
                <span className="text-base font-semibold text-white">
                  Total Estimated Input Cost
                </span>
                <span className="flex items-center gap-1 text-lg font-bold text-green-400">
                  <IndianRupee className="h-5 w-5" />
                  {totalCost.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InputAdvisor;

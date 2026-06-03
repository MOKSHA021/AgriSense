import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  ShoppingCart, MapPin, Store, Package, CheckCircle, IndianRupee, Search, Loader
} from "lucide-react";
import API from "../services/api";

const CROPS = [
  "Wheat", "Rice", "Maize", "Cotton", "Sugarcane", "Potato", "Soybean", "Groundnut"
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
    <div className="min-h-screen bg-[#F7F9FA] selection:bg-emerald-100">
      <Navbar />

      <main className="dashboard-main-content max-w-4xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8 flex items-center gap-4 pt-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
            <ShoppingCart className="h-6 w-6 text-[#1E8E5A]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F6B4A] tracking-tight font-heading">Input Shopping Advisor</h1>
            <p className="text-slate-450 text-xs sm:text-sm mt-1 font-semibold">
              Estimate fertilizer/seed requirements and check local dealer inventory options.
            </p>
          </div>
        </div>

        {/* Configurations Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  resetResults();
                }}
                placeholder="Enter city or district..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1E8E5A] transition"
              />
            </div>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detecting}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-4 py-3.5 text-xs font-bold text-slate-600 transition-all disabled:opacity-50 active:scale-95"
            >
              {detecting ? <Loader className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4 text-[#1E8E5A]" />}
              <span>{detecting ? "Locating..." : "GPS Locate"}</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-widest">
                Crop Variety
              </label>
              <select
                value={crop}
                onChange={(e) => {
                  setCrop(e.target.value);
                  resetResults();
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-[#1E8E5A] transition appearance-none font-medium"
              >
                <option value="" className="bg-white text-slate-800">
                  Select crop target
                </option>
                {availableCrops.map((c) => (
                  <option key={c} value={c} className="bg-white text-slate-800">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-widest">
                Cultivation Area (acres)
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1E8E5A] transition font-medium"
              />
            </div>
          </div>

          <button
            onClick={handleRecommend}
            disabled={loading || !crop || !area || Number(area) <= 0}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1E8E5A] hover:bg-[#0F6B4A] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#1E8E5A]/10 transition-colors disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
          >
            <Package className="h-4 w-4" />
            {loading ? "Sourcing Dealer Inventory..." : "Evaluate Shopping Options"}
          </button>

          <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Inventory is verified from database. Listed dealers represent licensed agricultural supply outlets.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-xs font-bold text-red-650 shadow-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 font-heading">
                Evaluated Input Demands: {crop} ({area} acre{Number(area) !== 1 ? "s" : ""})
              </h2>
              {dataSource && <p className="mt-1 text-xs text-slate-400 font-semibold">{dataSource}</p>}
            </div>

            {results.map((item) => (
              <div
                key={item.name}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-slate-450" />
                    <span className="text-base font-extrabold text-slate-800 font-heading">
                      {item.displayName || item.name}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#E6F5EE] border border-emerald-200 px-3.5 py-1 text-xs font-bold text-[#0F6B4A]">
                    Total Required: {item.totalQty.toLocaleString()} {item.unit}
                  </span>
                </div>

                <div className="space-y-3">
                  {item.sellers.map((seller) => {
                    const isBest = seller.price === item.bestPrice && seller.inStock;
                    return (
                      <div
                        key={seller.id}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-xs font-semibold ${
                          isBest
                            ? "border-emerald-250 bg-[#E6F5EE]/40"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Store className="h-4 w-4 text-slate-400" />
                          <div>
                            <p className="font-bold text-slate-850">
                              {seller.name}
                              {isBest && (
                                <span className="ml-2 bg-[#E6F5EE] text-[#0F6B4A] border border-emerald-200 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                                  Best Dealer Price
                                </span>
                              )}
                            </p>
                            <p className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                              <MapPin className="h-3 w-3" />
                              {seller.district}, {seller.state} · {seller.distanceKm} km away
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-5">
                          <span className="flex items-center font-bold text-slate-800">
                            <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-slate-500" />
                            {seller.price}/{item.unit === "buds" ? "bud" : "kg"}
                          </span>
                          <span
                            className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${
                              seller.inStock ? "text-[#0F6B4A]" : "text-red-650"
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

            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-3xl px-6 py-5 shadow-sm">
              <span className="text-base font-extrabold text-slate-800 font-heading">
                Total Estimated Sourcing Cost
              </span>
              <span className="flex items-center font-black text-xl text-[#0F6B4A] font-heading">
                <IndianRupee className="h-5 w-5 mr-0.5" />
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
  );
};

export default InputAdvisor;

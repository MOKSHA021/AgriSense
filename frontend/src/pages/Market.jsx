import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

// ── Constants ──
const CROPS = [
  { name: "Wheat",     icon: "🌾", unit: "quintal" },
  { name: "Rice",      icon: "🍚", unit: "quintal" },
  { name: "Tomato",    icon: "🍅", unit: "kg" },
  { name: "Onion",     icon: "🧅", unit: "kg" },
  { name: "Potato",    icon: "🥔", unit: "kg" },
  { name: "Maize",     icon: "🌽", unit: "quintal" },
  { name: "Soybean",   icon: "🫘", unit: "quintal" },
  { name: "Cotton",    icon: "🌸", unit: "quintal" },
  { name: "Sugarcane", icon: "🎋", unit: "tonne" },
  { name: "Mustard",   icon: "🌻", unit: "quintal" },
];

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar", "Chandigarh", "Dadra and Nagar Haveli",
  "Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
].sort();

const SEASONS = ["Kharif", "Rabi", "Zaid"];

const NAV_LINKS = [
  { label: "🏠 Home",    path: "/dashboard" },
  { label: "🌱 Crops",   path: "/dashboard/recommend" },
  { label: "📊 Market",  path: "/dashboard/market" },
  { label: "🌦️ Weather", path: "/dashboard/weather" },
];

// ── Component ──
const Market = () => {
  const navigate = useNavigate();

  // ── Tab ──
  const [activeTab, setActiveTab] = useState("mandi");

  // ── Tab 1 only: Districts ──                          ✅ FIX 1: separated from shared
  const [mandiDistricts,  setMandiDistricts]  = useState([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [districtError,   setDistrictError]   = useState("");

  // ── Tab 1: Best Mandi ──
  const [mandiForm,    setMandiForm]    = useState({ crop: "", quantity: "", state: "", district: "" });
  const [mandiResults, setMandiResults] = useState(null);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [mandiError,   setMandiError]   = useState("");

  // ── Tab 2: Live Prices ──                             ✅ FIX 2: removed liveDistrict
  const [liveCrop,    setLiveCrop]    = useState("");
  const [liveState,   setLiveState]   = useState("");
  const [liveData,    setLiveData]    = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError,   setLiveError]   = useState("");

  // ── Tab 3: Prediction ──
  const [predForm,    setPredForm]    = useState({ crop: "", state: "", season: "", year: new Date().getFullYear() });
  const [prediction,  setPrediction]  = useState(null);
  const [predLoading, setPredLoading] = useState(false);
  const [predError,   setPredError]   = useState("");

  // ─────────────────────────────────────
  // TAB 1 ONLY — Fetch districts
  // ─────────────────────────────────────
  const fetchDistricts = async (selectedState) => {       // ✅ FIX 3: uses mandiDistricts state
    if (!selectedState) return;
    setDistrictLoading(true);
    setMandiDistricts([]);
    setDistrictError("");
    try {
      const { data } = await API.get("/market/districts", {
        params: { state: selectedState },
      });
      setMandiDistricts(data.districts);
    } catch (err) {
      setDistrictError(err.response?.data?.message || "Failed to load districts");
    } finally {
      setDistrictLoading(false);
    }
  };

  // ─────────────────────────────────────
  // TAB 1 — Best Mandi Search
  // ─────────────────────────────────────
  const handleMandiSearch = async (e) => {
    e.preventDefault();
    setMandiLoading(true);
    setMandiError("");
    setMandiResults(null);
    try {
      const { data } = await API.post("/market/best-mandis", {
        crop:     mandiForm.crop,
        quantity: Number(mandiForm.quantity),
        state:    mandiForm.state,
        district: mandiForm.district,
      });
      setMandiResults(data);
    } catch (err) {
      setMandiError(err.response?.data?.message || "Something went wrong");
    } finally {
      setMandiLoading(false);
    }
  };

  // ─────────────────────────────────────
  // TAB 2 — Live Prices                  ✅ FIX 4: crop+state only, no district
  // ─────────────────────────────────────
  const handleLiveFetch = async (e) => {
    e.preventDefault();
    setLiveLoading(true);
    setLiveError("");
    setLiveData(null);
    try {
      const { data } = await API.get("/market/live-prices", {
        params: { crop: liveCrop, state: liveState },   // ✅ crop not commodity, no district
      });
      setLiveData(data);
    } catch (err) {
      setLiveError(err.response?.data?.message || "Failed to fetch prices");
    } finally {
      setLiveLoading(false);
    }
  };

  // ─────────────────────────────────────
  // TAB 3 — Price Prediction
  // ─────────────────────────────────────
  const handlePredict = async (e) => {
    e.preventDefault();
    setPredLoading(true);
    setPredError("");
    setPrediction(null);
    try {
      const { data } = await API.post("/market/predict", predForm);
      setPrediction(data);
    } catch (err) {
      setPredError(err.response?.data?.message || "Prediction failed. Try again.");
    } finally {
      setPredLoading(false);
    }
  };

  // ── Render ──
  return (
    <div className="min-h-screen bg-[#f4f7f4]">

      {/* ════════════ NAVBAR ════════════ */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow">
            <span className="text-lg">🌾</span>
          </div>
          <span className="text-lg font-extrabold text-green-800 tracking-tight">AgriSense</span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {NAV_LINKS.map((l) => (
            <button
              key={l.path}
              onClick={() => navigate(l.path)}
              className={`px-4 py-2 rounded-xl transition-all duration-200
                ${l.path === "/dashboard/market"
                  ? "bg-amber-100 text-amber-800 font-semibold"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm px-4 py-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 border border-gray-200 transition"
        >
          ← Back
        </button>
      </nav>

      {/* ════════════ MAIN ════════════ */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">

        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 rounded-3xl p-8 text-white shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 blur-2xl" />
          <div className="relative z-10">
            <p className="text-amber-100 text-sm font-medium mb-1">📊 Mandi Intelligence</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Market Prices</h1>
            <p className="text-amber-100 text-sm mt-2 max-w-lg">
              Find the best mandi, browse live prices, or predict future rates with AI.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 w-fit">
          {[
            { id: "mandi",   label: "🏆 Best Mandi",      active: "bg-amber-500"   },
            { id: "live",    label: "📋 Live Prices",      active: "bg-orange-500"  },
            { id: "predict", label: "🤖 Price Prediction", active: "bg-emerald-600" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                ${activeTab === tab.id
                  ? `${tab.active} text-white shadow-md`
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════
            TAB 1 — BEST MANDI FINDER
        ════════════════════════════════ */}
        {activeTab === "mandi" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ── Form ── */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-1">🏆 Find Best Mandi</h2>
              <p className="text-gray-400 text-sm mb-6">
                Get ranked mandis with net revenue after transport costs.
              </p>

              {mandiError && (
                <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-2xl mb-4 border border-red-100">
                  ⚠️ {mandiError}
                </div>
              )}

              <form onSubmit={handleMandiSearch} className="flex flex-col gap-5">

                {/* Crop */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">🌾 Crop</label>
                  <select
                    value={mandiForm.crop}
                    onChange={(e) => setMandiForm({ ...mandiForm, crop: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50"
                  >
                    <option value="">Select crop</option>
                    {CROPS.map((c) => (
                      <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">⚖️ Quantity (quintals)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={mandiForm.quantity}
                    onChange={(e) => setMandiForm({ ...mandiForm, quantity: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">📍 State</label>
                  <select
                    value={mandiForm.state}
                    onChange={(e) => {
                      setMandiForm({ ...mandiForm, state: e.target.value, district: "" });
                      fetchDistricts(e.target.value);       // ✅ only Tab 1 calls this
                    }}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50"
                  >
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    🏘️ District
                    {districtLoading && (
                      <span className="text-xs text-amber-500 ml-2 font-normal">Loading...</span>
                    )}
                  </label>
                  <select
                    value={mandiForm.district}
                    onChange={(e) => setMandiForm({ ...mandiForm, district: e.target.value })}
                    required
                    disabled={!mandiForm.state || districtLoading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50 disabled:opacity-50"
                  >
                    <option value="">
                      {districtLoading ? "Loading districts..." : "Select district"}
                    </option>
                    {mandiDistricts.map((d) => (        // ✅ FIX: mandiDistricts not districts
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {districtError && (
                    <p className="text-xs text-red-500 mt-1.5">⚠️ {districtError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={mandiLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 shadow-md transition-all duration-200"
                >
                  {mandiLoading ? "⏳ Finding mandis..." : "🏆 Find Best Mandi →"}
                </button>
              </form>
            </div>

            {/* ── Results ── */}
            <div className="flex flex-col gap-4">

              {!mandiResults && !mandiLoading && (
                <div className="w-full bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-dashed border-amber-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[420px]">
                  <div className="text-6xl mb-4">🏪</div>
                  <h3 className="text-lg font-bold text-gray-700">Best Mandis Will Appear Here</h3>
                  <p className="text-gray-400 text-sm mt-2 max-w-xs">
                    Fill the form to see ranked mandis with estimated net revenue.
                  </p>
                </div>
              )}

              {mandiLoading && (
                <div className="w-full bg-white border border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[420px] shadow-sm">
                  <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-6" />
                  <p className="text-gray-600 font-semibold">Finding best mandis...</p>
                  <p className="text-gray-400 text-sm mt-1">Calculating net revenues</p>
                </div>
              )}

              {mandiResults && !mandiLoading && (
                <div className="flex flex-col gap-4">

                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl px-5 py-3 text-white flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      🌾 {mandiResults.crop} · {mandiResults.quantity} qtl · {mandiResults.district}, {mandiResults.state}
                    </span>
                    <span className="text-amber-100 text-xs">
                      {mandiResults.mandis.length} mandis found
                    </span>
                  </div>

                  {mandiResults.mandis.map((m, i) => (
                    <div
                      key={i}
                      className={`bg-white rounded-2xl p-5 shadow-sm border transition-all duration-200 hover:shadow-md
                        ${m.isBest ? "border-amber-300 ring-2 ring-amber-200" : "border-gray-100"}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm
                            ${i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : "bg-orange-300"}`}>
                            #{i + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{m.name}</h3>
                            <p className="text-xs text-gray-400">
                              {m.district}{m.date && ` · ${m.date}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {m.isBest && (
                            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                              🏆 BEST DEAL
                            </span>
                          )}
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                            ${m.isRealData ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {m.isRealData ? "🟢 Live" : "🟡 Mock"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-blue-50 rounded-xl py-2.5">
                          <p className="text-xs text-gray-400">Price/qtl</p>
                          <p className="font-bold text-blue-600 text-sm">₹{m.pricePerUnit}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl py-2.5">
                          <p className="text-xs text-gray-400">Transport</p>
                          <p className="font-bold text-red-400 text-sm">-₹{m.transportCost.toLocaleString()}</p>
                        </div>
                        <div className={`rounded-xl py-2.5 ${m.isBest ? "bg-amber-50" : "bg-emerald-50"}`}>
                          <p className="text-xs text-gray-400">Net Revenue</p>
                          <p className={`font-bold text-sm ${m.isBest ? "text-amber-600" : "text-emerald-600"}`}>
                            ₹{m.netRevenue.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 text-center">
                        <p className="text-xs text-gray-400">
                          Gross: <span className="text-gray-600 font-semibold">₹{m.grossRevenue.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setMandiResults(null)}
                    className="w-full py-2.5 text-sm font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-2xl transition"
                  >
                    🔄 Search Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            TAB 2 — LIVE PRICES
        ════════════════════════════════ */}
        {activeTab === "live" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ── Form ── */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-1">📋 Live Mandi Prices</h2>
              <p className="text-gray-400 text-sm mb-6">
                Today's prices from TodayPriceRates {/* ✅ FIX 5: correct source */}
              </p>

              {liveError && (
                <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-2xl mb-4 border border-red-100">
                  ⚠️ {liveError}
                </div>
              )}

              {/* ✅ FIX 6: Only crop + state — NO district */}
              <form onSubmit={handleLiveFetch} className="flex flex-col gap-5">

                {/* Crop */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">🌾 Crop</label>
                  <select
                    value={liveCrop}
                    onChange={(e) => setLiveCrop(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
                  >
                    <option value="">Select crop</option>
                    {CROPS.map((c) => (
                      <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* State */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">📍 State</label>
                  <select
                    value={liveState}
                    onChange={(e) => setLiveState(e.target.value)}  // ✅ no fetchDistricts here
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
                  >
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={liveLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 shadow-md transition-all duration-200"
                >
                  {liveLoading ? "⏳ Fetching..." : "📋 Get Live Prices →"}
                </button>
              </form>
            </div>

            {/* ── Results ── */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px]">

              {!liveData && !liveLoading && (
                <div className="w-full bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-dashed border-orange-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-bold text-gray-700">Live Prices Will Appear Here</h3>
                  <p className="text-gray-400 text-sm mt-2">Select crop + state</p> {/* ✅ FIX 7 */}
                </div>
              )}

              {liveLoading && (
                <div className="w-full bg-white rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-6" />
                  <p className="text-gray-600 font-semibold">Fetching today's prices...</p> {/* ✅ FIX 8 */}
                </div>
              )}

              {liveData && !liveLoading && (
                <div className="flex flex-col gap-3">

                  {/* Summary */}
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl px-5 py-3 text-white grid grid-cols-3 text-center">
                    <div>
                      <p className="text-xs text-orange-100">Avg Modal</p>
                      <p className="font-bold">₹{liveData.avgModal}</p>
                    </div>
                    <div>
                      <p className="text-xs text-orange-100">Min</p>
                      <p className="font-bold">₹{liveData.minPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-orange-100">Max</p>
                      <p className="font-bold">₹{liveData.maxPrice}</p>
                    </div>
                  </div>

                  {/* ✅ FIX 9: correct fields from scraper response */}
                  {liveData.markets.map((m, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{m.commodity}</p>  {/* ✅ was m.market */}
                          <p className="text-xs text-gray-400">{m.state} · {m.date}</p>     {/* ✅ was m.district */}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-1 rounded-full">
                            🔵 Today
                          </span>
                          {/* ✅ FIX 10: show trend badge */}
                          {m.trend && m.priceChange && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                              ${m.trend === "down" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                              {m.trend === "down" ? "▼" : "▲"} {m.priceChange}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-red-50 rounded-xl py-1.5">
                          <p className="text-xs text-gray-400">Min</p>
                          <p className="font-bold text-red-500 text-sm">₹{m.minPrice}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl py-1.5 border-2 border-emerald-200">
                          <p className="text-xs text-gray-400">Modal</p>
                          <p className="font-bold text-emerald-600 text-sm">₹{m.modalPrice}</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl py-1.5">
                          <p className="text-xs text-gray-400">Max</p>
                          <p className="font-bold text-blue-500 text-sm">₹{m.maxPrice}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setLiveData(null)}
                    className="w-full py-2.5 text-sm font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-2xl transition"
                  >
                    🔄 Search Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            TAB 3 — PRICE PREDICTION
        ════════════════════════════════ */}
        {activeTab === "predict" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ── Form ── */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-1">🤖 AI Price Prediction</h2>
              <p className="text-gray-400 text-sm mb-6">
                ML model predicts the best price to sell your crop.
              </p>

              {predError && (
                <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-2xl mb-4 border border-red-100">
                  ⚠️ {predError}
                </div>
              )}

              <form onSubmit={handlePredict} className="flex flex-col gap-5">

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">🌾 Crop</label>
                  <select
                    value={predForm.crop}
                    onChange={(e) => setPredForm({ ...predForm, crop: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
                  >
                    <option value="">Select crop</option>
                    {CROPS.map((c) => (
                      <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">📍 State</label>
                  <select
                    value={predForm.state}
                    onChange={(e) => setPredForm({ ...predForm, state: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
                  >
                    <option value="">Select state</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">🗓️ Season</label>
                    <select
                      value={predForm.season}
                      onChange={(e) => setPredForm({ ...predForm, season: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
                    >
                      <option value="">Season</option>
                      {SEASONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">📅 Year</label>
                    <input
                      type="number"
                      value={predForm.year}
                      onChange={(e) => setPredForm({ ...predForm, year: e.target.value })}
                      min="2024"
                      max="2030"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-gray-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={predLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 shadow-md transition-all duration-200"
                >
                  {predLoading ? "⏳ Predicting..." : "🤖 Predict Price →"}
                </button>
              </form>
            </div>

            {/* ── Result ── */}
            <div className="flex items-start">

              {!prediction && !predLoading && (
                <div className="w-full bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-dashed border-emerald-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[420px]">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-bold text-gray-700">Prediction Will Appear Here</h3>
                  <p className="text-gray-400 text-sm mt-2 max-w-xs">
                    Fill the form to get an AI-powered price forecast.
                  </p>
                </div>
              )}

              {predLoading && (
                <div className="w-full bg-white border border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[420px] shadow-sm">
                  <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-6" />
                  <p className="text-gray-600 font-semibold">ML model is working...</p>
                </div>
              )}

              {prediction && !predLoading && (
                <div className="w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl flex items-center justify-center text-2xl shadow">
                      {CROPS.find((c) => c.name === predForm.crop)?.icon || "🌾"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{predForm.crop}</h3>
                      <p className="text-gray-400 text-xs">
                        {predForm.state} · {predForm.season} {predForm.year}
                      </p>
                    </div>
                    <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-full">
                      AI Predicted
                    </span>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5 text-center">
                    <p className="text-sm text-gray-500 mb-1">Predicted Modal Price</p>
                    <p className="text-5xl font-extrabold text-emerald-600">
                      ₹{prediction.predicted_price}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      per {CROPS.find((c) => c.name === predForm.crop)?.unit}
                    </p>
                  </div>

                  {prediction.confidence && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">Confidence</p>
                        <p className="text-xl font-bold text-blue-600">{prediction.confidence}%</p>
                      </div>
                      <div className="bg-amber-50 rounded-2xl p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">Price Range</p>
                        <p className="text-sm font-bold text-amber-600">
                          ₹{prediction.min_price} – ₹{prediction.max_price}
                        </p>
                      </div>
                    </div>
                  )}

                  {prediction.advice && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                      <p className="text-xs font-semibold text-yellow-700 mb-1">💡 Market Advice</p>
                      <p className="text-sm text-gray-600">{prediction.advice}</p>
                    </div>
                  )}

                  <button
                    onClick={() => setPrediction(null)}
                    className="w-full py-2.5 text-sm font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-2xl transition"
                  >
                    🔄 Try Another Crop
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ FIX 11: correct footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          🌾 AgriSense · Mandi data: Agmarknet · Live prices: TodayPriceRates · © {new Date().getFullYear()}
        </p>

      </main>
    </div>
  );
};

export default Market;

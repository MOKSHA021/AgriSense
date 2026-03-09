import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import MandiForm from "../components/market/MandiForm";
import MandiCard from "../components/market/MandiCard";
import MandiMap from "../components/market/MandiMap";
import LocationSearchBox from "../components/market/LocationSearchBox";
import LivePrices from "../components/market/LivePrices.jsx";
import PricePrediction from "../components/market/PricePrediction";
import { NAV_LINKS, COST_PER_KM_PER_TONNE } from "../components/market/constants";

const Market = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mandi");

  // ── Districts ──
  const [mandiDistricts, setMandiDistricts] = useState([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [districtError, setDistrictError] = useState("");

  // ── Form ──
  const [mandiForm, setMandiForm] = useState({ crop: "", quantity: "", state: "", district: "" });
  const [mandiResults, setMandiResults] = useState(null);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [mandiError, setMandiError] = useState("");

  // ── Map ──
  const [farmerLocation, setFarmerLocation] = useState([17.6868, 83.2185]);
  const [farmerAddress, setFarmerAddress] = useState("");
  const [mandiLocation, setMandiLocation] = useState(null);   // red pin
  const [selectedMandi, setSelectedMandi] = useState(null);
  const [clickMode, setClickMode] = useState(null);           // "farmer" | "mandi" | null
  const [flyTarget, setFlyTarget] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  // ── Auto-detect farmer location ──
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setFarmerLocation(coords);
        setFlyTarget(coords);
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`,
          { headers: { "User-Agent": "AgriSense/1.0" } }
        )
          .then((r) => r.json())
          .then((d) => setFarmerAddress(d.display_name?.split(",").slice(0, 3).join(", ")))
          .catch(() => {});
      },
      () => {}
    );
  }, []);

  const fetchDistricts = async (state) => {
    if (!state) return;
    setDistrictLoading(true);
    setMandiDistricts([]);
    setDistrictError("");
    try {
      const { data } = await API.get("/market/districts", { params: { state } });
      setMandiDistricts(data.districts);
    } catch (err) {
      setDistrictError(err.response?.data?.message || "Failed to load districts");
    } finally {
      setDistrictLoading(false);
    }
  };

  const handleMandiSearch = async (e) => {
    e.preventDefault();
    setMandiLoading(true);
    setMandiError("");
    setMandiResults(null);
    setSelectedMandi(null);
    setMandiLocation(null);
    setRouteInfo(null);
    setShowRoute(false);
    try {
      const { data } = await API.post("/market/best-mandis", {
        ...mandiForm,
        quantity: Number(mandiForm.quantity),
        farmerLat: farmerLocation[0],
        farmerLng: farmerLocation[1],
      });
      setMandiResults(data);
    } catch (err) {
      setMandiError(err.response?.data?.message || "Something went wrong");
    } finally {
      setMandiLoading(false);
    }
  };

  // ── KEY: Clicking a card sets the red pin ──
  const handleSelectMandi = useCallback((mandi) => {
    setSelectedMandi(mandi);
    setRouteInfo(null);
    setShowRoute(false);
    if (mandi.lat && mandi.lng) {
      const coords = [mandi.lat, mandi.lng];
      setMandiLocation(coords);   // 🔴 drops red pin
      setFlyTarget(coords);       // 🗺️ flies map to mandi
    }
  }, []);

  // ── Map click (for manual pins) ──
  const handleMapClick = useCallback((coords) => {
    if (clickMode === "farmer") {
      setFarmerLocation(coords);
      setFarmerAddress(`${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
    } else if (clickMode === "mandi") {
      setMandiLocation(coords);
    }
    setClickMode(null);
  }, [clickMode]);

  // ── Route found: compute accurate transport cost ──
  const handleRouteFound = useCallback(({ distanceKm, durationMin }) => {
    const tonnes = (Number(mandiForm.quantity) || 1) * 0.1;
    const transportCost = Math.round(distanceKm * tonnes * COST_PER_KM_PER_TONNE);
    setRouteInfo({ distanceKm, durationMin, transportCost });
  }, [mandiForm.quantity]);

  return (
    <div className="min-h-screen bg-[#f4f7f4]">
      {/* ── Navbar ── */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
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
              className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                l.path === "/dashboard/market"
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

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Hero */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 rounded-3xl p-8 text-white shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
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
            { id: "mandi", label: "🏆 Best Mandi", active: "bg-amber-500" },
            { id: "live", label: "📋 Live Prices", active: "bg-orange-500" },
            { id: "predict", label: "🤖 Price Prediction", active: "bg-emerald-600" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? `${tab.active} text-white shadow-md`
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: Best Mandi ── */}
        {activeTab === "mandi" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Form */}
            <MandiForm
              mandiForm={mandiForm}
              setMandiForm={setMandiForm}
              mandiDistricts={mandiDistricts}
              districtLoading={districtLoading}
              districtError={districtError}
              mandiError={mandiError}
              mandiLoading={mandiLoading}
              farmerLocation={farmerLocation}
              farmerAddress={farmerAddress}
              clickMode={clickMode}
              setClickMode={setClickMode}
              onFarmerSearch={(coords, name) => {
                setFarmerLocation(coords);
                setFarmerAddress(name.split(",").slice(0, 3).join(", "));
                setFlyTarget(coords);
              }}
              onMandiSearch={(coords) => {
                setMandiLocation(coords);
                setFlyTarget(coords);
              }}
              onSubmit={handleMandiSearch}
              fetchDistricts={fetchDistricts}
            />

            {/* Right: Results + Map */}
            <div className="flex flex-col gap-6">
              {/* Mandi Result Cards */}
              {mandiResults && !mandiLoading && (
                <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-1">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl px-5 py-3 text-white flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      🌾 {mandiResults.crop} · {mandiResults.quantity} qtl · {mandiResults.district}, {mandiResults.state}
                    </span>
                    <span className="text-amber-100 text-xs">{mandiResults.mandis.length} mandis found</span>
                  </div>
                  {mandiResults.mandis.slice(0, 5).map((m, i) => (
                    <MandiCard
                      key={i}
                      mandi={m}
                      index={i}
                      isSelected={selectedMandi?.name === m.name}
                      routeInfo={routeInfo}
                      onSelect={handleSelectMandi}     // ← drops red pin
                      onShowRoute={() => setShowRoute(true)}
                    />
                  ))}
                </div>
              )}

              {/* Map */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">🗺️ Map</label>
                  {clickMode && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full animate-pulse">
                      🖱️ Click map to set {clickMode === "farmer" ? "farm" : "mandi"} location
                    </span>
                  )}
                </div>

                <MandiMap
                  farmerLocation={farmerLocation}
                  farmerAddress={farmerAddress}
                  mandiLocation={mandiLocation}     // 🔴 red pin
                  selectedMandi={selectedMandi}
                  clickMode={clickMode}
                  onMapClick={handleMapClick}
                  flyTarget={flyTarget}
                  showRoute={showRoute}
                  onRouteFound={handleRouteFound}
                  onFarmerMove={() => setClickMode("farmer")}
                />

                {/* Route Info Card */}
                {routeInfo && (
                  <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <h4 className="text-sm font-bold text-amber-800 mb-2">🛣️ Route Summary</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white rounded-xl p-2 shadow-sm">
                        <p className="text-xs text-gray-400">Distance</p>
                        <p className="font-bold text-blue-600">{routeInfo.distanceKm} km</p>
                      </div>
                      <div className="bg-white rounded-xl p-2 shadow-sm">
                        <p className="text-xs text-gray-400">Est. Time</p>
                        <p className="font-bold text-emerald-600">~{routeInfo.durationMin} min</p>
                      </div>
                      <div className="bg-white rounded-xl p-2 shadow-sm">
                        <p className="text-xs text-gray-400">Transport</p>
                        <p className="font-bold text-red-500">₹{routeInfo.transportCost.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "live" && <LivePrices />}
        {activeTab === "predict" && <PricePrediction />}

        <p className="text-center text-xs text-gray-400 pb-4">
          🌾 AgriSense · Mandi data: Agmarknet · © {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
};

export default Market;

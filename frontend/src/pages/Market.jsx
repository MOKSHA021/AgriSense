import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";
import MandiForm from "../components/market/MandiForm";
import MandiCard from "../components/market/MandiCard";
import MandiMap from "../components/market/MandiMap";
import LivePrices from "../components/market/LivePrices.jsx";
import PricePrediction from "../components/market/PricePrediction";

// ── Geocode mandi name → lat/lng via Nominatim ──
const geocodeMandi = async (mandiName, district, state) => {
  try {
    const query = `${mandiName}, ${district}, ${state}, India`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { "User-Agent": "AgriSense/1.0" } }
    );
    const data = await res.json();
    if (data.length) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    return null;
  } catch {
    return null;
  }
};

const Market = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mandi");

  // ── Districts ──
  const [mandiDistricts, setMandiDistricts] = useState([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [districtError, setDistrictError] = useState("");

  // ── Form ──
  const [mandiForm, setMandiForm] = useState({
    crop: "", quantity: "", state: "", district: "",
  });
  const [mandiResults, setMandiResults] = useState(null);
  const [mandiLoading, setMandiLoading] = useState(false);
  const [mandiError, setMandiError] = useState("");

  // ── Map ──
  const [farmerLocation, setFarmerLocation] = useState([17.6868, 83.2185]);
  const [farmerAddress, setFarmerAddress] = useState("");
  const [mandiLocation, setMandiLocation] = useState(null);
  const [selectedMandi, setSelectedMandi] = useState(null);
  const [clickMode, setClickMode] = useState(null);
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

  // ── Fetch districts ──
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

  // ── Best mandi search + background geocoding ──
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
      });

      // Step 1: Show cards immediately
      setMandiResults(data);
      setMandiLoading(false);

      // Step 2: Geocode all mandis silently in background
      const geocoded = await Promise.all(
        data.mandis.map(async (m) => {
          if (m.lat && m.lng) return m;
          const coords = await geocodeMandi(m.name, m.district, data.state);
          return coords ? { ...m, lat: coords.lat, lng: coords.lng } : m;
        })
      );
      setMandiResults({ ...data, mandis: geocoded });

    } catch (err) {
      setMandiError(err.response?.data?.message || "Something went wrong");
      setMandiLoading(false);
    } finally {
      setMandiLoading(false);
    }
  };

  // ── Click card → geocoded pin drops on map ──
  const handleSelectMandi = useCallback((mandi) => {
    setSelectedMandi(mandi);
    setRouteInfo(null);
    setShowRoute(false);
    if (mandi.lat && mandi.lng) {
      const coords = [mandi.lat, mandi.lng];
      setMandiLocation(coords);
      setFlyTarget(coords);
    }
  }, []);

  // ── Map click for manual pins ──
  const handleMapClick = useCallback((coords) => {
    if (clickMode === "farmer") {
      setFarmerLocation(coords);
      setFarmerAddress(`${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
    } else if (clickMode === "mandi") {
      setMandiLocation(coords);
    }
    setClickMode(null);
  }, [clickMode]);

  // ── Route found → real road cost ──
  const handleRouteFound = useCallback(
    ({ distanceKm, durationMin, totalCost, breakdown, truckType }) => {
      setRouteInfo({ distanceKm, durationMin, totalCost, breakdown, truckType });
    },
    []
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Market Prices</h1>
          <p className="text-gray-400 text-sm mt-1">
            Find the best mandi, browse live prices, or predict future rates.
          </p>
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

        {/* ════════ TAB 1 — BEST MANDI ════════ */}
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

              {/* Loading skeleton */}
              {mandiLoading && (
                <div className="flex flex-col gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                      <div className="flex gap-3 mb-4">
                        <div className="w-9 h-9 bg-gray-200 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/2" />
                          <div className="h-3 bg-gray-100 rounded w-1/3" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="h-12 bg-gray-100 rounded-xl" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Mandi Result Cards */}
              {mandiResults && !mandiLoading && (
                <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto pr-1">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl px-5 py-3 text-white flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      🌾 {mandiResults.crop} · {mandiResults.quantity} qtl · {mandiResults.district}, {mandiResults.state}
                    </span>
                    <span className="text-amber-100 text-xs">
                      {mandiResults.mandis.length} mandis found
                    </span>
                  </div>

                  {mandiResults.mandis.slice(0, 5).map((m, i) => (
                    <MandiCard
                      key={i}
                      mandi={m}
                      index={i}
                      quantity={Number(mandiForm.quantity)}
                      isSelected={selectedMandi?.name === m.name}
                      routeInfo={routeInfo}
                      onSelect={handleSelectMandi}
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
                  mandiLocation={mandiLocation}
                  selectedMandi={selectedMandi}
                  clickMode={clickMode}
                  onMapClick={handleMapClick}
                  flyTarget={flyTarget}
                  showRoute={showRoute}
                  quantity={Number(mandiForm.quantity) || 1}
                  onRouteFound={handleRouteFound}
                  onFarmerMove={() => setClickMode("farmer")}
                />

                {/* Route Info Card */}
                {routeInfo && (
                  <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <h4 className="text-sm font-bold text-amber-800 mb-3">🛣️ Route Summary</h4>

                    <div className="grid grid-cols-3 gap-3 text-center mb-3">
                      <div className="bg-white rounded-xl p-2 shadow-sm">
                        <p className="text-xs text-gray-400">Distance</p>
                        <p className="font-bold text-blue-600">{routeInfo.distanceKm} km</p>
                      </div>
                      <div className="bg-white rounded-xl p-2 shadow-sm">
                        <p className="text-xs text-gray-400">Est. Time</p>
                        <p className="font-bold text-emerald-600">~{routeInfo.durationMin} min</p>
                      </div>
                      <div className="bg-white rounded-xl p-2 shadow-sm">
                        <p className="text-xs text-gray-400">Total Cost</p>
                        <p className="font-bold text-red-500">
                          ₹{routeInfo.totalCost?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-orange-50 rounded-xl py-2">
                        <p className="text-gray-400">Fuel</p>
                        <p className="font-semibold text-orange-600">
                          ₹{routeInfo.breakdown?.fuelCost?.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-xl py-2">
                        <p className="text-gray-400">Toll</p>
                        <p className="font-semibold text-purple-600">
                          ₹{routeInfo.breakdown?.tollCost?.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl py-2">
                        <p className="text-gray-400">Loading</p>
                        <p className="font-semibold text-gray-600">
                          ₹{routeInfo.breakdown?.loadingCost?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 text-center mt-2">
                      🚛 {routeInfo.truckType} truck · based on real road distance
                    </p>
                  </div>
                )}

                {/* Selected mandi label */}
                {selectedMandi && (
                  <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                    <p className="text-sm font-semibold text-emerald-800">
                      ✅ Selected: <span className="font-bold">{selectedMandi.name}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════ TAB 2 — LIVE PRICES ════════ */}
        {activeTab === "live" && <LivePrices />}

        {/* ════════ TAB 3 — PRICE PREDICTION ════════ */}
        {activeTab === "predict" && <PricePrediction />}

        <p className="text-center text-xs text-gray-400 pb-4">
          🌾 AgriSense · Mandi data: Agmarknet · © {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
};

export default Market;

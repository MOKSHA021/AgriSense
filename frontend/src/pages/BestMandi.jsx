import { useState, useEffect, useCallback } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import MandiForm from "../components/market/MandiForm";
import MandiCard from "../components/market/MandiCard";
import MandiMap from "../components/market/MandiMap";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Loader2 } from "lucide-react";

// ── Geocode mandi name → lat/lng via Nominatim ──
const geocodeMandi = async (mandiName, district, state) => {
  try {
    const query = `${mandiName}, ${district}, ${state}, India`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      { headers: { "Accept-Language": "en-US,en;q=0.9" } }
    );
    const data = await res.json();
    if (data.length) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    return null;
  } catch {
    return null;
  }
};

const BestMandi = () => {
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
          { headers: { "Accept-Language": "en-US,en;q=0.9" } }
        )
          .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
          .then((d) => setFarmerAddress(d.display_name?.split(",").slice(0, 3).join(", ") || "Hyderabad"))
          .catch(() => { setFarmerAddress("Hyderabad") });
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
    if (mandi.lat && mandi.lng) {
      const coords = [mandi.lat, mandi.lng];
      setMandiLocation(coords);
      setFlyTarget(coords);
      setShowRoute(true);
    } else {
      setShowRoute(false);
    }
  }, []);

  // ── Map click for manual pins ──
  const handleMapClick = useCallback((coords) => {
    if (clickMode === "farmer") {
      setFarmerLocation(coords);
      setFarmerAddress(`${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
      setRouteInfo(null);
    } else if (clickMode === "mandi") {
      setMandiLocation(coords);
      setSelectedMandi({
        name: "Pinned Mandi",
        district: "Manual location",
        lat: coords[0],
        lng: coords[1],
        pricePerUnit: 0,
      });
      setFlyTarget(coords);
      setRouteInfo(null);
      setShowRoute(true);
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
    <div className="min-h-screen bg-[#F7F9FA] selection:bg-emerald-100">
      <Navbar />

      <main className="dashboard-main-content max-w-7xl mx-auto px-6 py-8">
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4 pt-4"
        >
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
            <Map className="w-6 h-6 text-[#1E8E5A]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F6B4A] tracking-tight font-heading">Best Mandi Finder</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 font-semibold">
              Locate high-revenue market options factoring live prices and road transport mileage.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="lg:col-span-5"
          >
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
                setSelectedMandi({
                  name: "Pinned Mandi",
                  district: "Manual location",
                  lat: coords[0],
                  lng: coords[1],
                  pricePerUnit: 0,
                });
                setRouteInfo(null);
                setShowRoute(true);
              }}
              onSubmit={handleMandiSearch}
              fetchDistricts={fetchDistricts}
            />
          </motion.div>

          {/* Right: Results + Map */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="lg:col-span-7 flex flex-col gap-6"
          >
            {/* Loading skeleton */}
            {mandiLoading && (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 animate-pulse">
                    <div className="flex gap-3 mb-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-1/2" />
                        <div className="h-3 bg-slate-50 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-12 bg-slate-50 rounded-xl" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mandi Result Cards */}
            {mandiResults && !mandiLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2"
              >
                <div className="bg-[#1E8E5A] rounded-2xl px-6 py-4 text-white flex items-center justify-between shadow-sm">
                  <span className="font-bold text-xs tracking-tight">
                    🌾 {mandiResults.crop} · {mandiResults.quantity} qtl · {mandiResults.district}, {mandiResults.state}
                  </span>
                  <span className="text-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                    {mandiResults.mandis.length} Mandis Available
                  </span>
                </div>

                <AnimatePresence>
                  {mandiResults.mandis.slice(0, 5).map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <MandiCard
                        mandi={m}
                        index={i}
                        quantity={Number(mandiForm.quantity)}
                        isSelected={selectedMandi?.name === m.name}
                        routeInfo={routeInfo}
                        onSelect={handleSelectMandi}
                        onShowRoute={() => setShowRoute(true)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Map wrapper */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Map className="w-4 h-4 text-[#1E8E5A]" /> Map Projection
                </label>
                {clickMode && (
                  <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-[#0F6B4A] px-3.5 py-1.5 rounded-full animate-pulse font-bold tracking-wide">
                    🖱️ Click map to pin {clickMode === "farmer" ? "farm" : "mandi"}
                  </span>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-200 relative z-0 shadow-inner">
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
              </div>

              {/* Route Info Card */}
              <AnimatePresence>
                {routeInfo && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner overflow-hidden"
                  >
                    <h4 className="text-xs font-bold text-[#0F6B4A] uppercase tracking-widest mb-4">🛣️ Logistics Analysis</h4>

                    <div className="grid grid-cols-3 gap-3 text-center mb-4">
                      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Road Distance</p>
                        <p className="font-black text-slate-800 text-sm">{routeInfo.distanceKm} km</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Duration</p>
                        <p className="font-black text-slate-800 text-sm">~{routeInfo.durationMin} min</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1">Freight Cost</p>
                        <p className="font-black text-red-650 text-sm">
                          ₹{routeInfo.totalCost?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="bg-emerald-50 rounded-xl py-3 border border-emerald-100">
                        <p className="text-[#0F6B4A]/60 font-bold mb-1">Fuel Charge</p>
                        <p className="font-bold text-[#0F6B4A] text-xs">
                          ₹{routeInfo.breakdown?.fuelCost?.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-xl py-3 border border-blue-100">
                        <p className="text-[#2F80ED]/60 font-bold mb-1">Toll Rate</p>
                        <p className="font-bold text-[#2F80ED] text-xs">
                          ₹{routeInfo.breakdown?.tollCost?.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl py-3 border border-slate-250">
                        <p className="text-slate-400 font-bold mb-1">Labor/Load</p>
                        <p className="font-bold text-slate-600 text-xs">
                          ₹{routeInfo.breakdown?.loadingCost?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 text-center mt-4 uppercase tracking-widest">
                      🚛 {routeInfo.truckType} truck · real-road routing computation
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Mandi confirm label */}
              {selectedMandi && (
                <div className="mt-4 p-4 bg-[#E6F5EE] border border-emerald-200/50 rounded-2xl text-center">
                  <p className="text-xs font-bold text-[#0F6B4A]">
                    ✅ Active Target Market: <span className="font-black text-[#0F6B4A]">{selectedMandi.name}</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <p className="text-center text-[10px] text-slate-400 pb-4 mt-12 font-bold uppercase tracking-widest">
          🌾 AgriSense Logistics Core · Calculations via OpenRouteService API
        </p>
      </main>
    </div>
  );
};

export default BestMandi;

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef as useRefHook } from "react";
import API from "../../services/api";
import DashboardNavbar from "../../components/layout/DashboardNavbar";
import MandiForm from "../../components/market/MandiForm";
import MandiCard from "../../components/market/MandiCard";
import MandiMap from "../../components/market/MandiMap";
import { Map, Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "../../translations";

// ── Geocoding is now handled by the backend API ──
const BestMandi = () => {
  const { t } = useTranslation();
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const headerRef = useRefHook(null);
  const contentRef = useRefHook(null);
  
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });
  const contentInView = useInView(contentRef, { once: true, amount: 0.3 });

  // ── Auto-detect farmer location ──
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setFarmerLocation(coords);
        setFlyTarget(coords);
        API.get('/weather/farm-forecast', { params: { lat: coords[0], lon: coords[1] } })
          .then((r) => {
            const data = r.data.raw;
            const displayName = r.data.location?.displayName || data.address?.city || data.address?.town || "Hyderabad";
            setFarmerAddress(displayName);
          })
          .catch(() => { setFarmerAddress("Hyderabad") });
      },
      () => { },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
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

      // Since the backend now geocodes and caches coordinates natively, 
      // the data returned is instantly ready for mapping!

    } catch (err) {
      setMandiError(err.response?.data?.message || "Something went wrong");
      setMandiLoading(false);
    } finally {
      setMandiLoading(false);
    }
  };

  // ── Click card → geocoded pin drops on map ──
  const handleSelectMandi = useCallback(async (mandi) => {
    setSelectedMandi(mandi);
    setRouteInfo(null);
    // Reset route display so RoutingMachine unmounts cleanly
    setShowRoute(false);

    if (mandi.lat && mandi.lng) {
      const coords = [mandi.lat, mandi.lng];
      setMandiLocation(coords);
      setFlyTarget(coords);
      setTimeout(() => setShowRoute(true), 0);
    } else {
      console.warn("Mandi coordinates not found in backend data");
    }
  }, [mandiForm.state]);

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
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0F4C3A] via-[#0F6B4A] to-[#124230] py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80')] bg-cover bg-center opacity-10" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-teal-500/15 border border-teal-500/30 text-teal-400 text-[11px] font-bold px-4 py-2 rounded-full tracking-widest uppercase">
                  <Map className="w-4 h-4" />
                  {t('mandi.geospatialAI')}
                </div>

                <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight font-heading">
                  {t('mandi.title')}
                  <span className="block text-[#2BB673] mt-2">{t('mandi.subtitle')}</span>
                </h1>

                <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-lg">
                  {t('mandi.description')}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden lg:flex justify-center"
              >
                <div className="w-full max-w-md bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center">
                        <Map className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{t('mandi.geospatialAI')}</h3>
                        <p className="text-white/60 text-sm">{t('mandi.marketOptimization')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{t('mandi.marketsCount')}</p>
                        <p className="text-white text-3xl font-black font-heading">500+</p>
                      </div>
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{t('mandi.statesCount')}</p>
                        <p className="text-white text-3xl font-black font-heading">All</p>
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#2BB673]" />
                      <p className="text-white/80 text-sm">{t('mandi.transportCostOptimization')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-7xl mx-auto px-6 md:px-16 py-12">
          {/* Header */}
          <div ref={headerRef} className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-200">
                  <Map className="w-6 h-6 text-teal-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 font-heading">{t('mandi.pageTitle') || t('dashboard.features.mandiTitle') || "Best Mandi Finder"}</h1>
                  <p className="text-sm text-slate-500">{t('mandi.pageDesc') || t('dashboard.features.mandiDesc')}</p>
                </div>
              </div>
            </motion.div>
          </div>

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
                  <div key={i} className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-6 border border-white/5 animate-pulse">
                    <div className="flex gap-3 mb-4">
                      <div className="w-10 h-10 bg-white/10 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/10 rounded w-1/2" />
                        <div className="h-3 bg-white/5 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="h-12 bg-white/5 rounded-xl" />
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
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2rem] px-6 py-4 text-white flex items-center justify-between shadow-xl">
                  <span className="font-bold text-sm tracking-tight">
                    🌾 {mandiResults.crop} · {mandiResults.quantity} qtl · {mandiResults.district}, {mandiResults.state}
                  </span>
                  <span className="text-amber-100 text-xs font-bold uppercase tracking-wider">
                    {mandiResults.mandis.length} {t('mandi.mandis')}
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

            {/* Map */}
            <div className="bg-white/[0.02] backdrop-blur-2xl rounded-3xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Map className="w-4 h-4 text-teal-400" /> {t('mandi.mapView')}
                </label>
                {clickMode && (
                  <span className="text-xs bg-teal-500/10 border border-teal-500/20 text-teal-400 px-3 py-1.5 rounded-full animate-pulse font-bold tracking-wide">
                    {clickMode === "farmer" ? t('mandi.clickMapFarm') : t('mandi.clickMapMandi')}
                  </span>
                )}
              </div>

              <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative z-0">
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
                    className="mt-4 p-5 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden"
                  >
                    <h4 className="text-sm font-bold text-amber-400 mb-4 tracking-tight">{t('mandi.routeSummary')}</h4>

                    <div className="grid grid-cols-3 gap-3 text-center mb-4">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">{t('mandi.distance')}</p>
                        <p className="font-bold text-blue-400 text-base">{routeInfo.distanceKm} km</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">{t('mandi.estTime')}</p>
                        <p className="font-bold text-emerald-400 text-base">~{routeInfo.durationMin} min</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">{t('mandi.totalCost')}</p>
                        <p className="font-bold text-red-400 text-base">
                          ₹{routeInfo.totalCost?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="bg-orange-500/10 rounded-xl py-3 border border-orange-500/10">
                        <p className="text-white/40 font-bold mb-1">{t('mandi.fuel')}</p>
                        <p className="font-bold text-orange-400 text-sm">
                          ₹{routeInfo.breakdown?.fuelCost?.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-purple-500/10 rounded-xl py-3 border border-purple-500/10">
                        <p className="text-white/40 font-bold mb-1">{t('mandi.toll')}</p>
                        <p className="font-bold text-purple-400 text-sm">
                          ₹{routeInfo.breakdown?.tollCost?.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl py-3 border border-white/5">
                        <p className="text-white/40 font-bold mb-1">{t('mandi.loading')}</p>
                        <p className="font-bold text-white/60 text-sm">
                          ₹{routeInfo.breakdown?.loadingCost?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-white/40 text-center mt-4 font-medium">
                      🚛 {routeInfo.truckType} {t('mandi.truckTypeNote')}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected mandi label */}
              {selectedMandi && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                  <p className="text-sm font-semibold text-emerald-400">
                    {t('mandi.selectedMandi')} <span className="font-bold text-emerald-300">{selectedMandi.name}</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <p className="text-center text-xs text-slate-400 pb-4 mt-12 font-medium">
          {t('mandi.footer')}
        </p>
        </section>
      </main>
    </div>
  );
};

export default BestMandi;

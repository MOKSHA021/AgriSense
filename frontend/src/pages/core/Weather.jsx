import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef as useRefHook } from "react";
import DashboardNavbar from "../../components/layout/DashboardNavbar";
import {
  CloudSun,
  Search,
  AlertTriangle,
  Droplets,
  Sun,
  Wind,
  Thermometer,
  Eye,
  Gauge,
  CloudRain,
  Snowflake,
  Loader,
  Navigation,
  Sparkles
} from "lucide-react";
import { useTranslation } from "../../translations";

import API from "../../services/api";

import { 
  mapWmoToOwm, 
  getFarmingAdvice, 
  getRiskAlerts, 
  groupForecastByDay, 
  formatDay 
} from "../../components/weather/weatherHelpers";
import CurrentWeatherCard from "../../components/weather/CurrentWeatherCard";
import ForecastList from "../../components/weather/ForecastList";
import FarmingAdviceList from "../../components/weather/FarmingAdviceList";
import RiskAlertsList from "../../components/weather/RiskAlertsList";

const Weather = () => {
  const { t } = useTranslation();
  const [city, setCity] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const headerRef = useRefHook(null);
  const contentRef = useRefHook(null);
  
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 });

  const fetchWeatherByCoords = async (lat, lon, cityNameFallback = null) => {
    setLoading(true);
    setError("");
    try {
      const { data: resData } = await API.get("/weather/farm-forecast", {
        params: { lat, lon }
      });
      const data = resData.raw;

      let resolvedCityName = resData.location?.displayName || cityNameFallback;
      if (!resolvedCityName) {
        resolvedCityName = `${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
      }

      const curWeather = mapWmoToOwm(data.current.weather_code, data.current.is_day);
      const curData = {
        name: resolvedCityName,
        weather: [curWeather],
        main: {
          temp: data.current.temperature_2m,
          feels_like: data.current.apparent_temperature || data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          pressure: data.current.surface_pressure || 1013,
        },
        wind: { speed: Math.round((data.current.wind_speed_10m * 1000) / 3600 * 10) / 10 },
        visibility: 10000,
      };

      const list = [];
      if (data.hourly && data.hourly.time) {
        for (let i = 0; i < data.hourly.time.length; i += 3) {
          const timeStr = data.hourly.time[i].replace("T", " ") + ":00";
          const hourWeather = mapWmoToOwm(data.hourly.weather_code[i], 1);
          list.push({
            dt_txt: timeStr,
            main: {
              temp: data.hourly.temperature_2m[i],
              humidity: data.hourly.relative_humidity_2m[i],
            },
            wind: { speed: Math.round((data.hourly.wind_speed_10m[i] * 1000) / 3600 * 10) / 10 },
            weather: [hourWeather],
          });
        }
      }

      setCurrent(curData);
      setCity(resolvedCityName);
      setSearchInput(resolvedCityName);
      setForecast(groupForecastByDay(list));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not load weather data");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (name) => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data: resData } = await API.get("/weather/farm-forecast", {
        params: { q: name }
      });
      const data = resData.raw;
      
      const resolvedName = resData.location?.displayName || name;
      
      const curWeather = mapWmoToOwm(data.current.weather_code, data.current.is_day);
      const curData = {
        name: resolvedName,
        weather: [curWeather],
        main: {
          temp: data.current.temperature_2m,
          feels_like: data.current.apparent_temperature || data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          pressure: data.current.surface_pressure || 1013,
        },
        wind: { speed: Math.round((data.current.wind_speed_10m * 1000) / 3600 * 10) / 10 },
        visibility: 10000,
      };

      const list = [];
      if (data.hourly && data.hourly.time) {
        for (let i = 0; i < data.hourly.time.length; i += 3) {
          const timeStr = data.hourly.time[i].replace("T", " ") + ":00";
          const hourWeather = mapWmoToOwm(data.hourly.weather_code[i], 1);
          list.push({
            dt_txt: timeStr,
            main: {
              temp: data.hourly.temperature_2m[i],
              humidity: data.hourly.relative_humidity_2m[i],
            },
            wind: { speed: Math.round((data.hourly.wind_speed_10m[i] * 1000) / 3600 * 10) / 10 },
            weather: [hourWeather],
          });
        }
      }

      setCurrent(curData);
      setCity(resolvedName);
      setSearchInput(resolvedName);
      setForecast(groupForecastByDay(list));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not load weather data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      fetchWeatherByCity("Delhi");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => fetchWeatherByCity("Delhi"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWeatherByCity(searchInput);
  };

  const advice = getFarmingAdvice(current, t);
  const riskAlerts = getRiskAlerts(current, t);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardNavbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0F4C3A] via-[#0F6B4A] to-[#124230] py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592210454359-9043f067919b?w=1920&q=80')] bg-cover bg-center opacity-10" />
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#2F80ED]/10 blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 bg-[#2F80ED]/15 border border-[#2F80ED]/30 text-[#2F80ED] text-[11px] font-bold px-4 py-2 rounded-full tracking-widest uppercase">
                  <CloudSun className="w-4 h-4" />
                  {t('weather.realTimeGPS')}
                </div>

                <h1 className="text-white text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight font-heading">
                  {t('weather.title').split(' ')[0]} {t('weather.title').split(' ')[1]}
                  <span className="block text-[#2BB673] mt-2">{t('weather.title').split(' ').slice(2).join(' ')}</span>
                </h1>

                <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-lg">
                  {t('weather.subtitle')}
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
                      <div className="w-14 h-14 bg-[#2F80ED] rounded-2xl flex items-center justify-center">
                        <CloudSun className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{t('weather.hyperLocalData')}</h3>
                        <p className="text-white/60 text-sm">{t('weather.gpsPrecisionWeather')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{t('weather.forecast')}</p>
                        <p className="text-white text-3xl font-black font-heading">5-Day</p>
                      </div>
                      <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
                        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">{t('weather.advisories')}</p>
                        <p className="text-white text-3xl font-black font-heading">Real</p>
                      </div>
                    </div>

                    <div className="bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#2BB673]" />
                      <p className="text-white/80 text-sm">{t('weather.farmingInsights')}</p>
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
                <div className="w-12 h-12 bg-[#E6F5EE] rounded-xl flex items-center justify-center border border-emerald-200">
                  <CloudSun className="w-6 h-6 text-[#1E8E5A]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 font-heading">{t('weather.pageTitle')}</h1>
                  <p className="text-sm text-slate-500">{t('weather.pageDesc')}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row items-center gap-3 mb-8"
          >
            <div className="relative flex-1 w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#1E8E5A] transition-colors" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('weather.searchCity')}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#1E8E5A] focus:border-[#1E8E5A] transition-all shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#1E8E5A] hover:bg-[#0F6B4A] text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              {t('weather.locate')}
            </button>
          </motion.form>

          <AnimatePresence>
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 border border-red-200 bg-red-50 text-red-600 text-sm font-semibold rounded-xl px-5 py-4 mb-8"
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 text-slate-500">
              <Loader className="w-10 h-10 animate-spin text-[#1E8E5A] mb-4" />
              <span className="text-sm font-semibold tracking-widest uppercase">{t('weather.fetchingAtmosphere')}</span>
            </div>
          )}

          {/* Current Weather */}
          {!loading && current && (
            <div ref={contentRef} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <CurrentWeatherCard city={city} current={current} t={t} />

                <div className="lg:col-span-7 flex flex-col gap-8">
                  <ForecastList forecast={forecast} t={t} />

                  <div className="grid sm:grid-cols-2 gap-8">
                    <RiskAlertsList riskAlerts={riskAlerts} t={t} />
                    <FarmingAdviceList advice={advice} t={t} hasRiskAlerts={riskAlerts.length > 0} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Weather;

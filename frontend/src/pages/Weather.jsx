import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef as useRefHook } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
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
import { useTranslation } from "../translations";

const mapWmoToOwm = (code, isDay = 1) => {
  const d = isDay ? 'd' : 'n';
  const map = {
    0: { id: 800, main: 'Clear', description: 'clear sky', icon: `01${d}` },
    1: { id: 801, main: 'Clouds', description: 'few clouds', icon: `02${d}` },
    2: { id: 802, main: 'Clouds', description: 'scattered clouds', icon: `03${d}` },
    3: { id: 804, main: 'Clouds', description: 'overcast clouds', icon: `04${d}` },
    45: { id: 741, main: 'Fog', description: 'fog', icon: `50${d}` },
    48: { id: 741, main: 'Fog', description: 'depositing rime fog', icon: `50${d}` },
    51: { id: 300, main: 'Drizzle', description: 'light drizzle', icon: `09${d}` },
    53: { id: 301, main: 'Drizzle', description: 'moderate drizzle', icon: `09${d}` },
    55: { id: 302, main: 'Drizzle', description: 'heavy drizzle', icon: `09${d}` },
    56: { id: 310, main: 'Drizzle', description: 'light freezing drizzle', icon: `09${d}` },
    57: { id: 312, main: 'Drizzle', description: 'dense freezing drizzle', icon: `09${d}` },
    61: { id: 500, main: 'Rain', description: 'slight rain', icon: `10${d}` },
    63: { id: 501, main: 'Rain', description: 'moderate rain', icon: `10${d}` },
    65: { id: 502, main: 'Rain', description: 'heavy rain', icon: `10${d}` },
    66: { id: 511, main: 'Rain', description: 'light freezing rain', icon: `13${d}` },
    67: { id: 511, main: 'Rain', description: 'heavy freezing rain', icon: `13${d}` },
    71: { id: 600, main: 'Snow', description: 'slight snow fall', icon: `13${d}` },
    73: { id: 601, main: 'Snow', description: 'moderate snow fall', icon: `13${d}` },
    75: { id: 602, main: 'Snow', description: 'heavy snow fall', icon: `13${d}` },
    77: { id: 611, main: 'Snow', description: 'snow grains', icon: `13${d}` },
    80: { id: 520, main: 'Rain', description: 'slight rain showers', icon: `09${d}` },
    81: { id: 521, main: 'Rain', description: 'moderate rain showers', icon: `09${d}` },
    82: { id: 522, main: 'Rain', description: 'violent rain showers', icon: `09${d}` },
    85: { id: 620, main: 'Snow', description: 'slight snow showers', icon: `13${d}` },
    86: { id: 622, main: 'Snow', description: 'heavy snow showers', icon: `13${d}` },
    95: { id: 200, main: 'Thunderstorm', description: 'thunderstorm', icon: `11${d}` },
    96: { id: 211, main: 'Thunderstorm', description: 'thunderstorm with slight hail', icon: `11${d}` },
    99: { id: 212, main: 'Thunderstorm', description: 'thunderstorm with heavy hail', icon: `11${d}` },
  };
  return map[code] || { id: 800, main: 'Clear', description: 'clear sky', icon: `01${d}` };
};

const getFarmingAdvice = (weather, t) => {
  if (!weather) return [];
  const tips = [];
  const temp = weather.main?.temp;
  const humidity = weather.main?.humidity;
  const id = weather.weather?.[0]?.id;

  if (id >= 200 && id < 300)
    tips.push({
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50 border-red-200",
      borderLeft: "border-l-4 border-l-red-500",
      text: t('weather.tips.thunderstorm'),
    });
  if (id >= 500 && id < 600)
    tips.push({
      icon: CloudRain,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      borderLeft: "border-l-4 border-l-blue-500",
      text: t('weather.tips.rain'),
    });
  if (id >= 600 && id < 700)
    tips.push({
      icon: Snowflake,
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
      borderLeft: "border-l-4 border-l-cyan-500",
      text: t('weather.tips.frost'),
    });

  if (temp > 35)
    tips.push({
      icon: Thermometer,
      color: "text-orange-600 bg-orange-50 border-orange-200",
      borderLeft: "border-l-4 border-l-orange-500",
      text: t('weather.tips.heat'),
    });
  else if (temp < 5)
    tips.push({
      icon: Snowflake,
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
      borderLeft: "border-l-4 border-l-cyan-500",
      text: t('weather.tips.cold'),
    });

  if (humidity > 80)
    tips.push({
      icon: Droplets,
      color: "text-teal-600 bg-teal-50 border-teal-200",
      borderLeft: "border-l-4 border-l-teal-500",
      text: t('weather.tips.humidity'),
    });

  if (id === 800)
    tips.push({
      icon: Sun,
      color: "text-[#2D6A4F] bg-[#EBF5EE] border-[#C3E6CB]",
      borderLeft: "border-l-4 border-l-[#2D6A4F]",
      text: t('weather.tips.clear'),
    });

  return tips;
};

const getRiskAlerts = (weather, t) => {
  if (!weather) return [];
  const alerts = [];
  const temp = weather.main?.temp;
  const id = weather.weather?.[0]?.id;
  const humidity = weather.main?.humidity;

  if (id >= 502 && id <= 531)
    alerts.push({
      icon: CloudRain,
      label: t('weather.alerts.floodLabel'),
      text: t('weather.alerts.floodDesc'),
    });
  if (temp > 40)
    alerts.push({
      icon: Thermometer,
      label: t('weather.alerts.heatLabel'),
      text: t('weather.alerts.heatDesc'),
    });
  if (id === 800 && humidity < 25)
    alerts.push({
      icon: Sun,
      label: t('weather.alerts.droughtLabel'),
      text: t('weather.alerts.droughtDesc'),
    });

  return alerts;
};

const groupForecastByDay = (list) => {
  const days = {};
  list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!days[date]) days[date] = [];
    days[date].push(item);
  });
  return Object.entries(days)
    .slice(0, 5)
    .map(([date, entries]) => {
      const temps = entries.map((e) => e.main.temp);
      const mid = entries[Math.floor(entries.length / 2)];
      return {
        date,
        tempMin: Math.round(Math.min(...temps)),
        tempMax: Math.round(Math.max(...temps)),
        icon: mid.weather[0].icon,
        desc: mid.weather[0].description,
        humidity: Math.round(
          entries.reduce((a, e) => a + e.main.humidity, 0) / entries.length
        ),
        wind:
          Math.round(
            (entries.reduce((a, e) => a + e.wind.speed, 0) / entries.length) *
              10
          ) / 10,
      };
    });
};

const formatDay = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = (d - today) / 86400000;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

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
  const contentInView = useInView(contentRef, { once: true, amount: 0.3 });

  const fetchWeatherByCoords = async (lat, lon, cityNameFallback = null) => {
    setLoading(true);
    setError("");
    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      if (!weatherRes.ok) throw new Error("Failed to fetch weather data");
      const data = await weatherRes.json();
      
      let resolvedCityName = cityNameFallback;
      if (!resolvedCityName) {
        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
            headers: {
              "Accept-Language": "en-US,en;q=0.9"
            }
          });
          if (geoRes.ok) {
            const geo = await geoRes.json();
            resolvedCityName = geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || "Hyderabad";
          } else {
            resolvedCityName = "Hyderabad";
          }
        } catch (e) {
          resolvedCityName = "Hyderabad";
        }
      }

      const curWeather = mapWmoToOwm(data.current.weather_code, data.current.is_day);
      const curData = {
        name: resolvedCityName,
        weather: [curWeather],
        main: {
          temp: data.current.temperature_2m,
          feels_like: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          pressure: data.current.surface_pressure,
        },
        wind: { speed: Math.round((data.current.wind_speed_10m * 1000) / 3600 * 10) / 10 }, // Convert km/h to m/s
        visibility: 10000,
      };

      const list = [];
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

      setCurrent(curData);
      setCity(resolvedCityName);
      setSearchInput(resolvedCityName);
      setForecast(groupForecastByDay(list));
    } catch (err) {
      setError(err.message || "Could not load weather data");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (name) => {
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en`);
      const geoData = await geoRes.json();
      if (!geoData.results?.length) throw new Error("City not found. Please check the name and try again.");
      
      const { latitude, longitude, name: resolvedName } = geoData.results[0];
      await fetchWeatherByCoords(latitude, longitude, resolvedName);
    } catch (err) {
      setError(err.message || "Could not load weather data");
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
      () => fetchWeatherByCity("Delhi")
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
                {/* Current conditions hero */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={contentInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Dark green accent top strip */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1E8E5A] to-[#2BB673] rounded-t-2xl" />

                  <div className="relative z-10 flex items-start justify-between mb-8 mt-2">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                        {city}
                      </h2>
                      <p className="text-sm font-semibold text-slate-500 capitalize mt-1">
                        {current.weather[0].description}
                      </p>
                    </div>
                    <div className="w-20 h-20 bg-[#E6F5EE] rounded-2xl flex items-center justify-center border border-emerald-200 shadow-sm">
                      <img
                        src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
                        alt={current.weather[0].description}
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                  </div>

                  <div className="relative z-10 mt-auto">
                    <p className="text-[5rem] leading-none font-bold text-slate-800 tracking-tighter mb-8">
                      {Math.round(current.main.temp)}<span className="text-slate-500 text-5xl">&deg;C</span>
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          <Thermometer className="w-3 h-3" />
                          {t('weather.feelsLike')}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{Math.round(current.main.feels_like)}&deg;C</span>
                      </div>
                      <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          <Droplets className="w-3 h-3" />
                          {t('weather.humid')}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{current.main.humidity}%</span>
                      </div>
                      <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          <Wind className="w-3 h-3" />
                          {t('weather.wind')}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{current.wind.speed} m/s</span>
                      </div>
                      <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          <Gauge className="w-3 h-3" />
                          {t('weather.press')}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{current.main.pressure} hPa</span>
                      </div>
                      <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          <Eye className="w-3 h-3" />
                          {t('weather.visibility')}
                        </div>
                        <span className="text-sm font-semibold text-slate-800">{(current.visibility / 1000).toFixed(1)} km</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <div className="lg:col-span-7 flex flex-col gap-8">
                  {/* 5-Day Forecast */}
                  {forecast.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={contentInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all"
                    >
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-2">
                        <CloudSun className="w-4 h-4 text-[#1E8E5A]" />
                        {t('weather.forecast5Day')}
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {forecast.map((day, idx) => (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={contentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                            transition={{ duration: 0.3, delay: 0.4 + (idx * 0.1) }}
                            key={day.date}
                            className="flex flex-col items-center border border-slate-200 bg-slate-50 rounded-xl p-4 transition-colors hover:bg-[#E6F5EE] hover:border-emerald-200"
                          >
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
                              {formatDay(day.date)}
                            </p>
                            <div className="w-12 h-12 flex items-center justify-center mb-2">
                              <img
                                src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                                alt={day.desc}
                                className="w-16 h-16 object-contain"
                              />
                            </div>
                            <p className="text-base font-semibold text-slate-800">
                              {day.tempMax}&deg;C
                              <span className="text-slate-500 text-xs font-medium ml-1">
                                {day.tempMin}&deg;C
                              </span>
                            </p>
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200 w-full justify-center text-[10px] font-semibold text-slate-500">
                              <span className="flex items-center gap-1">
                                <Droplets className="w-3 h-3 text-blue-400" />
                                {day.humidity}%
                              </span>
                              <span className="flex items-center gap-1">
                                <Wind className="w-3 h-3 text-slate-500" />
                                {day.wind} m/s
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-8">
                    {/* Risk Alerts */}
                    {riskAlerts.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={contentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500 rounded-l-2xl" />
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-red-600 mb-5 flex items-center gap-2 pl-2">
                          <AlertTriangle className="w-4 h-4" />
                          {t('weather.riskAlerts')}
                        </h2>
                        <ul className="space-y-3">
                          {riskAlerts.map((alert, i) => {
                            const Icon = alert.icon;
                            return (
                              <li
                                key={i}
                                className="flex flex-col gap-2 border border-red-100 rounded-xl p-4 bg-red-50"
                              >
                                <div className="flex items-center gap-2 text-red-600">
                                  <Icon className="w-4 h-4 shrink-0" />
                                  <span className="text-xs font-semibold uppercase tracking-wider">{alert.label}</span>
                                </div>
                                <p className="text-sm font-medium text-red-700">
                                  {alert.text}
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}

                    {/* Farming Advice */}
                    {advice.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={contentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden sm:col-span-1"
                        style={{ gridColumn: riskAlerts.length === 0 ? 'span 2' : undefined }}
                      >
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#1E8E5A] rounded-l-2xl" />
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1E8E5A] mb-5 flex items-center gap-2 pl-2">
                          <CloudSun className="w-4 h-4" />
                          {t('weather.farmingAdvice')}
                        </h2>
                        <ul className="space-y-3">
                          {advice.map((tip, i) => {
                            const Icon = tip.icon;
                            return (
                              <li
                                key={i}
                                className={`flex items-start gap-3 border rounded-xl p-4 ${tip.color} ${tip.borderLeft}`}
                              >
                                <div className="shrink-0 mt-0.5">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium mt-0.5">
                                  {tip.text}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </motion.div>
                    )}
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

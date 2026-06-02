import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
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
  Navigation
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const getFarmingAdvice = (weather) => {
  if (!weather) return [];
  const tips = [];
  const temp = weather.main?.temp;
  const humidity = weather.main?.humidity;
  const id = weather.weather?.[0]?.id;

  if (id >= 200 && id < 300)
    tips.push({
      icon: AlertTriangle,
      color: "text-red-400 bg-red-500/10 border-red-500/20",
      text: "Thunderstorm expected — avoid open-field work and secure livestock.",
    });
  if (id >= 500 && id < 600)
    tips.push({
      icon: CloudRain,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      text: "Rain forecasted — postpone pesticide spraying to avoid wash-off.",
    });
  if (id >= 600 && id < 700)
    tips.push({
      icon: Snowflake,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      text: "Frost risk — protect sensitive crops with mulching or row covers.",
    });

  if (temp > 35)
    tips.push({
      icon: Thermometer,
      color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
      text: "High heat — irrigate early morning or late evening to reduce evaporation.",
    });
  else if (temp < 5)
    tips.push({
      icon: Snowflake,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      text: "Cold snap — cover nurseries and avoid sowing frost-sensitive crops.",
    });

  if (humidity > 80)
    tips.push({
      icon: Droplets,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
      text: "High humidity — monitor for fungal infections like blight and mildew.",
    });

  if (id === 800)
    tips.push({
      icon: Sun,
      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      text: "Clear skies — good day for harvesting, drying, and field preparation.",
    });

  return tips;
};

const getRiskAlerts = (weather) => {
  if (!weather) return [];
  const alerts = [];
  const temp = weather.main?.temp;
  const id = weather.weather?.[0]?.id;
  const humidity = weather.main?.humidity;

  if (id >= 502 && id <= 531)
    alerts.push({
      icon: CloudRain,
      label: "Flood Risk",
      text: "Heavy rain detected. Avoid low-lying fields and ensure drainage is clear.",
    });
  if (temp > 40)
    alerts.push({
      icon: Thermometer,
      label: "Heat Stress",
      text: "Temperature exceeds 40\u00B0C. Provide shade for livestock and increase irrigation.",
    });
  if (id === 800 && humidity < 25)
    alerts.push({
      icon: Sun,
      label: "Drought Risk",
      text: "Prolonged dry and clear conditions. Monitor soil moisture levels closely.",
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
  const [city, setCity] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const advice = getFarmingAdvice(current);
  const riskAlerts = getRiskAlerts(current);

  return (
    <div className="relative min-h-screen bg-transparent text-white selection:bg-emerald-500/30">
      
      <div className="relative z-10">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
            <CloudSun className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Weather</h1>
            <p className="text-white/40 text-sm mt-1 font-medium">Real-time weather data with farming-specific advice.</p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row items-center gap-3 mb-10"
        >
          <div className="relative flex-1 w-full group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-white/30 group-focus-within:text-sky-400 transition-colors" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search city..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-sm font-medium text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all shadow-xl"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-500 text-white text-sm font-bold uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all hover:from-sky-400 hover:to-blue-400 flex items-center justify-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            Locate
          </button>
        </motion.form>

        <AnimatePresence>
          {/* Error */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-medium rounded-2xl px-5 py-4 mb-8 backdrop-blur-xl"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 text-white/40">
            <Loader className="w-10 h-10 animate-spin text-sky-500 mb-4" />
            <span className="text-sm font-medium tracking-widest uppercase">Fetching Atmosphere...</span>
          </div>
        )}

        {/* Current Weather */}
        {!loading && current && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Current conditions */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-5 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                  <CloudSun className="w-64 h-64 text-white blur-3xl mix-blend-overlay" />
                </div>
                
                <div className="relative z-10 flex items-start justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      {city}
                    </h2>
                    <p className="text-sm font-medium text-sky-400 capitalize mt-1">
                      {current.weather[0].description}
                    </p>
                  </div>
                  <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/10 shadow-xl">
                    <img
                      src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
                      alt={current.weather[0].description}
                      className="w-24 h-24 object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    />
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <p className="text-[5rem] leading-none font-black text-white tracking-tighter mb-8">
                    {Math.round(current.main.temp)}<span className="text-white/30 text-5xl">&deg;C</span>
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <Thermometer className="w-3 h-3" />
                        Feels
                      </div>
                      <span className="text-sm font-bold text-white">{Math.round(current.main.feels_like)}&deg;C</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <Droplets className="w-3 h-3" />
                        Humid
                      </div>
                      <span className="text-sm font-bold text-white">{current.main.humidity}%</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <Wind className="w-3 h-3" />
                        Wind
                      </div>
                      <span className="text-sm font-bold text-white">{current.wind.speed} m/s</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <Gauge className="w-3 h-3" />
                        Press
                      </div>
                      <span className="text-sm font-bold text-white">{current.main.pressure} hPa</span>
                    </div>
                    <div className="flex flex-col gap-1 p-3 rounded-2xl bg-white/5 border border-white/5 sm:col-span-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <Eye className="w-3 h-3" />
                        Visibility
                      </div>
                      <span className="text-sm font-bold text-white">{(current.visibility / 1000).toFixed(1)} km</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="lg:col-span-7 flex flex-col gap-8">
                {/* 5-Day Forecast */}
                {forecast.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl"
                  >
                    <h2 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-6 flex items-center gap-2">
                      <CloudSun className="w-4 h-4 text-white/40" />
                      5-Day Forecast
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {forecast.map((day, idx) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + (idx * 0.1) }}
                          key={day.date}
                          className="flex flex-col items-center border border-white/5 bg-white/[0.02] rounded-2xl p-4 transition-colors hover:bg-white/[0.05]"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400 mb-2">
                            {formatDay(day.date)}
                          </p>
                          <div className="w-12 h-12 flex items-center justify-center mb-2">
                            <img
                              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                              alt={day.desc}
                              className="w-16 h-16 object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                            />
                          </div>
                          <p className="text-base font-bold text-white">
                            {day.tempMax}&deg;C
                            <span className="text-white/30 text-xs font-medium ml-1">
                              {day.tempMin}&deg;C
                            </span>
                          </p>
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 w-full justify-center text-[10px] font-bold text-white/40">
                            <span className="flex items-center gap-1">
                              <Droplets className="w-3 h-3 text-blue-400" />
                              {day.humidity}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Wind className="w-3 h-3 text-gray-400" />
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
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="rounded-[2rem] border border-red-500/20 bg-red-500/[0.02] p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />
                      <h2 className="text-sm font-bold uppercase tracking-widest text-red-400 mb-5 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Risk Alerts
                      </h2>
                      <ul className="space-y-3 relative z-10">
                        {riskAlerts.map((alert, i) => {
                          const Icon = alert.icon;
                          return (
                            <li
                              key={i}
                              className="flex flex-col gap-2 border border-red-500/10 rounded-xl p-4 bg-red-500/[0.05]"
                            >
                              <div className="flex items-center gap-2 text-red-400">
                                <Icon className="w-4 h-4 shrink-0" />
                                <span className="text-xs font-bold uppercase tracking-wider">{alert.label}</span>
                              </div>
                              <p className="text-sm font-medium text-red-200">
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
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/[0.02] p-6 shadow-2xl backdrop-blur-2xl relative overflow-hidden sm:col-span-1"
                      style={{ gridColumn: riskAlerts.length === 0 ? 'span 2' : undefined }}
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
                      <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-5 flex items-center gap-2">
                        <CloudSun className="w-4 h-4" />
                        Farming Advice
                      </h2>
                      <ul className="space-y-3 relative z-10">
                        {advice.map((tip, i) => {
                          const Icon = tip.icon;
                          return (
                            <li
                              key={i}
                              className="flex items-start gap-3 border border-white/5 rounded-xl p-4 bg-white/[0.02]"
                            >
                              <div className={`p-2 rounded-lg border ${tip.color} shrink-0`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium text-emerald-100/70 mt-1">
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
      </main>
      </div>
    </div>
  );
};

export default Weather;

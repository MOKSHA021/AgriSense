import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  CloudSun, Search, AlertTriangle, Droplets, Sun, Wind,
  Thermometer, Eye, Gauge, CloudRain, Snowflake, Loader, MapPin,
} from "lucide-react";

const WMO_MAP = {
  0:  { desc: "Clear sky",              emoji: "☀️",  icon: "01d", id: 800 },
  1:  { desc: "Mainly clear",           emoji: "🌤️",  icon: "02d", id: 801 },
  2:  { desc: "Partly cloudy",          emoji: "⛅",  icon: "03d", id: 802 },
  3:  { desc: "Overcast",               emoji: "☁️",  icon: "04d", id: 804 },
  45: { desc: "Fog",                    emoji: "🌫️",  icon: "50d", id: 741 },
  48: { desc: "Rime fog",               emoji: "🌫️",  icon: "50d", id: 741 },
  51: { desc: "Light drizzle",          emoji: "🌦️",  icon: "09d", id: 300 },
  53: { desc: "Moderate drizzle",       emoji: "🌦️",  icon: "09d", id: 301 },
  55: { desc: "Dense drizzle",          emoji: "🌧️",  icon: "09d", id: 302 },
  61: { desc: "Slight rain",            emoji: "🌧️",  icon: "10d", id: 500 },
  63: { desc: "Moderate rain",          emoji: "🌧️",  icon: "10d", id: 501 },
  65: { desc: "Heavy rain",             emoji: "🌧️",  icon: "10d", id: 502 },
  71: { desc: "Slight snow",            emoji: "🌨️",  icon: "13d", id: 600 },
  73: { desc: "Moderate snow",          emoji: "❄️",  icon: "13d", id: 601 },
  75: { desc: "Heavy snow",             emoji: "❄️",  icon: "13d", id: 602 },
  80: { desc: "Rain showers",           emoji: "🌦️",  icon: "09d", id: 520 },
  81: { desc: "Moderate showers",       emoji: "🌧️",  icon: "09d", id: 521 },
  82: { desc: "Violent showers",        emoji: "⛈️",  icon: "09d", id: 531 },
  95: { desc: "Thunderstorm",           emoji: "⛈️",  icon: "11d", id: 200 },
  96: { desc: "Storm with hail",        emoji: "⛈️",  icon: "11d", id: 202 },
  99: { desc: "Storm with heavy hail",  emoji: "⛈️",  icon: "11d", id: 202 },
};

const getWMO = (code) => WMO_MAP[code] || { desc: "Unknown", emoji: "🌡️", icon: "03d", id: 802 };

const getFarmingAdvice = (weather) => {
  if (!weather) return [];
  const tips = [];
  const temp = weather.main?.temp;
  const humidity = weather.main?.humidity;
  const id = weather.weather?.[0]?.id;
  if (id >= 200 && id < 300)
    tips.push({ icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/20 border-red-500/30", text: "⚡ Thunderstorm expected — avoid open-field work and secure livestock." });
  if (id >= 500 && id < 600)
    tips.push({ icon: CloudRain, color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30", text: "🌧️ Rain forecasted — postpone pesticide spraying to avoid wash-off." });
  if (id >= 600 && id < 700)
    tips.push({ icon: Snowflake, color: "text-cyan-400", bg: "bg-cyan-500/20 border-cyan-500/30", text: "❄️ Frost risk — protect sensitive crops with mulching or row covers." });
  if (temp > 35)
    tips.push({ icon: Thermometer, color: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/30", text: "🌡️ High heat — irrigate early morning or late evening to reduce evaporation." });
  else if (temp < 5)
    tips.push({ icon: Snowflake, color: "text-cyan-400", bg: "bg-cyan-500/20 border-cyan-500/30", text: "🥶 Cold snap — cover nurseries and avoid sowing frost-sensitive crops." });
  if (humidity > 80)
    tips.push({ icon: Droplets, color: "text-blue-400", bg: "bg-blue-500/20 border-blue-500/30", text: "💧 High humidity — monitor for fungal infections like blight and mildew." });
  if (id === 800)
    tips.push({ icon: Sun, color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/30", text: "☀️ Clear skies — great day for harvesting, drying, and field preparation." });
  return tips;
};

const getRiskAlerts = (weather) => {
  if (!weather) return [];
  const alerts = [];
  const temp = weather.main?.temp;
  const id = weather.weather?.[0]?.id;
  const humidity = weather.main?.humidity;
  if (id >= 502 && id <= 531)
    alerts.push({ icon: CloudRain, label: "Flood Risk", text: "Heavy rain detected. Avoid low-lying fields and ensure drainage is clear." });
  if (temp > 40)
    alerts.push({ icon: Thermometer, label: "Heat Stress", text: "Temperature exceeds 40°C. Provide shade for livestock and increase irrigation." });
  if (id === 800 && humidity < 25)
    alerts.push({ icon: Sun, label: "Drought Risk", text: "Prolonged dry and clear conditions. Monitor soil moisture levels closely." });
  return alerts;
};

const buildForecastDays = (daily) => {
  if (!daily) return [];
  return daily.time.slice(0, 7).map((date, i) => {
    const wmo = getWMO(daily.weather_code[i]);
    return {
      date,
      tempMin: Math.round(daily.temperature_2m_min[i]),
      tempMax: Math.round(daily.temperature_2m_max[i]),
      emoji: wmo.emoji,
      icon: wmo.icon,
      desc: wmo.desc,
      humidity: Math.round(daily.relative_humidity_2m_mean?.[i] ?? 50),
      wind: Math.round(daily.wind_speed_10m_max[i]),
      precip: Math.round((daily.precipitation_sum?.[i] ?? 0) * 10) / 10,
    };
  });
};

const buildHourly = (hourly) => {
  if (!hourly) return [];
  const now = new Date();
  const nowHour = now.getHours();
  return hourly.time
    .map((t, i) => ({
      time: t,
      temp: Math.round(hourly.temperature_2m[i]),
      precip: Math.round((hourly.precipitation?.[i] ?? 0) * 10) / 10,
      code: hourly.weather_code?.[i] ?? 0,
    }))
    .filter((h) => {
      const d = new Date(h.time);
      return d >= now;
    })
    .slice(0, 12);
};

const formatDay = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = (d - today) / 86400000;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const formatHour = (isoStr) => {
  const d = new Date(isoStr);
  const h = d.getHours();
  return h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;
};

const Weather = () => {
  const [city, setCity] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true); setError("");
    try {
      const [weatherRes, geoRes] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean&hourly=temperature_2m,precipitation,weather_code&timezone=auto&forecast_days=7`),
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, { headers: { "User-Agent": "AgriSense/1.0" } }),
      ]);
      if (!weatherRes.ok) throw new Error("Failed to fetch weather data");
      const data = await weatherRes.json();
      const geo = await geoRes.json();
      const wmo = getWMO(data.current.weather_code);
      const cityResolved = geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || "Your Location";
      setCurrent({
        main: { temp: data.current.temperature_2m, feels_like: data.current.apparent_temperature, humidity: data.current.relative_humidity_2m, pressure: Math.round(data.current.surface_pressure) },
        wind: { speed: Math.round(data.current.wind_speed_10m) },
        weather: [{ id: wmo.id, icon: wmo.icon, emoji: wmo.emoji, description: wmo.desc }],
      });
      setCity(cityResolved);
      setSearchInput(cityResolved);
      setForecast(buildForecastDays(data.daily));
      setHourly(buildHourly(data.hourly));
    } catch (err) {
      setError(err.message || "Could not load weather data");
    } finally { setLoading(false); }
  };

  const fetchWeatherByCity = async (name) => {
    if (!name.trim()) return;
    setLoading(true); setError("");
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en`);
      const geoData = await geoRes.json();
      if (!geoData.results?.length) throw new Error("City not found. Please check the name and try again.");
      const { latitude, longitude, name: resolvedName } = geoData.results[0];
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean&hourly=temperature_2m,precipitation,weather_code&timezone=auto&forecast_days=7`);
      if (!weatherRes.ok) throw new Error("Failed to fetch weather data");
      const data = await weatherRes.json();
      const wmo = getWMO(data.current.weather_code);
      setCurrent({
        main: { temp: data.current.temperature_2m, feels_like: data.current.apparent_temperature, humidity: data.current.relative_humidity_2m, pressure: Math.round(data.current.surface_pressure) },
        wind: { speed: Math.round(data.current.wind_speed_10m) },
        weather: [{ id: wmo.id, icon: wmo.icon, emoji: wmo.emoji, description: wmo.desc }],
      });
      setCity(resolvedName);
      setForecast(buildForecastDays(data.daily));
      setHourly(buildHourly(data.hourly));
    } catch (err) {
      setError(err.message || "Could not load weather data");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!navigator.geolocation) { fetchWeatherByCity("Delhi"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => fetchWeatherByCity("Delhi")
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => { e.preventDefault(); fetchWeatherByCity(searchInput); };
  const advice = getFarmingAdvice(current);
  const riskAlerts = getRiskAlerts(current);
  const maxPrecip = Math.max(...hourly.map((h) => h.precip), 1);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      </div>
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <CloudSun className="w-7 h-7 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Weather</h1>
            </div>
            <p className="text-sm text-white/50 ml-10">Real-time weather with farming-specific advice.</p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text" value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search city..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              type="button"
              onClick={() => navigator.geolocation?.getCurrentPosition((p) => fetchWeatherByCoords(p.coords.latitude, p.coords.longitude))}
              className="p-3 bg-white/10 border border-white/10 text-white/60 rounded-xl hover:bg-white/20 transition-colors"
              title="Use my location"
            >
              <MapPin className="w-4 h-4" />
            </button>
            <button type="submit" className="px-5 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
              Search
            </button>
          </form>

          {error && (
            <div className="flex items-center gap-2 border border-red-500/30 bg-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3 mb-6">
              <AlertTriangle className="w-4 h-4 shrink-0" /> <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-24 text-white/40">
              <Loader className="w-6 h-6 animate-spin" />
              <span className="ml-3 text-sm">Loading weather data...</span>
            </div>
          )}

          {!loading && current && (
            <div className="space-y-6">
              {/* ── Current Conditions ── */}
              <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/30 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-7 shadow-xl">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-400" /> {city}
                    </h2>
                    <p className="text-blue-300/70 capitalize text-sm mt-0.5">{current.weather[0].description}</p>
                  </div>
                  <span className="text-6xl">{current.weather[0].emoji}</span>
                </div>

                <div className="flex items-end gap-4 mb-6">
                  <p className="text-7xl font-bold text-white">{Math.round(current.main.temp)}°</p>
                  <div className="pb-2 text-white/50 text-sm">
                    <p>Feels like {Math.round(current.main.feels_like)}°C</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: Droplets, label: "Humidity", value: `${current.main.humidity}%`, color: "text-blue-400" },
                    { icon: Wind, label: "Wind", value: `${current.wind.speed} km/h`, color: "text-cyan-400" },
                    { icon: Gauge, label: "Pressure", value: `${current.main.pressure} hPa`, color: "text-purple-400" },
                    { icon: Eye, label: "Visibility", value: "10 km", color: "text-green-400" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <item.icon className={`w-4 h-4 mx-auto mb-1.5 ${item.color}`} />
                      <p className="text-xs text-white/40 mb-0.5">{item.label}</p>
                      <p className="text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Hourly Strip ── */}
              {hourly.length > 0 && (
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
                  <h2 className="text-sm font-semibold text-white/70 mb-4">⏰ Hourly Forecast</h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {hourly.map((h, i) => {
                      const wmo = getWMO(h.code);
                      const precipPct = Math.min((h.precip / maxPrecip) * 100, 100);
                      return (
                        <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[56px]">
                          <p className="text-xs text-white/40">{formatHour(h.time)}</p>
                          <span className="text-xl">{wmo.emoji}</span>
                          <p className="text-sm font-semibold text-white">{h.temp}°</p>
                          {h.precip > 0 && (
                            <div className="w-full flex flex-col items-center gap-0.5">
                              <div className="w-6 bg-white/10 rounded-full h-10 flex flex-col-reverse overflow-hidden">
                                <div
                                  className="bg-blue-400/60 rounded-full transition-all"
                                  style={{ height: `${precipPct}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-blue-400">{h.precip}mm</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 7-Day Forecast ── */}
              {forecast.length > 0 && (
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
                  <h2 className="text-sm font-semibold text-white/70 mb-4">📅 7-Day Forecast</h2>
                  <div className="space-y-2">
                    {forecast.map((day) => {
                      const precipW = Math.min((day.precip / 30) * 100, 100);
                      return (
                        <div key={day.date} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors">
                          <p className="text-sm text-white/60 w-20 shrink-0">{formatDay(day.date)}</p>
                          <span className="text-xl shrink-0">{day.emoji}</span>
                          <p className="text-xs text-white/40 flex-1 hidden sm:block capitalize">{day.desc}</p>
                          {/* Precip bar */}
                          <div className="flex items-center gap-1.5 w-20 shrink-0">
                            <Droplets className="w-3 h-3 text-blue-400 shrink-0" />
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-400/60 rounded-full" style={{ width: `${precipW}%` }} />
                            </div>
                            <p className="text-[10px] text-blue-400 w-8 text-right">{day.precip}mm</p>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-semibold text-white shrink-0">
                            <span className="text-orange-400">{day.tempMax}°</span>
                            <span className="text-white/30">/</span>
                            <span className="text-white/50">{day.tempMin}°</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Farming Advice ── */}
              {advice.length > 0 && (
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-lg">
                  <h2 className="text-sm font-semibold text-white/70 mb-4">🌾 Farming Advice</h2>
                  <ul className="space-y-2">
                    {advice.map((tip, i) => (
                      <li key={i} className={`flex items-start gap-3 border rounded-xl p-3.5 ${tip.bg}`}>
                        <tip.icon className={`w-4 h-4 shrink-0 mt-0.5 ${tip.color}`} />
                        <span className="text-sm text-white/70">{tip.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ── Risk Alerts ── */}
              {riskAlerts.length > 0 && (
                <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-5 shadow-lg">
                  <h2 className="text-sm font-semibold text-red-300 mb-4">🚨 Risk Alerts</h2>
                  <ul className="space-y-2">
                    {riskAlerts.map((alert, i) => (
                      <li key={i} className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-3.5">
                        <alert.icon className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                        <div>
                          <p className="text-sm font-semibold text-red-300">{alert.label}</p>
                          <p className="text-xs text-red-400/80 mt-0.5">{alert.text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Weather;

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
} from "lucide-react";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE = "https://api.openweathermap.org/data/2.5";

const getFarmingAdvice = (weather) => {
  if (!weather) return [];
  const tips = [];
  const temp = weather.main?.temp;
  const humidity = weather.main?.humidity;
  const id = weather.weather?.[0]?.id;

  if (id >= 200 && id < 300)
    tips.push({
      icon: AlertTriangle,
      color: "text-red-600",
      text: "Thunderstorm expected — avoid open-field work and secure livestock.",
    });
  if (id >= 500 && id < 600)
    tips.push({
      icon: CloudRain,
      color: "text-blue-600",
      text: "Rain forecasted — postpone pesticide spraying to avoid wash-off.",
    });
  if (id >= 600 && id < 700)
    tips.push({
      icon: Snowflake,
      color: "text-cyan-600",
      text: "Frost risk — protect sensitive crops with mulching or row covers.",
    });

  if (temp > 35)
    tips.push({
      icon: Thermometer,
      color: "text-orange-600",
      text: "High heat — irrigate early morning or late evening to reduce evaporation.",
    });
  else if (temp < 5)
    tips.push({
      icon: Snowflake,
      color: "text-cyan-600",
      text: "Cold snap — cover nurseries and avoid sowing frost-sensitive crops.",
    });

  if (humidity > 80)
    tips.push({
      icon: Droplets,
      color: "text-blue-600",
      text: "High humidity — monitor for fungal infections like blight and mildew.",
    });

  if (id === 800)
    tips.push({
      icon: Sun,
      color: "text-yellow-600",
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

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError("");
    try {
      const [curRes, foreRes] = await Promise.all([
        fetch(
          `${BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        ),
        fetch(
          `${BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        ),
      ]);
      if (!curRes.ok || !foreRes.ok)
        throw new Error("Failed to fetch weather data");
      const curData = await curRes.json();
      const foreData = await foreRes.json();
      setCurrent(curData);
      setCity(curData.name);
      setSearchInput(curData.name);
      setForecast(groupForecastByDay(foreData.list));
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
      const [curRes, foreRes] = await Promise.all([
        fetch(
          `${BASE}/weather?q=${encodeURIComponent(name)}&units=metric&appid=${API_KEY}`
        ),
        fetch(
          `${BASE}/forecast?q=${encodeURIComponent(name)}&units=metric&appid=${API_KEY}`
        ),
      ]);
      if (!curRes.ok || !foreRes.ok)
        throw new Error("City not found. Please check the name and try again.");
      const curData = await curRes.json();
      const foreData = await foreRes.json();
      setCurrent(curData);
      setCity(curData.name);
      setForecast(groupForecastByDay(foreData.list));
    } catch (err) {
      setError(err.message || "Could not load weather data");
    } finally {
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
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <CloudSun className="w-8 h-8 text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">Weather</h1>
          </div>
          <p className="text-sm text-gray-500 ml-11">
            Real-time weather data with farming-specific advice for smarter
            field decisions.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-3 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800"
          >
            Search
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader className="w-6 h-6 animate-spin" />
            <span className="ml-2 text-sm">Loading weather data...</span>
          </div>
        )}

        {/* Current Weather */}
        {!loading && current && (
          <div className="space-y-8">
            {/* Current conditions */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {city}
                  </h2>
                  <p className="text-sm text-gray-500 capitalize">
                    {current.weather[0].description}
                  </p>
                </div>
                <img
                  src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
                  alt={current.weather[0].description}
                  className="w-16 h-16"
                />
              </div>

              <p className="text-4xl font-bold text-gray-900 mb-6">
                {Math.round(current.main.temp)}&deg;C
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Thermometer className="w-4 h-4 text-gray-400" />
                  <span>
                    Feels like {Math.round(current.main.feels_like)}&deg;C
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Droplets className="w-4 h-4 text-gray-400" />
                  <span>Humidity {current.main.humidity}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Wind className="w-4 h-4 text-gray-400" />
                  <span>Wind {current.wind.speed} m/s</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Gauge className="w-4 h-4 text-gray-400" />
                  <span>Pressure {current.main.pressure} hPa</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span>
                    Visibility {(current.visibility / 1000).toFixed(1)} km
                  </span>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            {forecast.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  5-Day Forecast
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {forecast.map((day) => (
                    <div
                      key={day.date}
                      className="min-w-[140px] flex-1 border border-gray-200 rounded-lg p-4 text-center"
                    >
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        {formatDay(day.date)}
                      </p>
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                        alt={day.desc}
                        className="w-10 h-10 mx-auto"
                      />
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {day.tempMax}&deg;
                        <span className="text-gray-400 font-normal">
                          {" "}
                          / {day.tempMin}&deg;
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 capitalize mt-1">
                        {day.desc}
                      </p>
                      <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Droplets className="w-3 h-3" />
                          {day.humidity}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Wind className="w-3 h-3" />
                          {day.wind}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Farming Advice */}
            {advice.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Farming Advice
                </h2>
                <ul className="space-y-3">
                  {advice.map((tip, i) => {
                    const Icon = tip.icon;
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-3 border border-gray-200 rounded-lg p-4"
                      >
                        <Icon
                          className={`w-5 h-5 shrink-0 mt-0.5 ${tip.color}`}
                        />
                        <span className="text-sm text-gray-700">
                          {tip.text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Risk Alerts */}
            {riskAlerts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Risk Alerts
                </h2>
                <ul className="space-y-3">
                  {riskAlerts.map((alert, i) => {
                    const Icon = alert.icon;
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-3 border border-red-200 rounded-lg p-4 bg-red-50"
                      >
                        <Icon className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            {alert.label}
                          </p>
                          <p className="text-sm text-red-700 mt-0.5">
                            {alert.text}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Weather;

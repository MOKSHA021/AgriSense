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

const WMO_MAP = {
  0: { desc: "Clear sky", icon: "01d", id: 800 },
  1: { desc: "Mainly clear", icon: "02d", id: 801 },
  2: { desc: "Partly cloudy", icon: "03d", id: 802 },
  3: { desc: "Overcast", icon: "04d", id: 804 },
  45: { desc: "Fog", icon: "50d", id: 741 },
  48: { desc: "Depositing rime fog", icon: "50d", id: 741 },
  51: { desc: "Light drizzle", icon: "09d", id: 300 },
  53: { desc: "Moderate drizzle", icon: "09d", id: 301 },
  55: { desc: "Dense drizzle", icon: "09d", id: 302 },
  61: { desc: "Slight rain", icon: "10d", id: 500 },
  63: { desc: "Moderate rain", icon: "10d", id: 501 },
  65: { desc: "Heavy rain", icon: "10d", id: 502 },
  71: { desc: "Slight snow", icon: "13d", id: 600 },
  73: { desc: "Moderate snow", icon: "13d", id: 601 },
  75: { desc: "Heavy snow", icon: "13d", id: 602 },
  80: { desc: "Slight rain showers", icon: "09d", id: 520 },
  81: { desc: "Moderate rain showers", icon: "09d", id: 521 },
  82: { desc: "Violent rain showers", icon: "09d", id: 531 },
  85: { desc: "Slight snow showers", icon: "13d", id: 620 },
  86: { desc: "Heavy snow showers", icon: "13d", id: 621 },
  95: { desc: "Thunderstorm", icon: "11d", id: 200 },
  96: { desc: "Thunderstorm with hail", icon: "11d", id: 202 },
  99: { desc: "Thunderstorm with heavy hail", icon: "11d", id: 202 },
};

const getWMO = (code) => WMO_MAP[code] || { desc: "Unknown", icon: "03d", id: 802 };

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

const buildForecastDays = (daily) => {
  if (!daily) return [];
  return daily.time.slice(0, 5).map((date, i) => {
    const wmo = getWMO(daily.weather_code[i]);
    return {
      date,
      tempMin: Math.round(daily.temperature_2m_min[i]),
      tempMax: Math.round(daily.temperature_2m_max[i]),
      icon: wmo.icon,
      desc: wmo.desc,
      humidity: Math.round(daily.relative_humidity_2m_mean?.[i] ?? 50),
      wind: Math.round(daily.wind_speed_10m_max[i] * 10) / 10,
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
      const [weatherRes, geoRes] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean&timezone=auto&forecast_days=6`
        ),
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
          { headers: { "User-Agent": "AgriSense/1.0" } }
        ),
      ]);
      if (!weatherRes.ok) throw new Error("Failed to fetch weather data");
      const data = await weatherRes.json();
      const geo = await geoRes.json();
      const wmo = getWMO(data.current.weather_code);
      const cityResolved = geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || "Your Location";
      const currentWeather = {
        main: {
          temp: data.current.temperature_2m,
          feels_like: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          pressure: Math.round(data.current.surface_pressure),
        },
        wind: { speed: Math.round(data.current.wind_speed_10m * 10) / 36 },
        visibility: 10000,
        weather: [{ id: wmo.id, icon: wmo.icon, description: wmo.desc }],
      };
      setCurrent(currentWeather);
      setCity(cityResolved);
      setSearchInput(cityResolved);
      setForecast(buildForecastDays(data.daily));
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
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en`
      );
      const geoData = await geoRes.json();
      if (!geoData.results?.length) throw new Error("City not found. Please check the name and try again.");
      const { latitude, longitude, name: resolvedName } = geoData.results[0];
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean&timezone=auto&forecast_days=6`
      );
      if (!weatherRes.ok) throw new Error("Failed to fetch weather data");
      const data = await weatherRes.json();
      const wmo = getWMO(data.current.weather_code);
      const currentWeather = {
        main: {
          temp: data.current.temperature_2m,
          feels_like: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          pressure: Math.round(data.current.surface_pressure),
        },
        wind: { speed: Math.round(data.current.wind_speed_10m * 10) / 36 },
        visibility: 10000,
        weather: [{ id: wmo.id, icon: wmo.icon, description: wmo.desc }],
      };
      setCurrent(currentWeather);
      setCity(resolvedName);
      setForecast(buildForecastDays(data.daily));
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
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative z-10">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <CloudSun className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white drop-shadow">Weather</h1>
          </div>
          <p className="text-sm text-white/70 ml-11">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/10 bg-white/10 backdrop-blur-md text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 shadow-lg"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 shadow-lg"
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
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {city}
                  </h2>
                  <p className="text-sm text-white/50 capitalize">
                    {current.weather[0].description}
                  </p>
                </div>
                <img
                  src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
                  alt={current.weather[0].description}
                  className="w-16 h-16"
                />
              </div>

              <p className="text-4xl font-bold text-white mb-6">
                {Math.round(current.main.temp)}&deg;C
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Thermometer className="w-4 h-4 text-white/40" />
                  <span>
                    Feels like {Math.round(current.main.feels_like)}&deg;C
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Droplets className="w-4 h-4 text-white/40" />
                  <span>Humidity {current.main.humidity}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Wind className="w-4 h-4 text-white/40" />
                  <span>Wind {current.wind.speed} m/s</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Gauge className="w-4 h-4 text-white/40" />
                  <span>Pressure {current.main.pressure} hPa</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Eye className="w-4 h-4 text-white/40" />
                  <span>
                    Visibility {(current.visibility / 1000).toFixed(1)} km
                  </span>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            {forecast.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white drop-shadow mb-4">
                  5-Day Forecast
                </h2>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {forecast.map((day) => (
                    <div
                      key={day.date}
                      className="min-w-[140px] flex-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center shadow-lg"
                    >
                      <p className="text-xs font-medium text-white/50 mb-2">
                        {formatDay(day.date)}
                      </p>
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                        alt={day.desc}
                        className="w-10 h-10 mx-auto"
                      />
                      <p className="text-sm font-semibold text-white mt-1">
                        {day.tempMax}&deg;
                        <span className="text-white/40 font-normal">
                          {" "}
                          / {day.tempMin}&deg;
                        </span>
                      </p>
                      <p className="text-xs text-white/50 capitalize mt-1">
                        {day.desc}
                      </p>
                      <div className="flex items-center justify-center gap-3 mt-2 text-xs text-white/40">
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
                <h2 className="text-lg font-semibold text-white drop-shadow mb-4">
                  Farming Advice
                </h2>
                <ul className="space-y-3">
                  {advice.map((tip, i) => {
                    const Icon = tip.icon;
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg"
                      >
                        <Icon
                          className={`w-5 h-5 shrink-0 mt-0.5 ${tip.color}`}
                        />
                        <span className="text-sm text-white/70">
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
                <h2 className="text-lg font-semibold text-white drop-shadow mb-4">
                  Risk Alerts
                </h2>
                <ul className="space-y-3">
                  {riskAlerts.map((alert, i) => {
                    const Icon = alert.icon;
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-3 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-xl p-4 shadow-lg"
                      >
                        <Icon className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                        <div>
                          <p className="text-sm font-medium text-red-300">
                            {alert.label}
                          </p>
                          <p className="text-sm text-red-400 mt-0.5">
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
    </div>
  );
};

export default Weather;

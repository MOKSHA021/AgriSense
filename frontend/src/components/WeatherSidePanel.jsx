import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
      color: "text-red-600",
      text: "Thunderstorm expected â€” avoid open-field work and secure livestock.",
    });
  if (id >= 500 && id < 600)
    tips.push({
      icon: CloudRain,
      color: "text-blue-600",
      text: "Rain forecasted â€” postpone pesticide spraying to avoid wash-off.",
    });
  if (id >= 600 && id < 700)
    tips.push({
      icon: Snowflake,
      color: "text-cyan-600",
      text: "Frost risk â€” protect sensitive crops with mulching or row covers.",
    });

  if (temp > 35)
    tips.push({
      icon: Thermometer,
      color: "text-orange-600",
      text: "High heat â€” irrigate early morning or late evening to reduce evaporation.",
    });
  else if (temp < 5)
    tips.push({
      icon: Snowflake,
      color: "text-cyan-600",
      text: "Cold snap â€” cover nurseries and avoid sowing frost-sensitive crops.",
    });

  if (humidity > 80)
    tips.push({
      icon: Droplets,
      color: "text-blue-600",
      text: "High humidity â€” monitor for fungal infections like blight and mildew.",
    });

  if (id === 800)
    tips.push({
      icon: Sun,
      color: "text-yellow-600",
      text: "Clear skies â€” good day for harvesting, drying, and field preparation.",
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

const WeatherSidePanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-weather-panel", handleOpen);
    return () => window.removeEventListener("open-weather-panel", handleOpen);
  }, []);
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
        wind: { speed: Math.round((data.current.wind_speed_10m * 1000) / 3600 * 10) / 10 },
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
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform group"
      >
        <CloudSun className="w-6 h-6 animate-pulse" />
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Live Weather
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900">Weather</h2>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Page Header */}
          <div className="mb-6">
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
        </div>
      </div>
    </>
  );
};

export default WeatherSidePanel;

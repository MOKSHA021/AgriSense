const express = require("express");
const axios = require("axios");

const router = express.Router();

const getSeasonForDate = (date = new Date()) => {
  const month = date.getMonth() + 1;
  if (month >= 6 && month <= 10) return "Kharif";
  if (month === 4 || month === 5) return "Zaid";
  return "Rabi";
};

const weatherDescription = (code) => {
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Weather update";
};

const resolveLocationName = async (lat, lon) => {
  try {
    const { data } = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      timeout: 8000,
      params: { format: "json", lat, lon, zoom: 10, addressdetails: 1 },
      headers: { "User-Agent": "AgriSense/1.0" },
    });
    const address = data.address || {};
    const locality =
      address.village ||
      address.town ||
      address.city ||
      address.county ||
      address.state_district ||
      address.state ||
      "Detected location";
    return {
      name: locality,
      displayName: data.display_name || locality,
      address,
    };
  } catch {
    return { name: "Detected location", displayName: "Detected location", address: {} };
  }
};

const geocodeCity = async (query) => {
  const { data } = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
    timeout: 8000,
    params: { name: query, count: 5, language: "en", format: "json" },
  });
  const results = data.results || [];
  const preferred = results.find((item) => item.country_code === "IN") || results[0];
  if (!preferred) {
    const err = new Error("Location not found. Try a nearby city or district.");
    err.status = 404;
    throw err;
  }
  return {
    lat: preferred.latitude,
    lon: preferred.longitude,
    name: `${preferred.name}${preferred.admin1 ? `, ${preferred.admin1}` : ""}`,
    displayName: `${preferred.name}${preferred.admin1 ? `, ${preferred.admin1}` : ""}${preferred.country ? `, ${preferred.country}` : ""}`,
    address: { state: preferred.admin1, country: preferred.country },
  };
};

const fetchOpenMeteo = async (lat, lon) => {
  const params = {
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code",
    hourly: "precipitation,precipitation_probability,wind_gusts_10m,weather_code",
    daily:
      "weather_code,precipitation_sum,precipitation_probability_max,wind_gusts_10m_max,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: 7,
    past_days: 30,
  };
  const { data } = await axios.get("https://api.open-meteo.com/v1/forecast", {
    timeout: 10000,
    params,
  });
  return data;
};

const sliceDaily = (daily = {}, start = 0, end) => {
  const result = {};
  Object.entries(daily).forEach(([key, value]) => {
    result[key] = Array.isArray(value) ? value.slice(start, end) : value;
  });
  return result;
};

const filterHourlyFromNow = (hourly = {}) => {
  const times = hourly.time || [];
  const now = new Date();
  const startIndex = times.findIndex((time) => new Date(time) >= now);
  if (startIndex === -1) {
    return Object.fromEntries(
      Object.entries(hourly).map(([key, value]) => [key, Array.isArray(value) ? [] : value])
    );
  }
  const endIndex = startIndex + 168;
  const result = {};
  Object.entries(hourly).forEach(([key, value]) => {
    result[key] = Array.isArray(value) ? value.slice(startIndex, endIndex) : value;
  });
  return result;
};

router.get("/farm-forecast", async (req, res) => {
  try {
    const { lat, lon, q } = req.query;
    let location;
    if (lat != null && lon != null) {
      const latitude = Number(lat);
      const longitude = Number(lon);
      location = {
        lat: latitude,
        lon: longitude,
        ...(await resolveLocationName(latitude, longitude)),
      };
    } else if (q) {
      location = await geocodeCity(String(q));
    } else {
      return res.status(400).json({ message: "lat/lon or q is required" });
    }

    if (!Number.isFinite(Number(location.lat)) || !Number.isFinite(Number(location.lon))) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const weather = await fetchOpenMeteo(location.lat, location.lon);
    const dailyTimes = weather.daily?.time || [];
    const forecastStart = Math.max(0, dailyTimes.length - 7);
    const historyDaily = sliceDaily(weather.daily, 0, forecastStart);
    const forecastDaily = sliceDaily(weather.daily, forecastStart);
    const forecastHourly = filterHourlyFromNow(weather.hourly);
    const rainfall30Days = (historyDaily.precipitation_sum || [])
      .slice(-30)
      .reduce((sum, value) => sum + (Number(value) || 0), 0);
    const currentCode = weather.current?.weather_code;

    res.json({
      provider: "open-meteo",
      apiKeyConfigured: true,
      season: getSeasonForDate(new Date()),
      location,
      current: {
        temperature: weather.current?.temperature_2m,
        humidity: weather.current?.relative_humidity_2m,
        windSpeed: weather.current?.wind_speed_10m,
        windGust: weather.current?.wind_gusts_10m,
        weatherCode: currentCode,
        description: weatherDescription(currentCode),
        observedAt: weather.current?.time,
      },
      rainfall30Days: Math.round(rainfall30Days),
      daily: forecastDaily,
      historyDaily,
      hourly: forecastHourly,
      raw: { ...weather, daily: forecastDaily, hourly: forecastHourly },
    });
  } catch (err) {
    res.status(err.status || 502).json({
      message: err.message || "Could not fetch weather data",
    });
  }
});

module.exports = router;

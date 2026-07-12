const weatherService = require("../services/weatherService");

const getFarmForecast = async (req, res) => {
  try {
    const { lat, lon, q } = req.query;
    let location;

    if (lat != null && lon != null) {
      const latitude = Number(lat);
      const longitude = Number(lon);
      location = {
        lat: latitude,
        lon: longitude,
        ...(await weatherService.resolveLocationName(latitude, longitude)),
      };
    } else if (q) {
      location = await weatherService.geocodeCity(String(q));
    } else {
      return res.status(400).json({ message: "lat/lon or q is required" });
    }

    if (!Number.isFinite(Number(location.lat)) || !Number.isFinite(Number(location.lon))) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const weather = await weatherService.fetchOpenMeteo(location.lat, location.lon);
    
    const dailyTimes = weather.daily?.time || [];
    const forecastStart = Math.max(0, dailyTimes.length - 7);
    
    const historyDaily = weatherService.sliceDaily(weather.daily, 0, forecastStart);
    const forecastDaily = weatherService.sliceDaily(weather.daily, forecastStart);
    const forecastHourly = weatherService.filterHourlyFromNow(weather.hourly);
    
    const rainfall30Days = (historyDaily.precipitation_sum || [])
      .slice(-30)
      .reduce((sum, value) => sum + (Number(value) || 0), 0);
      
    const currentCode = weather.current?.weather_code;

    res.json({
      provider: "open-meteo",
      apiKeyConfigured: true,
      season: weatherService.getSeasonForDate(new Date()),
      location,
      current: {
        temperature: weather.current?.temperature_2m,
        humidity: weather.current?.relative_humidity_2m,
        windSpeed: weather.current?.wind_speed_10m,
        windGust: weather.current?.wind_gusts_10m,
        weatherCode: currentCode,
        description: weatherService.weatherDescription(currentCode),
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
};

module.exports = {
  getFarmForecast
};

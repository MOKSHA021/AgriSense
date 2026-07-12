import {
  AlertTriangle,
  CloudRain,
  Snowflake,
  Thermometer,
  Droplets,
  Sun,
} from "lucide-react";

export const mapWmoToOwm = (code, isDay = 1) => {
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

export const getFarmingAdvice = (weather, t) => {
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

export const getRiskAlerts = (weather, t) => {
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

export const groupForecastByDay = (list) => {
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

export const formatDay = (dateStr) => {
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

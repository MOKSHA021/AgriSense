import { motion } from "framer-motion";
import { Thermometer, Droplets, Wind, Gauge, Eye } from "lucide-react";

const CurrentWeatherCard = ({ city, current, t }) => {
  if (!current) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
    >
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
  );
};

export default CurrentWeatherCard;

import { motion } from "framer-motion";
import { CloudSun, Droplets, Wind } from "lucide-react";
import { formatDay } from "./weatherHelpers";

const ForecastList = ({ forecast, t }) => {
  if (!forecast || forecast.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
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
            animate={{ opacity: 1, y: 0 }}
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
  );
};

export default ForecastList;

import { motion } from "framer-motion";
import { CloudSun } from "lucide-react";

const FarmingAdviceList = ({ advice, t, hasRiskAlerts }) => {
  if (!advice || advice.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden sm:col-span-1"
      style={{ gridColumn: !hasRiskAlerts ? 'span 2' : undefined }}
    >
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#1E8E5A] rounded-l-2xl" />
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[#1E8E5A] mb-5 flex items-center gap-2 pl-2">
        <CloudSun className="w-4 h-4" />
        {t('weather.farmingAdvice')}
      </h2>
      <ul className="space-y-3">
        {advice.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <li
              key={i}
              className={`flex items-start gap-3 border rounded-xl p-4 ${tip.color} ${tip.borderLeft}`}
            >
              <div className="shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium mt-0.5">
                {tip.text}
              </span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
};

export default FarmingAdviceList;

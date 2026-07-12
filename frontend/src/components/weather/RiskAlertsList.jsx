import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const RiskAlertsList = ({ riskAlerts, t }) => {
  if (!riskAlerts || riskAlerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500 rounded-l-2xl" />
      <h2 className="text-sm font-semibold uppercase tracking-wider text-red-600 mb-5 flex items-center gap-2 pl-2">
        <AlertTriangle className="w-4 h-4" />
        {t('weather.riskAlerts')}
      </h2>
      <ul className="space-y-3">
        {riskAlerts.map((alert, i) => {
          const Icon = alert.icon;
          return (
            <li
              key={i}
              className="flex flex-col gap-2 border border-red-100 rounded-xl p-4 bg-red-50"
            >
              <div className="flex items-center gap-2 text-red-600">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider">{alert.label}</span>
              </div>
              <p className="text-sm font-medium text-red-700">
                {alert.text}
              </p>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
};

export default RiskAlertsList;

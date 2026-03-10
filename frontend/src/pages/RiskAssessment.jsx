import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  ShieldAlert,
  Search,
  AlertTriangle,
  Droplets,
  Sun,
  Thermometer,
  Snowflake,
  Loader,
  MapPin,
  Sprout,
  Clock,
} from "lucide-react";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE = "https://api.openweathermap.org/data/2.5";

const SEASONS = ["Kharif", "Rabi", "Zaid"];

const computeRisks = (current, forecast) => {
  const temp = current.main?.temp ?? 25;
  const humidity = current.main?.humidity ?? 50;

  const totalRainMm =
    forecast.reduce((sum, item) => {
      return sum + (item.rain?.["3h"] || 0);
    }, 0) || 0;

  const hasRainForecast = totalRainMm > 0;

  // Flood Risk
  let floodLevel = "LOW";
  let floodDesc = "No significant rainfall expected. Fields are safe.";
  let floodAction = "Continue normal operations and monitor weather updates.";
  if (totalRainMm > 200) {
    floodLevel = "HIGH";
    floodDesc = `Heavy rainfall forecast (${Math.round(totalRainMm)}mm). Waterlogging and flooding likely.`;
    floodAction =
      "Clear drainage channels immediately. Move livestock to higher ground. Avoid low-lying fields.";
  } else if (totalRainMm > 100) {
    floodLevel = "MEDIUM";
    floodDesc = `Moderate rainfall expected (${Math.round(totalRainMm)}mm). Some waterlogging possible.`;
    floodAction =
      "Ensure drainage systems are functioning. Delay sowing in flood-prone areas.";
  }

  // Drought Risk
  let droughtLevel = "LOW";
  let droughtDesc = "Adequate moisture levels detected. No drought concern.";
  let droughtAction = "Maintain regular irrigation schedule.";
  if (humidity < 30 && !hasRainForecast) {
    droughtLevel = "HIGH";
    droughtDesc = `Very low humidity (${humidity}%) with no rain forecast. Severe moisture deficit likely.`;
    droughtAction =
      "Increase irrigation frequency. Apply mulch to retain soil moisture. Consider drought-resistant varieties.";
  } else if (humidity < 50) {
    droughtLevel = "MEDIUM";
    droughtDesc = `Below-average humidity (${humidity}%). Moderate moisture stress possible.`;
    droughtAction =
      "Monitor soil moisture closely. Schedule supplemental irrigation if needed.";
  }

  // Heat Stress
  let heatLevel = "LOW";
  let heatDesc = "Temperature is within a safe range for most crops.";
  let heatAction = "No special measures needed. Continue regular field work.";
  if (temp > 40) {
    heatLevel = "HIGH";
    heatDesc = `Extreme temperature (${Math.round(temp)}°C). Crop wilting and heat damage expected.`;
    heatAction =
      "Irrigate early morning and late evening. Provide shade for nurseries. Avoid midday field work.";
  } else if (temp > 35) {
    heatLevel = "MEDIUM";
    heatDesc = `Elevated temperature (${Math.round(temp)}°C). Some heat-sensitive crops may be affected.`;
    heatAction =
      "Increase watering frequency. Monitor for signs of heat stress in crops.";
  }

  // Frost Risk
  let frostLevel = "LOW";
  let frostDesc = "No frost risk at current temperatures.";
  let frostAction = "No protective measures required.";
  if (temp < 5) {
    frostLevel = "HIGH";
    frostDesc = `Near-freezing temperature (${Math.round(temp)}°C). Frost damage to crops is highly likely.`;
    frostAction =
      "Cover sensitive crops with row covers or mulch. Avoid sowing frost-sensitive varieties. Use smudge pots if available.";
  } else if (temp < 10) {
    frostLevel = "MEDIUM";
    frostDesc = `Cool temperature (${Math.round(temp)}°C). Light frost possible during early morning.`;
    frostAction =
      "Monitor overnight temperatures. Prepare frost covers for vulnerable crops.";
  }

  return [
    {
      name: "Flood Risk",
      icon: Droplets,
      level: floodLevel,
      description: floodDesc,
      action: floodAction,
    },
    {
      name: "Drought Risk",
      icon: Sun,
      level: droughtLevel,
      description: droughtDesc,
      action: droughtAction,
    },
    {
      name: "Heat Stress",
      icon: Thermometer,
      level: heatLevel,
      description: heatDesc,
      action: heatAction,
    },
    {
      name: "Frost Risk",
      icon: Snowflake,
      level: frostLevel,
      description: frostDesc,
      action: frostAction,
    },
  ];
};

const getSafeCrops = (risks) => {
  const levels = {};
  risks.forEach((r) => {
    levels[r.name] = r.level;
  });

  const crops = [];

  if (levels["Flood Risk"] === "HIGH") {
    crops.push({
      name: "Rice (Paddy)",
      reason: "Thrives in waterlogged conditions and tolerates excess moisture.",
    });
    crops.push({
      name: "Jute",
      reason: "Grows well in high-moisture and humid environments.",
    });
  }

  if (levels["Drought Risk"] === "HIGH") {
    crops.push({
      name: "Pearl Millet (Bajra)",
      reason: "Highly drought-tolerant and requires minimal water.",
    });
    crops.push({
      name: "Sorghum (Jowar)",
      reason: "Deep root system helps survive prolonged dry spells.",
    });
  }

  if (levels["Heat Stress"] === "HIGH" || levels["Heat Stress"] === "MEDIUM") {
    crops.push({
      name: "Finger Millet (Ragi)",
      reason: "Heat-tolerant and nutritious grain suitable for hot climates.",
    });
    crops.push({
      name: "Sesame (Til)",
      reason: "Performs well under high temperature and low rainfall.",
    });
  }

  if (levels["Frost Risk"] === "HIGH" || levels["Frost Risk"] === "MEDIUM") {
    crops.push({
      name: "Wheat",
      reason: "Cold-hardy crop that tolerates low temperatures well.",
    });
    crops.push({
      name: "Mustard",
      reason: "Grows well in cool weather and withstands light frost.",
    });
  }

  if (crops.length === 0) {
    crops.push(
      {
        name: "Wheat",
        reason: "Versatile crop suitable for moderate conditions.",
      },
      {
        name: "Rice (Paddy)",
        reason: "Stable choice with favorable weather conditions.",
      },
      {
        name: "Maize",
        reason: "Good yield potential in current low-risk conditions.",
      },
      {
        name: "Pulses (Moong/Urad)",
        reason: "Short-duration crops ideal when conditions are favorable.",
      }
    );
  }

  // Deduplicate by name and limit to 4
  const seen = new Set();
  return crops.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  }).slice(0, 4);
};

const levelBadge = (level) => {
  const styles = {
    HIGH: "bg-red-100 text-red-700",
    MEDIUM: "bg-amber-100 text-amber-700",
    LOW: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[level]}`}
    >
      {level}
    </span>
  );
};

const levelCardBg = (level) => {
  const map = {
    HIGH: "bg-red-50 border-red-200",
    MEDIUM: "bg-amber-50 border-amber-200",
    LOW: "bg-green-50 border-green-200",
  };
  return map[level];
};

const RiskAssessment = () => {
  const [cityInput, setCityInput] = useState("");
  const [season, setSeason] = useState("Kharif");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [risks, setRisks] = useState(null);
  const [cityName, setCityName] = useState("");
  const [detecting, setDetecting] = useState(false);

  const fetchAndAssess = async (query) => {
    setLoading(true);
    setError("");
    setRisks(null);
    try {
      const [curRes, foreRes] = await Promise.all([
        fetch(`${BASE}/weather?${query}&units=metric&appid=${API_KEY}`),
        fetch(`${BASE}/forecast?${query}&units=metric&appid=${API_KEY}`),
      ]);
      if (!curRes.ok || !foreRes.ok)
        throw new Error("City not found. Please check the name and try again.");
      const curData = await curRes.json();
      const foreData = await foreRes.json();
      setCityName(curData.name);
      setCityInput(curData.name);
      setRisks(computeRisks(curData, foreData.list));
    } catch (err) {
      setError(err.message || "Could not fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssess = (e) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    fetchAndAssess(`q=${encodeURIComponent(cityInput.trim())}`);
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetecting(false);
        fetchAndAssess(
          `lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
        );
      },
      () => {
        setDetecting(false);
        setError("Could not detect location. Please enter a city manually.");
      }
    );
  };

  const highCount = risks
    ? risks.filter((r) => r.level === "HIGH").length
    : 0;
  const safeCrops = risks ? getSafeCrops(risks) : [];
  const showDelayedSowing = highCount >= 2;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <ShieldAlert className="w-8 h-8 text-gray-700" />
            <h1 className="text-2xl font-bold text-gray-900">
              Risk Assessment
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-11">
            Analyze weather and seasonal data to identify farming risks and get
            crop safety recommendations.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAssess} className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Enter city name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={handleAutoDetect}
              disabled={detecting}
              className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              {detecting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              Detect
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Season</label>
            <div className="flex gap-2">
              {SEASONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeason(s)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    season === s
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !cityInput.trim()}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                Assessing...
              </span>
            ) : (
              "Assess Risk"
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Risk Results */}
        {risks && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Risk Analysis for {cityName}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Season: {season}
              </p>

              {/* Risk Cards 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {risks.map((risk) => {
                  const Icon = risk.icon;
                  return (
                    <div
                      key={risk.name}
                      className={`rounded-lg border p-4 ${levelCardBg(risk.level)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5 text-gray-700" />
                          <span className="text-sm font-semibold text-gray-900">
                            {risk.name}
                          </span>
                        </div>
                        {levelBadge(risk.level)}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {risk.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium text-gray-600">
                          Action:
                        </span>{" "}
                        {risk.action}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delayed Sowing Recommendation */}
            {showDelayedSowing && (
              <div className="flex items-start gap-3 border border-amber-200 rounded-lg p-4 bg-amber-50">
                <Clock className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Delayed Sowing Recommended
                  </p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    Multiple high-risk conditions detected. Consider delaying
                    sowing by 1-2 weeks until conditions improve. Monitor
                    weather forecasts regularly before proceeding.
                  </p>
                </div>
              </div>
            )}

            {/* Safe Crops */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Safe Crops for Current Conditions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {safeCrops.map((crop) => (
                  <div
                    key={crop.name}
                    className="flex items-start gap-3 border border-gray-200 rounded-lg p-4"
                  >
                    <Sprout className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {crop.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {crop.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RiskAssessment;
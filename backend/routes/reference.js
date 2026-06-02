const express = require("express");
const router = express.Router();

// Reference data for Expense Tracker and other features
const CATEGORIES = [
  "Seeds",
  "Fertilizer",
  "Pesticide",
  "Labour",
  "Irrigation",
  "Equipment",
  "Transport",
  "Other",
];

const PLAN_CROPS = [
  "Wheat",
  "Rice",
  "Maize",
  "Cotton",
  "Sugarcane",
  "Potato",
  "Soybean",
  "Groundnut",
  "Millets",
  "Sorghum",
  "Banana",
  "Jute",
];

const SEASONS = ["Kharif", "Rabi", "Zaid"];

// Soil presets for Crop Recommendation
const SOIL_PRESETS = {
  Alluvial: { N: 80, P: 40, K: 40 },
  Black: { N: 60, P: 30, K: 50 },
  Red: { N: 40, P: 20, K: 30 },
  Laterite: { N: 30, P: 15, K: 25 },
  Sandy: { N: 20, P: 10, K: 15 },
};

// Crops data for Crop Recommendation
const CROPS = [
  {
    name: "Rice",
    N: [60, 120], P: [20, 60], K: [20, 60],
    temp: [20, 35], humidity: [60, 90], ph: [5.5, 7.0], rainfall: [150, 300],
    irrigated: true, rainfed: true,
    yield: 20, price: 2100, cost_pct: 0.6,
    tip: "Maintain 5 cm standing water during tillering stage.",
  },
  {
    name: "Wheat",
    N: [80, 150], P: [30, 60], K: [20, 50],
    temp: [10, 25], humidity: [40, 70], ph: [6.0, 7.5], rainfall: [50, 100],
    irrigated: true, rainfed: false,
    yield: 18, price: 2275, cost_pct: 0.6,
    tip: "Sow in mid-November for optimal vernalisation.",
  },
  {
    name: "Maize",
    N: [80, 150], P: [30, 60], K: [20, 50],
    temp: [18, 35], humidity: [50, 80], ph: [5.5, 7.5], rainfall: [60, 110],
    irrigated: true, rainfed: true,
    yield: 22, price: 1870, cost_pct: 0.6,
    tip: "Apply nitrogen in three split doses for better cob filling.",
  },
  {
    name: "Sugarcane",
    N: [100, 200], P: [40, 80], K: [40, 80],
    temp: [25, 40], humidity: [60, 90], ph: [6.0, 7.5], rainfall: [100, 200],
    irrigated: true, rainfed: false,
    yield: 350, price: 350, cost_pct: 0.6,
    tip: "Use trench planting method for better ratoon management.",
  },
  {
    name: "Millets",
    N: [20, 60], P: [10, 30], K: [10, 30],
    temp: [25, 40], humidity: [30, 60], ph: [5.0, 7.0], rainfall: [30, 80],
    irrigated: false, rainfed: true,
    yield: 8, price: 2800, cost_pct: 0.4,
    tip: "Sow at onset of monsoon for best germination.",
  },
  {
    name: "Cotton",
    N: [60, 120], P: [30, 60], K: [30, 60],
    temp: [20, 35], humidity: [50, 80], ph: [6.0, 8.0], rainfall: [50, 100],
    irrigated: true, rainfed: true,
    yield: 15, price: 6500, cost_pct: 0.5,
    tip: "Ensure proper spacing for better boll development.",
  },
  {
    name: "Potato",
    N: [80, 120], P: [40, 80], K: [80, 120],
    temp: [15, 25], humidity: [70, 90], ph: [5.0, 6.5], rainfall: [40, 80],
    irrigated: true, rainfed: false,
    yield: 200, price: 1200, cost_pct: 0.5,
    tip: "Plant in well-drained sandy loam soil.",
  },
  {
    name: "Soybean",
    N: [20, 40], P: [30, 60], K: [20, 40],
    temp: [20, 30], humidity: [60, 80], ph: [6.0, 7.0], rainfall: [60, 100],
    irrigated: true, rainfed: true,
    yield: 12, price: 4500, cost_pct: 0.4,
    tip: "Inoculate seeds with rhizobium for better nitrogen fixation.",
  },
  {
    name: "Groundnut",
    N: [20, 40], P: [30, 50], K: [20, 40],
    temp: [25, 35], humidity: [50, 70], ph: [5.5, 7.0], rainfall: [50, 80],
    irrigated: true, rainfed: true,
    yield: 15, price: 5500, cost_pct: 0.4,
    tip: "Harvest when 75% of pods are mature.",
  },
];

// Soil database for Soil Analysis
const SOIL_DATABASE = {
  Alluvial: {
    color: "Light grey to ash grey",
    texture: "Sandy loam to clay loam",
    drainage: "Well-drained",
    phRange: "6.5 - 8.0",
    crops: ["Rice", "Wheat", "Sugarcane", "Maize", "Cotton"],
  },
  Black: {
    color: "Deep black to dark grey",
    texture: "Clayey and compact",
    drainage: "Poor (high water retention)",
    phRange: "7.2 - 8.5",
    crops: ["Cotton", "Sorghum", "Wheat", "Sugarcane", "Groundnut"],
  },
  Red: {
    color: "Red to reddish-brown",
    texture: "Sandy to clayey",
    drainage: "Moderate",
    phRange: "5.5 - 7.0",
    crops: ["Millets", "Groundnut", "Potato", "Maize", "Pulses"],
  },
  Laterite: {
    color: "Reddish-brown",
    texture: "Coarse and gravelly",
    drainage: "Excessive",
    phRange: "5.0 - 6.5",
    crops: ["Tea", "Coffee", "Cashew", "Rubber", "Coconut"],
  },
  Sandy: {
    color: "Light yellow to brown",
    texture: "Sandy",
    drainage: "Excessive",
    phRange: "5.5 - 7.5",
    crops: ["Watermelon", "Muskmelon", "Groundnut", "Sorghum", "Millets"],
  },
  Clay: {
    color: "Grey to brown",
    texture: "Clayey",
    drainage: "Poor",
    phRange: "6.0 - 8.0",
    crops: ["Rice", "Wheat", "Sugarcane", "Cotton", "Soybean"],
  },
  Loamy: {
    color: "Dark brown",
    texture: "Loam",
    drainage: "Well-drained",
    phRange: "6.0 - 7.5",
    crops: ["Wheat", "Maize", "Potato", "Vegetables", "Pulses"],
  },
  Peaty: {
    color: "Dark brown to black",
    texture: "Spongy and organic",
    drainage: "Poor",
    phRange: "4.5 - 6.0",
    crops: ["Rice", "Vegetables", "Tea", "Coffee", "Fruits"],
  },
};

// Safe crops logic for Risk Assessment
const getSafeCrops = (risks) => {
  const levels = Object.fromEntries(risks.map((r) => [r.name, r.level]));
  const crops = [];
  if (levels["Flood Risk"] === "HIGH") {
    crops.push({ name: "Rice (Paddy)", reason: "Thrives in waterlogged conditions and tolerates excess moisture." });
    crops.push({ name: "Jute", reason: "Grows well in high-moisture and humid environments." });
  }
  if (levels["Drought Risk"] === "HIGH") {
    crops.push({ name: "Pearl Millet (Bajra)", reason: "Highly drought-tolerant and requires minimal water." });
    crops.push({ name: "Sorghum (Jowar)", reason: "Deep root system helps survive prolonged dry spells." });
  }
  if (levels["Heat Stress"] === "HIGH" || levels["Heat Stress"] === "MEDIUM") {
    crops.push({ name: "Finger Millet (Ragi)", reason: "Heat-tolerant and nutritious grain suitable for hot climates." });
    crops.push({ name: "Sesame (Til)", reason: "Performs well under high temperature and low rainfall." });
  }
  if (levels["Frost Risk"] === "HIGH" || levels["Frost Risk"] === "MEDIUM") {
    crops.push({ name: "Wheat", reason: "Cold-hardy crop that tolerates low temperatures well." });
    crops.push({ name: "Mustard", reason: "Grows well in cool weather and withstands light frost." });
  }
  if (crops.length === 0) {
    crops.push(
      { name: "Wheat", reason: "Versatile crop suitable for moderate conditions." },
      { name: "Rice (Paddy)", reason: "Stable choice with favorable weather conditions." },
      { name: "Maize", reason: "Good yield potential in current low-risk conditions." },
      { name: "Pulses (Moong/Urad)", reason: "Short-duration crops ideal when conditions are favorable." }
    );
  }
  const seen = new Set();
  return crops.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  }).slice(0, 4);
};

// GET /api/reference/expense-categories
router.get("/expense-categories", (req, res) => {
  res.json({ categories: CATEGORIES });
});

// GET /api/reference/plan-crops
router.get("/plan-crops", (req, res) => {
  res.json({ crops: PLAN_CROPS });
});

// GET /api/reference/seasons
router.get("/seasons", (req, res) => {
  res.json({ seasons: SEASONS });
});

// POST /api/reference/safe-crops
router.post("/safe-crops", (req, res) => {
  const { risks } = req.body;
  if (!risks || !Array.isArray(risks)) {
    return res.status(400).json({ message: "risks array is required" });
  }
  const safeCrops = getSafeCrops(risks);
  res.json({ safeCrops });
});

// GET /api/reference/soil-database
router.get("/soil-database", (req, res) => {
  res.json({ soilDatabase: SOIL_DATABASE });
});

// GET /api/reference/soil-presets
router.get("/soil-presets", (req, res) => {
  res.json({ soilPresets: SOIL_PRESETS });
});

// GET /api/reference/crops
router.get("/crops", (req, res) => {
  res.json({ crops: CROPS });
});

// Input Advisor crop requirements
const INPUT_CROP_REQUIREMENTS = {
  Wheat: [
    { inputName: "Seed", displayName: "Wheat Seeds", qtyPerAcre: 40, unit: "kg" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 50, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 60, unit: "kg" },
    { inputName: "Zinc Sulphate", displayName: "Micronutrient Fertilizer", qtyPerAcre: 10, unit: "kg" },
  ],
  Rice: [
    { inputName: "Seed", displayName: "Rice Seeds", qtyPerAcre: 25, unit: "kg" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 45, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 80, unit: "kg" },
    { inputName: "MOP", displayName: "Potash Fertilizer", qtyPerAcre: 30, unit: "kg" },
  ],
  Maize: [
    { inputName: "Seed", displayName: "Maize Seeds", qtyPerAcre: 20, unit: "kg" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 55, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 70, unit: "kg" },
    { inputName: "Zinc Sulphate", displayName: "Micronutrient Fertilizer", qtyPerAcre: 12, unit: "kg" },
  ],
  Cotton: [
    { inputName: "Seed", displayName: "Cotton Seeds", qtyPerAcre: 3, unit: "kg" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 40, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 50, unit: "kg" },
    { inputName: "MOP", displayName: "Potash Fertilizer", qtyPerAcre: 25, unit: "kg" },
  ],
  Sugarcane: [
    { inputName: "Setts", displayName: "Sugarcane Setts", qtyPerAcre: 25000, unit: "buds" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 60, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 100, unit: "kg" },
    { inputName: "MOP", displayName: "Potash Fertilizer", qtyPerAcre: 40, unit: "kg" },
  ],
  Potato: [
    { inputName: "Seed", displayName: "Potato Seeds", qtyPerAcre: 800, unit: "kg" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 50, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 60, unit: "kg" },
    { inputName: "MOP", displayName: "Potash Fertilizer", qtyPerAcre: 50, unit: "kg" },
  ],
  Soybean: [
    { inputName: "Seed", displayName: "Soybean Seeds", qtyPerAcre: 30, unit: "kg" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 40, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 20, unit: "kg" },
  ],
  Groundnut: [
    { inputName: "Seed", displayName: "Groundnut Seeds", qtyPerAcre: 50, unit: "kg" },
    { inputName: "SSP", displayName: "Root Booster Fertilizer", qtyPerAcre: 100, unit: "kg" },
    { inputName: "Gypsum", displayName: "Soil Conditioner", qtyPerAcre: 200, unit: "kg" },
  ],
};

// GET /api/reference/input-crop-requirements
router.get("/input-crop-requirements", (req, res) => {
  res.json({ cropRequirements: INPUT_CROP_REQUIREMENTS });
});

// Risk computation logic for Risk Assessment
const computeRisks = (current, forecast) => {
  const temp = current.main?.temp ?? 25;
  const humidity = current.main?.humidity ?? 50;
  const totalRainMm = forecast.reduce((sum, item) => sum + (item.rain?.["3h"] || 0), 0) || 0;
  const hasRainForecast = totalRainMm > 0;

  const lvl = (high, mid) => totalRainMm > high ? "HIGH" : totalRainMm > mid ? "MEDIUM" : "LOW";

  let floodLevel = "LOW", floodDesc = "No significant rainfall expected. Fields are safe.", floodAction = "Continue normal operations and monitor weather updates.";
  if (totalRainMm > 200) { floodLevel = "HIGH"; floodDesc = `Heavy rainfall forecast (${Math.round(totalRainMm)}mm). Waterlogging and flooding likely.`; floodAction = "Clear drainage channels immediately. Move livestock to higher ground. Avoid low-lying fields."; }
  else if (totalRainMm > 100) { floodLevel = "MEDIUM"; floodDesc = `Moderate rainfall expected (${Math.round(totalRainMm)}mm). Some waterlogging possible.`; floodAction = "Ensure drainage systems are functioning. Delay sowing in flood-prone areas."; }

  let droughtLevel = "LOW", droughtDesc = "Adequate moisture levels detected. No drought concern.", droughtAction = "Maintain regular irrigation schedule.";
  if (humidity < 30 && !hasRainForecast) { droughtLevel = "HIGH"; droughtDesc = `Very low humidity (${humidity}%) with no rain forecast. Severe moisture deficit likely.`; floodAction = "Increase irrigation frequency. Apply mulch to retain soil moisture. Consider drought-resistant varieties."; }
  else if (humidity < 50) { droughtLevel = "MEDIUM"; droughtDesc = `Below-average humidity (${humidity}%). Moderate moisture stress possible.`; droughtAction = "Monitor soil moisture closely. Schedule supplemental irrigation if needed."; }

  let heatLevel = "LOW", heatDesc = "Temperature is within a safe range for most crops.", heatAction = "No special measures needed. Continue regular field work.";
  if (temp > 40) { heatLevel = "HIGH"; heatDesc = `Extreme temperature (${Math.round(temp)}°C). Crop wilting and heat damage expected.`; heatAction = "Irrigate early morning and late evening. Provide shade for nurseries. Avoid midday field work."; }
  else if (temp > 35) { heatLevel = "MEDIUM"; heatDesc = `Elevated temperature (${Math.round(temp)}°C). Some heat-sensitive crops may be affected.`; heatAction = "Increase watering frequency. Monitor for signs of heat stress in crops."; }

  let frostLevel = "LOW", frostDesc = "No frost risk at current temperatures.", frostAction = "No protective measures required.";
  if (temp < 5) { frostLevel = "HIGH"; frostDesc = `Near-freezing temperature (${Math.round(temp)}°C). Frost damage to crops is highly likely.`; frostAction = "Cover sensitive crops with row covers or mulch. Avoid sowing frost-sensitive varieties. Use smudge pots if available."; }
  else if (temp < 10) { frostLevel = "MEDIUM"; frostDesc = `Cool temperature (${Math.round(temp)}°C). Light frost possible during early morning.`; frostAction = "Monitor overnight temperatures. Prepare frost covers for vulnerable crops."; }

  const allRisks = [
    { name: "Flood Risk", icon: "Droplets", level: floodLevel, description: floodDesc, action: floodAction },
    { name: "Drought Risk", icon: "Sun", level: droughtLevel, description: droughtDesc, action: droughtAction },
    { name: "Heat Stress", icon: "Thermometer", level: heatLevel, description: heatDesc, action: heatAction },
    { name: "Frost Risk", icon: "Snowflake", level: frostLevel, description: frostDesc, action: frostAction },
  ];
  
  return allRisks.filter(risk => risk.level !== "LOW");
};

// POST /api/reference/compute-risks
router.post("/compute-risks", (req, res) => {
  const { current, forecast } = req.body;
  if (!current || !forecast) {
    return res.status(400).json({ message: "current and forecast data are required" });
  }
  const risks = computeRisks(current, forecast);
  res.json({ risks });
});

module.exports = router;

const referenceData = require("../data/referenceData");
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


const getExpenseCategories = (req, res) => res.json({ categories: referenceData.CATEGORIES });
const getPlanCrops = (req, res) => res.json({ crops: referenceData.PLAN_CROPS });
const getSeasons = (req, res) => res.json({ seasons: referenceData.SEASONS });
const getSoilDatabase = (req, res) => res.json({ soilDatabase: referenceData.SOIL_DATABASE });
const getSoilPresets = (req, res) => res.json({ soilPresets: referenceData.SOIL_PRESETS });
const getCrops = (req, res) => res.json({ crops: referenceData.CROPS });
const getInputCropRequirements = (req, res) => res.json({ cropRequirements: referenceData.INPUT_CROP_REQUIREMENTS });

const calculateSafeCrops = (req, res) => {
  const { risks } = req.body;
  if (!risks || !Array.isArray(risks)) {
    return res.status(400).json({ message: "risks array is required" });
  }
  const safeCrops = getSafeCrops(risks);
  res.json({ safeCrops });
};

const calculateRisks = (req, res) => {
  const { current, forecast } = req.body;
  if (!current || !forecast) {
    return res.status(400).json({ message: "current and forecast data are required" });
  }
  const risks = computeRisks(current, forecast);
  res.json({ risks });
};

const referenceService = require("../services/referenceService");

const chooseCrop = async (req, res) => {
  try {
    const { crop, district } = req.body;
    if (!crop || !district) {
      return res.status(400).json({ message: "crop and district are required" });
    }

    const choice = await referenceService.recordCropChoice(req.user.id, crop, district);
    res.json({ message: "Crop choice recorded successfully", choice });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("Choose crop error:", err.message);
    res.status(500).json({ message: "Failed to record crop choice" });
  }
};

const getDistrictCropCounts = async (req, res) => {
  try {
    const { district } = req.query;
    if (!district) {
      return res.status(400).json({ message: "district is required" });
    }

    const result = await referenceService.getDistrictCounts(district);
    res.json(result);
  } catch (err) {
    console.error("Get crop counts error:", err.message);
    res.status(500).json({ message: "Failed to load district crop statistics" });
  }
};

const getUserChosenCrop = async (req, res) => {
  try {
    const choice = await referenceService.getUserChoice(req.user.id);
    res.json({ choice });
  } catch (err) {
    console.error("Get user chosen crop error:", err.message);
    res.status(500).json({ message: "Failed to fetch user crop choice" });
  }
};

module.exports = {
  getExpenseCategories,
  getPlanCrops,
  getSeasons,
  getSoilDatabase,
  getSoilPresets,
  getCrops,
  getInputCropRequirements,
  calculateSafeCrops,
  calculateRisks,
  chooseCrop,
  getDistrictCropCounts,
  getUserChosenCrop
};

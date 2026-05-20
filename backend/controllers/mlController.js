/**
 * mlController.js  –  Proxies ML requests from the Node backend to the Python FastAPI ml-service.
 *
 * Endpoints exposed:
 *   POST /api/ml/predict/soil   → multipart image  → FastAPI /predict/soil
 *   POST /api/ml/predict/crop   → JSON body        → FastAPI /predict/crop
 *   POST /api/ml/predict/price  → JSON body        → FastAPI /predict/price
 *   GET  /api/ml/health         → FastAPI /
 */

const axios = require("axios");
const FormData = require("form-data");

const ML_BASE = () => process.env.ML_SERVICE_URL || "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────
// HELPER — generic JSON proxy
// ─────────────────────────────────────────────────────────────────
const proxyJSON = async (mlPath, body, res) => {
  try {
    const { data } = await axios.post(`${ML_BASE()}${mlPath}`, body, {
      timeout: 30_000,
      headers: { "Content-Type": "application/json" },
    });
    return res.json(data);
  } catch (err) {
    const status  = err.response?.status  || 502;
    const message = err.response?.data?.detail || err.message || "ML service error";
    console.error(`[ML Proxy] ${mlPath} failed:`, message);
    return res.status(status).json({ message });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/ml/predict/soil
// Expects: multipart/form-data with field "file" (image)
// Returns: { soil_type, confidence, all_scores }
// ─────────────────────────────────────────────────────────────────
const predictSoil = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded. Use field name 'file'." });
  }

  try {
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename:    req.file.originalname,
      contentType: req.file.mimetype,
    });

    const { data } = await axios.post(`${ML_BASE()}/predict/soil`, form, {
      headers: { ...form.getHeaders() },
      timeout: 30_000,
      maxContentLength: Infinity,
      maxBodyLength:    Infinity,
    });

    // Normalise: "Alluvial_Soil" → "Alluvial"
    const raw = data.soil_type || "";
    data.soil_type_clean = raw.replace(/_Soil$/i, "").replace(/_/g, " ");

    return res.json(data);
  } catch (err) {
    const status  = err.response?.status  || 502;
    const message = err.response?.data?.detail || err.message || "Soil ML service error";
    console.error("[ML Proxy] /predict/soil failed:", message);
    return res.status(status).json({ message });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /api/ml/predict/crop
// Body: { soil_type, temperature, humidity, rainfall }
// Returns: { soil_type, crops: [{ crop, score }] }
// ─────────────────────────────────────────────────────────────────
const predictCrop = async (req, res) => {
  let { soil_type, temperature, humidity, rainfall } = req.body;
  if (!soil_type || temperature == null || humidity == null || rainfall == null) {
    return res.status(400).json({
      message: "Required fields: soil_type, temperature, humidity, rainfall",
    });
  }

  // Normalise: "Alluvial" → "Alluvial_Soil" (ML npk.json uses _Soil suffix)
  if (!soil_type.endsWith("_Soil")) {
    soil_type = soil_type.replace(/\s+/g, "_") + "_Soil";
  }

  return proxyJSON("/predict/crop", { soil_type, temperature, humidity, rainfall }, res);
};


// ─────────────────────────────────────────────────────────────────
// POST /api/ml/predict/price
// Body: { crop_name, harvest_date }   (harvest_date: YYYY-MM-DD)
// Returns: { crop, harvest_date, predicted_price, lower_bound, upper_bound, confidence_level }
// ─────────────────────────────────────────────────────────────────
const predictPriceML = async (req, res) => {
  const { crop_name, harvest_date } = req.body;
  if (!crop_name || !harvest_date) {
    return res.status(400).json({ message: "Required fields: crop_name, harvest_date (YYYY-MM-DD)" });
  }
  return proxyJSON("/predict/price", { crop_name, harvest_date }, res);
};

// ─────────────────────────────────────────────────────────────────
// GET /api/ml/health
// ─────────────────────────────────────────────────────────────────
const mlHealth = async (req, res) => {
  try {
    const { data } = await axios.get(`${ML_BASE()}/`, { timeout: 5000 });
    return res.json({ backend: "ok", ml_service: data });
  } catch (err) {
    return res.status(502).json({ backend: "ok", ml_service: "unreachable", error: err.message });
  }
};

module.exports = { predictSoil, predictCrop, predictPriceML, mlHealth };

/**
 * routes/ml.js  –  ML proxy routes
 *
 * All routes are protected by the JWT auth middleware.
 * The /predict/soil route uses multer (memory storage) to receive the image.
 */

const express  = require("express");
const router   = express.Router();
const upload = require("../middleware/upload");
const protect  = require("../middleware/auth");
const { predictSoil, predictCrop, predictPriceML, mlHealth } = require("../controllers/mlController");
const { predictLimiter } = require("../middleware/rateLimiter");

// GET  /api/ml/health
router.get("/health", mlHealth);

// POST /api/ml/predict/soil   — multipart image
router.post("/predict/soil",  predictLimiter, protect, upload.single("file"), predictSoil);

// POST /api/ml/predict/crop   — JSON
router.post("/predict/crop",  predictLimiter, protect, predictCrop);

// POST /api/ml/predict/price  — JSON  { crop_name, harvest_date }
router.post("/predict/price", predictLimiter, protect, predictPriceML);

module.exports = router;

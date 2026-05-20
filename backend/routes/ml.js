/**
 * routes/ml.js  –  ML proxy routes
 *
 * All routes are protected by the JWT auth middleware.
 * The /predict/soil route uses multer (memory storage) to receive the image.
 */

const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const protect  = require("../middleware/auth");
const { predictSoil, predictCrop, predictPriceML, mlHealth } = require("../controllers/mlController");

// multer — store image in memory, max 10 MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
    }
  },
});

// GET  /api/ml/health
router.get("/health", mlHealth);

// POST /api/ml/predict/soil   — multipart image
router.post("/predict/soil",  protect, upload.single("file"), predictSoil);

// POST /api/ml/predict/crop   — JSON
router.post("/predict/crop",  protect, predictCrop);

// POST /api/ml/predict/price  — JSON  { crop_name, harvest_date }
router.post("/predict/price", protect, predictPriceML);

module.exports = router;

const express  = require("express");
const router   = express.Router();
const protect  = require("../middleware/auth");
const {
  getDistricts,
  getLivePrices,
  getBestMandis,
  predictPrice,
} = require("../controllers/marketController");

// GET  /api/market/districts?state=Uttar Pradesh
router.get("/districts",    protect, getDistricts);

// GET  /api/market/live-prices?crop=Tomato&state=Uttar Pradesh
router.get("/live-prices",  protect, getLivePrices);

// POST /api/market/best-mandis  { crop, quantity, state, district }
router.post("/best-mandis", protect, getBestMandis);

// POST /api/market/predict      { crop, state, season, year }
router.post("/predict",     protect, predictPrice);

module.exports = router;

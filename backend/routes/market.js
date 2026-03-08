const express  = require("express");
const router   = express.Router();
const protect  = require("../middleware/auth");
const {
  getDistricts,
  getLivePrices,
  getBestMandis,
} = require("../controllers/marketController");

// GET /api/market/districts?state=Uttar Pradesh
router.get("/districts",    protect, getDistricts);

// GET /api/market/live-prices?commodity=Wheat&state=UP&district=Lucknow
router.get("/live-prices",  protect, getLivePrices);

// POST /api/market/best-mandis  { crop, quantity, state, district }
router.post("/best-mandis", protect, getBestMandis);

module.exports = router;

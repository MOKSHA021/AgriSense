const express = require("express");
const router = express.Router();
const { getBestMandis } = require("../controllers/marketController");
const protect = require("../middleware/auth");   // ← JWT check

// POST /api/market/best-mandis
router.post("/best-mandis", protect, getBestMandis);

module.exports = router;

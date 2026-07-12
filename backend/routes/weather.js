const express = require("express");
const router = express.Router();
const { getFarmForecast } = require("../controllers/weatherController");

router.get("/farm-forecast", getFarmForecast);

module.exports = router;

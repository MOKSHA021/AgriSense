const express = require("express");
const auth = require("../middleware/auth");
const { listCrops, recommendInputs } = require("../controllers/inputAdvisorController");

const router = express.Router();
router.get("/crops", auth, listCrops);
router.post("/recommend", auth, recommendInputs);

module.exports = router;

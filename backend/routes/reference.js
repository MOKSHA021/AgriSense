const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
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
} = require("../controllers/referenceController");

router.get("/expense-categories", getExpenseCategories);
router.get("/plan-crops", getPlanCrops);
router.get("/seasons", getSeasons);
router.get("/soil-database", getSoilDatabase);
router.get("/soil-presets", getSoilPresets);
router.get("/crops", getCrops);
router.get("/input-crop-requirements", getInputCropRequirements);

router.post("/safe-crops", calculateSafeCrops);
router.post("/compute-risks", calculateRisks);

router.post("/choose-crop", auth, chooseCrop);
router.get("/district-crop-counts", getDistrictCropCounts);
router.get("/user-chosen-crop", auth, getUserChosenCrop);

module.exports = router;

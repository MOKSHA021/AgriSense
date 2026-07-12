const {
  InputAdvisorError,
  getSupportedCrops,
  getRecommendations
} = require("../services/inputAdvisorService");

const listCrops = (req, res) => {
  res.json({ crops: getSupportedCrops() });
};

const recommendInputs = async (req, res) => {
  try {
    const { crop, area, location = "", inStockOnly = false } = req.body;
    const result = await getRecommendations(crop, area, location, inStockOnly);
    res.json(result);
  } catch (err) {
    if (err instanceof InputAdvisorError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("Input advisor error:", err.message);
    res.status(500).json({ message: "Failed to build input recommendations" });
  }
};

module.exports = { listCrops, recommendInputs };

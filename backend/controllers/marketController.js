const {
  MarketServiceError,
  fetchDistricts,
  fetchLivePrices,
  fetchBestMandis,
  getPricePrediction
} = require("../services/marketService");

const getDistricts = async (req, res) => {
  try {
    const { state } = req.query;
    const result = await fetchDistricts(state);
    res.json(result);
  } catch (err) {
    if (err instanceof MarketServiceError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("[Districts]", err.message);
    res.status(500).json({ message: "Failed to fetch districts" });
  }
};

const getLivePrices = async (req, res) => {
  try {
    const { crop, state, district } = req.query;
    const result = await fetchLivePrices(crop, state, district);
    res.json(result);
  } catch (err) {
    if (err instanceof MarketServiceError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("[LivePrices]", err.message);
    res.status(500).json({ message: "Scraping failed. Try again." });
  }
};

const getBestMandis = async (req, res) => {
  try {
    const { crop, quantity, state, district } = req.body;
    const result = await fetchBestMandis(crop, quantity, state, district);
    res.json(result);
  } catch (err) {
    if (err instanceof MarketServiceError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("[BestMandis]", err.message);
    res.status(500).json({ message: "Failed to fetch mandi data" });
  }
};

const predictPrice = async (req, res) => {
  try {
    const { crop, state, district, season, year } = req.body;
    const result = await getPricePrediction(crop, state, district, season, year);
    res.json(result);
  } catch (err) {
    if (err instanceof MarketServiceError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("[Predict]", err.message);
    res.status(500).json({ message: "Prediction failed. Try again." });
  }
};

module.exports = { getDistricts, getLivePrices, getBestMandis, predictPrice };

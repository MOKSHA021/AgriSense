const axios = require("axios");
const { MANDI_DATA, TRANSPORT_COST } = require("../data/mandiData");
const { scrapeVegetablePrices } =require("../services/scraper")

// ─────────────────────────────────────
// HELPER — fetch from data.gov.in
// ─────────────────────────────────────
const fetchFromAPI = async (filters = {}, limit = 20) => {
  const DATA_GOV_URL = `https://api.data.gov.in/resource/${process.env.DATA_GOV_RESOURCE_ID}`;
  const API_KEY      = process.env.DATA_GOV_API_KEY;

  const params = { "api-key": API_KEY, format: "json", limit };
  Object.entries(filters).forEach(([key, val]) => {
    params[`filters[${key}]`] = val;
  });

  const response = await axios.get(DATA_GOV_URL, { params });
  return response.data.records || [];
};

// ─────────────────────────────────────
// HELPER — normalize data.gov.in fields
// ─────────────────────────────────────
const cleanRecord = (r) => ({
  state:      r.State,
  district:   r.District,
  market:     r.Market,
  commodity:  r.Commodity,
  variety:    r.Variety,
  grade:      r.Grade,
  date:       r.Arrival_Date,
  minPrice:   Number(r.Min_Price)   || 0,
  maxPrice:   Number(r.Max_Price)   || 0,
  modalPrice: Number(r.Modal_Price) || 0,
});

// ─────────────────────────────────────
// CONTROLLER 1 — GET /api/market/districts
// ─────────────────────────────────────
const getDistricts = async (req, res) => {
  const { state } = req.query;
  if (!state) return res.status(400).json({ message: "state is required" });

  try {
    const records   = await fetchFromAPI({ State: state }, 1000);
    if (!records.length)
      return res.status(404).json({ message: `No data found for state: ${state}` });

    const districts = [...new Set(records.map((r) => r.District))]
      .filter(Boolean)
      .sort();

    res.json({ districts, state });
  } catch (err) {
    console.error("[Districts]", err.message);
    res.status(500).json({ message: "Failed to fetch districts" });
  }
};

// ─────────────────────────────────────
// CONTROLLER 2 — GET /api/market/live-prices
// Uses todaypricerates.com scraper
// Only needs: crop + state
// ─────────────────────────────────────
const getLivePrices = async (req, res) => {
  const { crop, state } = req.query;

  if (!crop || !state)
    return res.status(400).json({ message: "crop and state are required" });

  try {
    const scraped = await scrapeVegetablePrices(state, crop);

    if (!scraped.length)
      return res.status(404).json({ message: `No price found for ${crop} in ${state}` });

    // ── Reshape to match frontend expectations ──
    const prices   = scraped.map((r) => r.modalPrice).filter(Boolean);
    const avgModal = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    res.json({
      markets:  scraped,           // array of price objects
      avgModal,                    // avg modal price
      minPrice: Math.min(...scraped.map((r) => r.minPrice)),
      maxPrice: Math.max(...scraped.map((r) => r.maxPrice)),
      crop,
      state,
      source: "todaypricerates",
    });

  } catch (err) {
    console.error("[LivePrices]", err.message);
    res.status(500).json({ message: "Scraping failed. Try again." });
  }
};

// ─────────────────────────────────────
// CONTROLLER 3 — POST /api/market/best-mandis
// ─────────────────────────────────────
const getBestMandis = async (req, res) => {
  const { crop, quantity, state, district } = req.body; // ← no farmerLat/Lng needed

  if (!crop || !quantity || !state || !district)
    return res.status(400).json({ message: "crop, quantity, state and district are required" });

  try {
    const records = await fetchFromAPI(
      { State: state, District: district, Commodity: crop }, 100
    );

    let mandis = [];

    if (records.length > 0) {
      records.sort((a, b) => {
        const toDate = (str) => { const [d, m, y] = str.split("/"); return new Date(`${y}-${m}-${d}`); };
        return toDate(b.Arrival_Date) - toDate(a.Arrival_Date);
      });

      const seenMarkets = new Set();
      const latestRecords = records.filter((r) => {
        if (seenMarkets.has(r.Market)) return false;
        seenMarkets.add(r.Market);
        return true;
      });

      mandis = latestRecords
        .map(cleanRecord)
        .filter((r) => r.modalPrice > 0)
        .map((r) => ({
          name:         r.market,
          district:     r.district,
          variety:      r.variety,
          grade:        r.grade,
          date:         r.date,
          lat:          null,   // frontend will geocode via Nominatim
          lng:          null,
          pricePerUnit: r.modalPrice,
          isRealData:   true,
        }))
        .sort((a, b) => b.pricePerUnit - a.pricePerUnit); // sort by price for now

    } else {
      const mockMandis = MANDI_DATA[state] || [];
      mandis = mockMandis
        .filter((m) => m.prices[crop])
        .map((m) => ({
          name:         m.name,
          district:     m.district,
          lat:          m.lat || null,
          lng:          m.lng || null,
          pricePerUnit: m.prices[crop],
          isRealData:   false,
        }))
        .sort((a, b) => b.pricePerUnit - a.pricePerUnit);
    }

    if (!mandis.length)
      return res.status(404).json({ message: "No mandi data found" });

    res.json({ mandis, crop, quantity, state, district });

  } catch (err) {
    console.error("[BestMandis]", err.message);
    res.status(500).json({ message: "Failed to fetch mandi data" });
  }
};


// ─────────────────────────────────────
// CONTROLLER 4 — POST /api/market/predict
// ─────────────────────────────────────
const predictPrice = async (req, res) => {
  const { crop, state, season, year } = req.body;

  if (!crop || !state || !season || !year)
    return res.status(400).json({ message: "crop, state, season and year are required" });

  try {
    const records = await fetchFromAPI({ State: state, Commodity: crop }, 100);
    if (!records.length)
      return res.status(404).json({ message: `No historical data for ${crop} in ${state}` });

    const cleaned = records.map(cleanRecord);
    const prices  = cleaned.map((r) => r.modalPrice).filter((p) => p > 0);
    if (!prices.length)
      return res.status(404).json({ message: "No valid prices found" });

    const avg    = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const stdDev = Math.round(Math.sqrt(
      prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length
    ));

    const seasonMultiplier = { Kharif: 1.05, Rabi: 0.97, Zaid: 1.02 };
    const inflationMult    = Math.pow(1.02, Number(year) - 2024);
    const predicted_price  = Math.round(avg * (seasonMultiplier[season] || 1.0) * inflationMult);

    res.json({
      predicted_price,
      min_price:   Math.round(predicted_price - stdDev),
      max_price:   Math.round(predicted_price + stdDev),
      confidence:  Math.min(95, Math.round(100 - (stdDev / avg) * 100)),
      advice: {
        Kharif: `Kharif season sees higher ${crop} demand. Sell in Oct–Nov for peak rates.`,
        Rabi:   `Rabi brings moderate prices. Early March sales yield better returns.`,
        Zaid:   `Zaid is a short season — ${crop} prices can be volatile. Monitor weekly.`,
      }[season] || `Based on ${prices.length} historical records from ${state}.`,
      data_points: prices.length,
      crop, state, season, year,
    });

  } catch (err) {
    console.error("[Predict]", err.message);
    res.status(500).json({ message: "Prediction failed. Try again." });
  }
};

module.exports = { getDistricts, getLivePrices, getBestMandis, predictPrice };

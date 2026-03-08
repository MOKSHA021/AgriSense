const axios = require("axios");
const { MANDI_DATA, TRANSPORT_COST } = require("../data/mandiData");

// ─────────────────────────────────────
// HELPER — fetch records from data.gov.in
// env vars read at call time (not module load time)
// ─────────────────────────────────────
const fetchFromAPI = async (filters = {}, limit = 20) => {
  const DATA_GOV_URL = `https://api.data.gov.in/resource/${process.env.DATA_GOV_RESOURCE_ID}`;
  const API_KEY      = process.env.DATA_GOV_API_KEY;

  console.log("URL:", DATA_GOV_URL);
  console.log("KEY:", API_KEY ? "✅ loaded" : "❌ MISSING");

  const params = {
    "api-key": API_KEY,
    format:    "json",
    limit,
  };

  Object.entries(filters).forEach(([key, val]) => {
    params[`filters[${key}]`] = val;
  });

  const response = await axios.get(DATA_GOV_URL, { params });
  return response.data.records || [];
};

// ─────────────────────────────────────
// HELPER — normalize field names
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
// Called when user picks a state in Market.jsx
// Returns all unique districts for that state
// ─────────────────────────────────────
const getDistricts = async (req, res) => {
  const { state } = req.query;

  if (!state) {
    return res.status(400).json({ message: "state is required" });
  }

  try {
    const records = await fetchFromAPI({ State: state }, 1000);

    console.log(`[Districts] State: ${state} | Records: ${records.length}`);

    if (!records.length) {
      return res.status(404).json({ message: `No data found for state: ${state}` });
    }

    const districts = [...new Set(records.map((r) => r.District))]
      .filter(Boolean)
      .sort();

    console.log(`[Districts] Found ${districts.length} districts:`, districts);

    res.json({ districts, state });

  } catch (err) {
    console.error("[Districts] Error:", err.message);
    res.status(500).json({ message: "Failed to fetch districts" });
  }
};

// ─────────────────────────────────────
// CONTROLLER 2 — GET /api/market/live-prices
// Tab 2: real prices for crop+state+district
// ─────────────────────────────────────
const getLivePrices = async (req, res) => {
  const { commodity, state, district } = req.query;

  if (!commodity || !state || !district) {
    return res.status(400).json({
      message: "commodity, state and district are required"
    });
  }

  try {
    const records = await fetchFromAPI(
      { State: state, District: district, Commodity: commodity },
      20
    );

    if (!records.length) {
      return res.status(404).json({
        message: `No data found for ${commodity} in ${district}, ${state}`
      });
    }

    const cleaned  = records.map(cleanRecord);
    const prices   = cleaned.map((r) => r.modalPrice).filter((p) => p > 0);
    const avgModal = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

    res.json({
      markets:  cleaned,
      avgModal,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      commodity, state, district,
    });

  } catch (err) {
    console.error("[LivePrices] Error:", err.message);
    res.status(500).json({ message: "Failed to fetch live prices" });
  }
};

// ─────────────────────────────────────
// CONTROLLER 3 — POST /api/market/best-mandis
// Tab 1: ranked mandis with revenue calc
// ─────────────────────────────────────
const getBestMandis = async (req, res) => {
  const { crop, quantity, state, district } = req.body;

  if (!crop || !quantity || !state || !district) {
    return res.status(400).json({
      message: "crop, quantity, state and district are required"
    });
  }

  try {
    const records = await fetchFromAPI(
      { State: state, District: district, Commodity: crop },
      20
    );

    let mandis = [];

    if (records.length > 0) {
      // ── Real API path ──
      mandis = records
        .map(cleanRecord)
        .filter((r) => r.modalPrice > 0)
        .map((r) => {
          const distanceTier  = "medium";
          const transportCost = TRANSPORT_COST[distanceTier] * quantity;
          const grossRevenue  = r.modalPrice * quantity;
          const netRevenue    = grossRevenue - transportCost;
          return {
            name:         r.market,
            district:     r.district,
            variety:      r.variety,
            grade:        r.grade,
            date:         r.date,
            distanceTier,
            pricePerUnit: r.modalPrice,
            grossRevenue,
            transportCost,
            netRevenue,
            isRealData:   true,
          };
        })
        .sort((a, b) => b.netRevenue - a.netRevenue);

    } else {
      // ── Fallback: mock data if API returns nothing ──
      const mockMandis = MANDI_DATA[state] || [];
      mandis = mockMandis
        .filter((m) => m.prices[crop])
        .map((m) => {
          const pricePerUnit  = m.prices[crop];
          const transportCost = TRANSPORT_COST[m.distanceTier] * quantity;
          const grossRevenue  = pricePerUnit * quantity;
          const netRevenue    = grossRevenue - transportCost;
          return {
            name:         m.name,
            district:     m.district,
            distanceTier: m.distanceTier,
            pricePerUnit, grossRevenue, transportCost, netRevenue,
            isRealData:   false,
          };
        })
        .sort((a, b) => b.netRevenue - a.netRevenue);
    }

    if (!mandis.length) {
      return res.status(404).json({ message: "No mandi data found" });
    }

    mandis[0].isBest = true;

    res.json({ mandis, crop, quantity, state, district });

  } catch (err) {
    console.error("[BestMandis] Error:", err.message);
    res.status(500).json({ message: "Failed to fetch mandi data" });
  }
};

module.exports = { getDistricts, getLivePrices, getBestMandis };

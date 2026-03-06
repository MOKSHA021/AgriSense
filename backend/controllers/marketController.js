const { MANDI_DATA, TRANSPORT_COST } = require("../data/mandiData");

const getBestMandis = (req, res) => {
  const { crop, quantity, state } = req.body;

  // ── Validate inputs ──
  if (!crop || !quantity || !state) {
    return res.status(400).json({ message: "crop, quantity and state are required" });
  }

  const mandis = MANDI_DATA[state];
  if (!mandis) {
    return res.status(404).json({ message: "No mandi data found for this state" });
  }

  // ── Calculate revenue for each mandi ──
  const results = mandis
    .filter((m) => m.prices[crop])           // only mandis that trade this crop
    .map((m) => {
      const pricePerUnit   = m.prices[crop];
      const grossRevenue   = pricePerUnit * quantity;
      const transportCost  = TRANSPORT_COST[m.distanceTier] * quantity;
      const netRevenue     = grossRevenue - transportCost;

      return {
        name:          m.name,
        district:      m.district,
        distanceTier:  m.distanceTier,
        pricePerUnit,
        grossRevenue,
        transportCost,
        netRevenue,
      };
    })
    .sort((a, b) => b.netRevenue - a.netRevenue); // best net revenue first

  // ── Tag the best mandi ──
  if (results.length > 0) results[0].isBest = true;

  res.json({ mandis: results, crop, quantity, state });
};

module.exports = { getBestMandis };

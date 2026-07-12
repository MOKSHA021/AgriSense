const InputInventory = require("../models/InputInventory");

const CROP_REQUIREMENTS = {
  Wheat: [
    { inputName: "Seed", displayName: "Wheat Seeds", qtyPerAcre: 40, unit: "kg" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 50, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 60, unit: "kg" },
    { inputName: "Zinc Sulphate", displayName: "Micronutrient Fertilizer", qtyPerAcre: 10, unit: "kg" },
  ],
  Rice: [
    { inputName: "Seed", displayName: "Rice Seeds", qtyPerAcre: 25, unit: "kg" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 45, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 80, unit: "kg" },
    { inputName: "MOP", displayName: "Potash Fertilizer", qtyPerAcre: 30, unit: "kg" },
  ],
  Maize: [
    { inputName: "Seed", displayName: "Maize Seeds", qtyPerAcre: 20, unit: "kg" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 55, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 70, unit: "kg" },
    { inputName: "Zinc Sulphate", displayName: "Micronutrient Fertilizer", qtyPerAcre: 12, unit: "kg" },
  ],
  Cotton: [
    { inputName: "Seed", displayName: "Cotton Seeds", qtyPerAcre: 3, unit: "kg" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 40, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 50, unit: "kg" },
    { inputName: "MOP", displayName: "Potash Fertilizer", qtyPerAcre: 25, unit: "kg" },
  ],
  Sugarcane: [
    { inputName: "Setts", displayName: "Sugarcane Setts", qtyPerAcre: 25000, unit: "buds" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 60, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 100, unit: "kg" },
    { inputName: "MOP", displayName: "Potash Fertilizer", qtyPerAcre: 40, unit: "kg" },
  ],
  Potato: [
    { inputName: "Seed", displayName: "Potato Seeds", qtyPerAcre: 800, unit: "kg" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 50, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 60, unit: "kg" },
    { inputName: "MOP", displayName: "Potash Fertilizer", qtyPerAcre: 50, unit: "kg" },
  ],
  Soybean: [
    { inputName: "Seed", displayName: "Soybean Seeds", qtyPerAcre: 30, unit: "kg" },
    { inputName: "DAP", displayName: "Root Booster Fertilizer", qtyPerAcre: 40, unit: "kg" },
    { inputName: "Urea", displayName: "Growth Fertilizer", qtyPerAcre: 20, unit: "kg" },
  ],
  Groundnut: [
    { inputName: "Seed", displayName: "Groundnut Seeds", qtyPerAcre: 50, unit: "kg" },
    { inputName: "SSP", displayName: "Root Booster Fertilizer", qtyPerAcre: 100, unit: "kg" },
    { inputName: "Gypsum", displayName: "Soil Conditioner", qtyPerAcre: 200, unit: "kg" },
  ],
};

const SELLERS = [
  { sellerName: "Agri Seeds Hub", district: "Hyderabad", state: "Telangana", distanceKm: 2.3, phone: "9000001001" },
  { sellerName: "Kisan Beej Kendra", district: "Medchal", state: "Telangana", distanceKm: 4.1, phone: "9000001002" },
  { sellerName: "Sri Fertilizers", district: "Hyderabad", state: "Telangana", distanceKm: 1.5, phone: "9000001003" },
  { sellerName: "National Agro Store", district: "Rangareddy", state: "Telangana", distanceKm: 3.7, phone: "9000001004" },
  { sellerName: "Green Valley Inputs", district: "Medchal", state: "Telangana", distanceKm: 5.2, phone: "9000001005" },
  { sellerName: "District Agri Mart", district: "Nashik", state: "Maharashtra", distanceKm: 6.4, phone: "9000001006" },
];

const PRICE_BY_INPUT = {
  Seed: [48, 55, 52],
  DAP: [24, 27, 26],
  Urea: [5.5, 6, 6.2],
  "Zinc Sulphate": [78, 85, 90],
  MOP: [16, 18, 17.5],
  Setts: [0.35, 0.4, 0.42],
  SSP: [7, 8, 8.5],
  Gypsum: [3.5, 4, 4.2],
};

class InputAdvisorError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const buildSeedInventory = () => {
  const docs = [];
  Object.entries(CROP_REQUIREMENTS).forEach(([crop, requirements]) => {
    requirements.forEach((requirement) => {
      SELLERS.slice(0, 4).forEach((seller, index) => {
        const prices = PRICE_BY_INPUT[requirement.inputName] || [30, 32, 34];
        const pricePerUnit = prices[index % prices.length];
        docs.push({
          crop,
          ...requirement,
          ...seller,
          pricePerUnit,
          stockQty: Math.round(
            requirement.qtyPerAcre * (index === 3 ? 1.5 : 25 + index * 10)
          ),
          source: "seed",
        });
      });
    });
  });
  return docs;
};

const ensureSeedInventory = async () => {
  const count = await InputInventory.estimatedDocumentCount();
  if (count > 0) return;
  await InputInventory.insertMany(buildSeedInventory());
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const locationScore = (seller, location) => {
  const needle = normalize(location);
  if (!needle) return 0;
  const district = normalize(seller.district);
  const state = normalize(seller.state);
  if (district && needle.includes(district)) return 2;
  if (state && needle.includes(state)) return 1;
  return 0;
};

const getSupportedCrops = () => {
  return Object.keys(CROP_REQUIREMENTS);
};

const getRecommendations = async (crop, area, location = "", inStockOnly = false) => {
  await ensureSeedInventory();

  const acres = Number(area);
  const requirements = CROP_REQUIREMENTS[crop];

  if (!requirements) {
    throw new InputAdvisorError("Unsupported crop", 400);
  }

  if (!Number.isFinite(acres) || acres <= 0) {
    throw new InputAdvisorError("Area must be greater than 0", 400);
  }

  const inputNames = requirements.map((item) => item.inputName);
  const inventory = await InputInventory.find({
    crop,
    inputName: { $in: inputNames },
  }).lean();

  const recommendations = requirements.map((requirement) => {
    const totalQty = requirement.qtyPerAcre * acres;
    const sellers = inventory
      .filter((item) => item.inputName === requirement.inputName)
      .map((item) => ({
        id: item._id,
        name: item.sellerName,
        district: item.district,
        state: item.state,
        distanceKm: item.distanceKm,
        price: item.pricePerUnit,
        stockQty: item.stockQty,
        inStock: item.stockQty >= totalQty,
        phone: item.phone,
        source: item.source,
        locationScore: locationScore(item, location),
      }))
      .filter((seller) => !inStockOnly || seller.inStock)
      .sort((a, b) => {
        if (Number(b.inStock) !== Number(a.inStock)) return Number(b.inStock) - Number(a.inStock);
        if (b.locationScore !== a.locationScore) return b.locationScore - a.locationScore;
        if (a.price !== b.price) return a.price - b.price;
        return a.distanceKm - b.distanceKm;
      })
      .slice(0, 3);

    const bestSeller = sellers[0] || null;
    return {
      name: requirement.inputName,
      displayName: requirement.displayName,
      qtyPerAcre: requirement.qtyPerAcre,
      unit: requirement.unit,
      totalQty,
      bestPrice: bestSeller?.price || 0,
      cost: bestSeller ? totalQty * bestSeller.price : 0,
      sellers,
    };
  });

  return {
    crop,
    area: acres,
    location,
    recommendations,
    totalCost: recommendations.reduce((sum, item) => sum + item.cost, 0),
    dataSource: "MongoDB inventory seeded with demo seller records",
  };
};

module.exports = {
  InputAdvisorError,
  getSupportedCrops,
  getRecommendations
};

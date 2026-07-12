const axios = require("axios");
const { MANDI_DATA } = require("../data/mandiData");
const { scrapeVegetablePrices } = require("./scraper");

// Custom Error
class MarketServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// ─────────────────────────────────────
// HELPER — fetch from data.gov.in
// ─────────────────────────────────────
const fetchFromAPI = async (filters = {}, limit = 20) => {
  const DATA_GOV_URL = `https://api.data.gov.in/resource/${process.env.DATA_GOV_RESOURCE_ID}`;
  const API_KEY = process.env.DATA_GOV_API_KEY;

  const params = { "api-key": API_KEY, format: "json", limit };
  Object.entries(filters).forEach(([key, val]) => {
    params[`filters[${key}]`] = val;
  });

  const response = await axios.get(DATA_GOV_URL, { params });
  return response.data.records || [];
};

const cleanRecord = (r) => ({
  state: r.State,
  district: r.District,
  market: r.Market,
  commodity: r.Commodity,
  variety: r.Variety,
  grade: r.Grade,
  date: r.Arrival_Date,
  minPrice: Number(r.Min_Price) || 0,
  maxPrice: Number(r.Max_Price) || 0,
  modalPrice: Number(r.Modal_Price) || 0,
});

// ─────────────────────────────────────
// SERVICE FUNCTIONS
// ─────────────────────────────────────

const fetchDistricts = async (state) => {
  if (!state) throw new MarketServiceError("state is required", 400);

  const records = await fetchFromAPI({ State: state }, 1000);
  if (!records.length) {
    throw new MarketServiceError(`No data found for state: ${state}`, 404);
  }

  const districts = [...new Set(records.map((r) => r.District))]
    .filter(Boolean)
    .sort();

  return { districts, state };
};

const fetchLivePrices = async (crop, state, district) => {
  if (!crop || !state) {
    throw new MarketServiceError("crop and state are required", 400);
  }

  let scraped = [];
  let source = "todaypricerates";

  if (district) {
    const records = await fetchFromAPI({ State: state, District: district, Commodity: crop }, 100);
    if (records.length > 0) {
      scraped = records.map((r) => {
        const minPrice = Number(r.Min_Price) || 0;
        const maxPrice = Number(r.Max_Price) || 0;
        const modalPrice = Number(r.Modal_Price) || 0;
        return {
          commodity: r.Commodity,
          unit: "Quintal",
          mandiPrice: modalPrice,
          minPrice: minPrice,
          maxPrice: maxPrice,
          modalPrice: modalPrice,
          priceChange: 0,
          trend: "stable",
          date: r.Arrival_Date,
          state: r.State,
          district: r.District,
          market: r.Market,
          source: "data.gov.in"
        };
      });
      source = "data.gov.in";
    }
  }

  if (!scraped.length) {
    scraped = await scrapeVegetablePrices(state, crop);
    source = "todaypricerates";
  }

  if (!scraped.length) {
    throw new MarketServiceError(`No price found for ${crop} in ${state}`, 404);
  }

  const prices = scraped.map((r) => r.modalPrice).filter(Boolean);
  const avgModal = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  return {
    markets: scraped,
    avgModal,
    minPrice: Math.min(...scraped.map((r) => r.minPrice)),
    maxPrice: Math.max(...scraped.map((r) => r.maxPrice)),
    crop,
    state,
    district: district || null,
    source,
  };
};

const fetchBestMandis = async (crop, quantity, state, district) => {
  if (!crop || !quantity || !state || !district) {
    throw new MarketServiceError("crop, quantity, state and district are required", 400);
  }

  const records = await fetchFromAPI({ State: state, District: district, Commodity: crop }, 100);
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
        name: r.market,
        district: r.district,
        variety: r.variety,
        grade: r.grade,
        date: r.date,
        lat: null,
        lng: null,
        pricePerUnit: r.modalPrice,
        isRealData: true,
      }))
      .sort((a, b) => b.pricePerUnit - a.pricePerUnit);

  } else {
    const mockMandis = MANDI_DATA[state] || [];
    mandis = mockMandis
      .filter((m) => m.prices[crop])
      .map((m) => ({
        name: m.name,
        district: m.district,
        lat: m.lat || null,
        lng: m.lng || null,
        pricePerUnit: m.prices[crop],
        isRealData: false,
      }))
      .sort((a, b) => b.pricePerUnit - a.pricePerUnit);
  }

  if (!mandis.length) {
    throw new MarketServiceError("No mandi data found", 404);
  }

  // Geocode mandis on backend and cache them
  const LocationCache = require("../models/LocationCache");
  for (let i = 0; i < mandis.length; i++) {
    const m = mandis[i];
    if (m.lat && m.lng) continue; // Already geocoded

    // Attempt to geocode by District + State (Mandi names are often too obscure for OSM)
    const query = `${m.district}, ${state}, India`;
    const cached = await LocationCache.findOne({ query });
    if (cached) {
      m.lat = cached.lat;
      m.lng = cached.lng;
    } else {
      try {
        const { data } = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: { format: "json", q: query, limit: 1, countrycodes: "in" },
          headers: { "User-Agent": "AgriSense/1.0" }
        });
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          m.lat = lat;
          m.lng = lng;
          // Use upsert to avoid duplicate key errors if concurrent requests hit it
          await LocationCache.findOneAndUpdate({ query }, { lat, lng }, { upsert: true, new: true });
        }
        await new Promise(r => setTimeout(r, 500)); // Respect Nominatim limits
      } catch (err) {
        console.error("Backend geocoding failed for", query);
      }
    }
  }

  return { mandis, crop, quantity, state, district };
};

const getPricePrediction = async (crop, state, district, season, year) => {
  if (!crop || !state || !season || !year) {
    throw new MarketServiceError("crop, state, season and year are required", 400);
  }

  let records = [];
  if (district) {
    records = await fetchFromAPI({ State: state, District: district, Commodity: crop }, 100);
  }
  
  if (!records.length) {
    records = await fetchFromAPI({ State: state, Commodity: crop }, 100);
  }
  
  if (!records.length) {
    throw new MarketServiceError(`No historical data for ${crop} in ${state}`, 404);
  }

  const cleaned = records.map(cleanRecord);
  const prices  = cleaned.map((r) => r.modalPrice).filter((p) => p > 0);
  if (!prices.length) {
    throw new MarketServiceError("No valid prices found", 404);
  }

  const avg    = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const stdDev = Math.round(Math.sqrt(
    prices.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / prices.length
  ));

  const seasonMultiplier = { Kharif: 1.05, Rabi: 0.97, Zaid: 1.02 };
  const inflationMult    = Math.pow(1.02, Number(year) - 2024);
  const predicted_price  = Math.round(avg * (seasonMultiplier[season] || 1.0) * inflationMult);

  return {
    predicted_price,
    min_price: Math.round(predicted_price - stdDev),
    max_price: Math.round(predicted_price + stdDev),
    confidence: Math.min(95, Math.round(100 - (stdDev / avg) * 100)),
    advice: {
      Kharif: `Kharif season sees higher ${crop} demand. Sell in Oct–Nov for peak rates.`,
      Rabi:   `Rabi brings moderate prices. Early March sales yield better returns.`,
      Zaid:   `Zaid is a short season — ${crop} prices can be volatile. Monitor weekly.`,
    }[season] || `Based on ${prices.length} historical records from ${state}.`,
    data_points: prices.length,
    crop, state, district: district || null, season, year,
  };
};

module.exports = {
  MarketServiceError,
  fetchDistricts,
  fetchLivePrices,
  fetchBestMandis,
  getPricePrediction
};

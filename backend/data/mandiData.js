const MANDI_DATA = {
  "Uttar Pradesh": [
    {
      name: "Lucknow Mandi",
      district: "Lucknow",
      distanceTier: "medium", // near | medium | far
      prices: {
        Wheat: 2310, Rice: 2980, Tomato: 28,
        Onion: 20, Potato: 17, Maize: 1950,
        Soybean: 4200, Cotton: 6300, Mustard: 5200,
      },
    },
    {
      name: "Kanpur Mandi",
      district: "Kanpur",
      distanceTier: "near",
      prices: {
        Wheat: 2280, Rice: 2950, Tomato: 25,
        Onion: 18, Potato: 15, Maize: 1900,
        Soybean: 4100, Cotton: 6200, Mustard: 5100,
      },
    },
    {
      name: "Agra Mandi",
      district: "Agra",
      distanceTier: "far",
      prices: {
        Wheat: 2350, Rice: 3050, Tomato: 30,
        Onion: 22, Potato: 19, Maize: 2000,
        Soybean: 4300, Cotton: 6400, Mustard: 5300,
      },
    },
    {
      name: "Varanasi Mandi",
      district: "Varanasi",
      distanceTier: "far",
      prices: {
        Wheat: 2260, Rice: 2990, Tomato: 26,
        Onion: 19, Potato: 16, Maize: 1920,
        Soybean: 4150, Cotton: 6250, Mustard: 5150,
      },
    },
    {
      name: "Meerut Mandi",
      district: "Meerut",
      distanceTier: "medium",
      prices: {
        Wheat: 2295, Rice: 2970, Tomato: 27,
        Onion: 21, Potato: 18, Maize: 1970,
        Soybean: 4180, Cotton: 6280, Mustard: 5180,
      },
    },
  ],
  "Punjab": [
    {
      name: "Amritsar Mandi",
      district: "Amritsar",
      distanceTier: "medium",
      prices: {
        Wheat: 2400, Rice: 3100, Tomato: 32,
        Onion: 24, Potato: 20, Maize: 2050,
        Soybean: 4350, Cotton: 6500, Mustard: 5400,
      },
    },
    {
      name: "Ludhiana Mandi",
      district: "Ludhiana",
      distanceTier: "near",
      prices: {
        Wheat: 2380, Rice: 3080, Tomato: 30,
        Onion: 23, Potato: 19, Maize: 2020,
        Soybean: 4320, Cotton: 6450, Mustard: 5350,
      },
    },
    {
      name: "Patiala Mandi",
      district: "Patiala",
      distanceTier: "far",
      prices: {
        Wheat: 2420, Rice: 3120, Tomato: 34,
        Onion: 25, Potato: 21, Maize: 2080,
        Soybean: 4380, Cotton: 6550, Mustard: 5450,
      },
    },
  ],
  "Haryana": [
    {
      name: "Karnal Mandi",
      district: "Karnal",
      distanceTier: "near",
      prices: {
        Wheat: 2330, Rice: 3000, Tomato: 29,
        Onion: 21, Potato: 17, Maize: 1980,
        Soybean: 4220, Cotton: 6350, Mustard: 5220,
      },
    },
    {
      name: "Hisar Mandi",
      district: "Hisar",
      distanceTier: "medium",
      prices: {
        Wheat: 2360, Rice: 3030, Tomato: 31,
        Onion: 23, Potato: 18, Maize: 2010,
        Soybean: 4260, Cotton: 6380, Mustard: 5260,
      },
    },
  ],
  "Maharashtra": [
    {
      name: "Pune Mandi",
      district: "Pune",
      distanceTier: "medium",
      prices: {
        Wheat: 2200, Rice: 2900, Tomato: 35,
        Onion: 26, Potato: 22, Maize: 1850,
        Soybean: 4050, Cotton: 6100, Mustard: 5000,
      },
    },
    {
      name: "Nashik Mandi",
      district: "Nashik",
      distanceTier: "near",
      prices: {
        Wheat: 2180, Rice: 2870, Tomato: 38,
        Onion: 28, Potato: 20, Maize: 1820,
        Soybean: 4020, Cotton: 6050, Mustard: 4980,
      },
    },
  ],
};

// Transport cost per distance tier (₹ per quintal)
const TRANSPORT_COST = {
  near:   500,
  medium: 1200,
  far:    2500,
};

module.exports = { MANDI_DATA, TRANSPORT_COST };

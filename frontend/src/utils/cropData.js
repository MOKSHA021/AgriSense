export const SOIL_PRESETS = {
  Alluvial: { N: 80, P: 40, K: 40 },
  Black: { N: 60, P: 30, K: 50 },
  Red: { N: 40, P: 20, K: 30 },
  Laterite: { N: 30, P: 15, K: 25 },
  Sandy: { N: 20, P: 10, K: 15 },
};

export const CROPS = [
  {
    name: "Rice",
    N: [60, 120], P: [20, 60], K: [20, 60],
    temp: [20, 35], humidity: [60, 90], ph: [5.5, 7.0], rainfall: [150, 300],
    irrigated: true, rainfed: true,
    yield: 20, price: 2100, cost_pct: 0.6,
    tip: "Maintain 5 cm standing water during tillering stage.",
  },
  {
    name: "Wheat",
    N: [80, 150], P: [30, 60], K: [20, 50],
    temp: [10, 25], humidity: [40, 70], ph: [6.0, 7.5], rainfall: [50, 100],
    irrigated: true, rainfed: false,
    yield: 18, price: 2275, cost_pct: 0.6,
    tip: "Sow in mid-November for optimal vernalisation.",
  },
  {
    name: "Maize",
    N: [80, 150], P: [30, 60], K: [20, 50],
    temp: [18, 35], humidity: [50, 80], ph: [5.5, 7.5], rainfall: [60, 110],
    irrigated: true, rainfed: true,
    yield: 22, price: 1870, cost_pct: 0.6,
    tip: "Apply nitrogen in three split doses for better cob filling.",
  },
  {
    name: "Sugarcane",
    N: [100, 200], P: [40, 80], K: [40, 80],
    temp: [25, 40], humidity: [60, 90], ph: [6.0, 7.5], rainfall: [100, 200],
    irrigated: true, rainfed: false,
    yield: 350, price: 350, cost_pct: 0.6,
    tip: "Use trench planting method for better ratoon management.",
  },
  {
    name: "Millets",
    N: [20, 60], P: [10, 30], K: [10, 30],
    temp: [25, 40], humidity: [30, 60], ph: [5.0, 7.0], rainfall: [30, 80],
    irrigated: false, rainfed: true,
    yield: 10, price: 2350, cost_pct: 0.55,
    tip: "Ideal for dryland farming; minimal irrigation needed.",
  },
  {
    name: "Sorghum",
    N: [30, 80], P: [15, 40], K: [15, 40],
    temp: [25, 38], humidity: [30, 65], ph: [5.5, 7.5], rainfall: [40, 100],
    irrigated: false, rainfed: true,
    yield: 12, price: 2750, cost_pct: 0.55,
    tip: "Dual-purpose varieties provide both grain and fodder.",
  },
  {
    name: "Potato",
    N: [100, 180], P: [50, 80], K: [60, 100],
    temp: [15, 25], humidity: [60, 85], ph: [5.0, 6.5], rainfall: [50, 80],
    irrigated: true, rainfed: false,
    yield: 100, price: 1200, cost_pct: 0.6,
    tip: "Hill up soil around stems every 2 weeks for higher tuber count.",
  },
  {
    name: "Banana",
    N: [100, 200], P: [30, 60], K: [80, 150],
    temp: [25, 38], humidity: [70, 95], ph: [6.0, 7.5], rainfall: [120, 250],
    irrigated: true, rainfed: false,
    yield: 120, price: 800, cost_pct: 0.6,
    tip: "Desuckering improves bunch weight significantly.",
  },
  {
    name: "Cotton",
    N: [60, 120], P: [20, 50], K: [20, 50],
    temp: [22, 38], humidity: [40, 70], ph: [6.0, 8.0], rainfall: [50, 120],
    irrigated: true, rainfed: true,
    yield: 8, price: 6500, cost_pct: 0.6,
    tip: "Monitor for bollworm infestation during flowering.",
  },
  {
    name: "Groundnut",
    N: [10, 40], P: [20, 50], K: [20, 50],
    temp: [22, 35], humidity: [50, 80], ph: [5.5, 7.0], rainfall: [50, 120],
    irrigated: true, rainfed: true,
    yield: 10, price: 5550, cost_pct: 0.58,
    tip: "Apply gypsum at pegging stage to improve pod filling.",
  },
  {
    name: "Soybean",
    N: [5, 30], P: [30, 60], K: [20, 50],
    temp: [20, 32], humidity: [50, 80], ph: [6.0, 7.5], rainfall: [60, 120],
    irrigated: true, rainfed: true,
    yield: 10, price: 4300, cost_pct: 0.58,
    tip: "Inoculate seeds with Rhizobium for better nitrogen fixation.",
  },
  {
    name: "Jute",
    N: [40, 80], P: [15, 30], K: [20, 40],
    temp: [25, 38], humidity: [70, 95], ph: [5.5, 7.0], rainfall: [150, 300],
    irrigated: false, rainfed: true,
    yield: 12, price: 4750, cost_pct: 0.6,
    tip: "Ret jute in slow-flowing clean water for best fibre quality.",
  },
];

export function rangeScore(value, [low, high]) {
  if (value >= low && value <= high) return 1;
  const mid = (low + high) / 2;
  const span = (high - low) / 2;
  const dist = Math.abs(value - mid);
  const score = Math.max(0, 1 - (dist - span) / span);
  return score;
}

export function scoreCrop(crop, inputs) {
  const weights = { N: 1, P: 1, K: 1, temp: 1.2, humidity: 1, ph: 1.2, rainfall: 1.1 };
  let total = 0;
  let maxTotal = 0;
  for (const key of ["N", "P", "K"]) {
    total += rangeScore(inputs[key], crop[key]) * weights[key];
    maxTotal += weights[key];
  }
  total += rangeScore(inputs.temperature, crop.temp) * weights.temp;
  maxTotal += weights.temp;
  total += rangeScore(inputs.humidity, crop.humidity) * weights.humidity;
  maxTotal += weights.humidity;
  total += rangeScore(inputs.ph, crop.ph) * weights.ph;
  maxTotal += weights.ph;
  total += rangeScore(inputs.rainfall, crop.rainfall) * weights.rainfall;
  maxTotal += weights.rainfall;

  // Filter crops based on irrigation type - completely exclude incompatible crops
  if (inputs.irrigationType === "rainfed" && !crop.rainfed) {
    return 0; // Exclude crops that require irrigation
  }
  if (inputs.irrigationType === "irrigated" && !crop.irrigated) {
    return 0; // Exclude crops that are only rainfed
  }

  return Math.round((total / maxTotal) * 100);
}

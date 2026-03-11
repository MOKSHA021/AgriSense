import { useState } from "react";
import Navbar from "../components/Navbar";
import {
  ShoppingCart,
  MapPin,
  Store,
  Package,
  CheckCircle,
  IndianRupee,
} from "lucide-react";

const CROPS = [
  "Wheat",
  "Rice",
  "Maize",
  "Cotton",
  "Sugarcane",
  "Potato",
  "Soybean",
  "Groundnut",
];

const CROP_DATA = {
  Wheat: [
    { name: "Seed", qty: 40, unit: "kg" },
    { name: "DAP", qty: 50, unit: "kg" },
    { name: "Urea", qty: 60, unit: "kg" },
    { name: "Zinc Sulphate", qty: 10, unit: "kg" },
  ],
  Rice: [
    { name: "Seed", qty: 25, unit: "kg" },
    { name: "DAP", qty: 45, unit: "kg" },
    { name: "Urea", qty: 80, unit: "kg" },
    { name: "MOP", qty: 30, unit: "kg" },
  ],
  Maize: [
    { name: "Seed", qty: 20, unit: "kg" },
    { name: "DAP", qty: 55, unit: "kg" },
    { name: "Urea", qty: 70, unit: "kg" },
    { name: "Zinc Sulphate", qty: 12, unit: "kg" },
  ],
  Cotton: [
    { name: "Seed", qty: 3, unit: "kg" },
    { name: "DAP", qty: 40, unit: "kg" },
    { name: "Urea", qty: 50, unit: "kg" },
    { name: "MOP", qty: 25, unit: "kg" },
  ],
  Sugarcane: [
    { name: "Setts", qty: 25000, unit: "buds" },
    { name: "DAP", qty: 60, unit: "kg" },
    { name: "Urea", qty: 100, unit: "kg" },
    { name: "MOP", qty: 40, unit: "kg" },
  ],
  Potato: [
    { name: "Seed", qty: 800, unit: "kg" },
    { name: "DAP", qty: 50, unit: "kg" },
    { name: "Urea", qty: 60, unit: "kg" },
    { name: "MOP", qty: 50, unit: "kg" },
  ],
  Soybean: [
    { name: "Seed", qty: 30, unit: "kg" },
    { name: "DAP", qty: 40, unit: "kg" },
    { name: "Urea", qty: 20, unit: "kg" },
  ],
  Groundnut: [
    { name: "Seed", qty: 50, unit: "kg" },
    { name: "SSP", qty: 100, unit: "kg" },
    { name: "Gypsum", qty: 200, unit: "kg" },
  ],
};

const MOCK_SELLERS = {
  Seed: [
    { name: "Agri Seeds Hub", distance: "2.3 km", price: 55, inStock: true },
    { name: "Kisan Beej Kendra", distance: "4.1 km", price: 48, inStock: true },
    { name: "Farm Fresh Seeds", distance: "6.8 km", price: 52, inStock: false },
  ],
  DAP: [
    { name: "Sri Fertilizers", distance: "1.5 km", price: 27, inStock: true },
    { name: "National Agro Store", distance: "3.7 km", price: 24, inStock: true },
    { name: "Green Valley Inputs", distance: "5.2 km", price: 26, inStock: true },
  ],
  Urea: [
    { name: "Bharat Agro Centre", distance: "2.0 km", price: 6, inStock: true },
    { name: "Kisan Seva Kendra", distance: "3.4 km", price: 5.5, inStock: true },
    { name: "Patel Fertilizers", distance: "7.1 km", price: 6.2, inStock: false },
  ],
  "Zinc Sulphate": [
    { name: "MicroNutrient Store", distance: "3.2 km", price: 85, inStock: true },
    { name: "Agri Chem Traders", distance: "4.6 km", price: 78, inStock: true },
    { name: "Farm Inputs Plus", distance: "8.0 km", price: 90, inStock: false },
  ],
  MOP: [
    { name: "Potash Traders", distance: "2.8 km", price: 18, inStock: true },
    { name: "Green Grow Agro", distance: "5.0 km", price: 16, inStock: true },
    { name: "Kisan Manure House", distance: "6.5 km", price: 17.5, inStock: true },
  ],
  Setts: [
    { name: "Cane Supply Depot", distance: "1.8 km", price: 0.4, inStock: true },
    { name: "Sugar Farm Inputs", distance: "4.3 km", price: 0.35, inStock: true },
    { name: "Agro Nursery Hub", distance: "7.6 km", price: 0.42, inStock: false },
  ],
  SSP: [
    { name: "Phosphate Centre", distance: "2.5 km", price: 8, inStock: true },
    { name: "Farm Chem Suppliers", distance: "3.9 km", price: 7, inStock: true },
    { name: "Agri Minerals Ltd", distance: "6.1 km", price: 8.5, inStock: true },
  ],
  Gypsum: [
    { name: "Mineral Agro Mart", distance: "3.0 km", price: 4, inStock: true },
    { name: "Soil Health Store", distance: "5.5 km", price: 3.5, inStock: true },
    { name: "Kisan Gypsum House", distance: "8.2 km", price: 4.2, inStock: false },
  ],
};

const getSellers = (inputName) =>
  MOCK_SELLERS[inputName] || [
    { name: "Local Agro Store", distance: "3.0 km", price: 30, inStock: true },
    { name: "District Agri Mart", distance: "5.0 km", price: 28, inStock: true },
    { name: "Rural Inputs Centre", distance: "7.0 km", price: 32, inStock: false },
  ];

const InputAdvisor = () => {
  const [crop, setCrop] = useState("");
  const [area, setArea] = useState("");
  const [results, setResults] = useState(null);

  const handleRecommend = () => {
    if (!crop || !area || Number(area) <= 0) return;
    const inputs = CROP_DATA[crop];
    const acres = Number(area);

    const computed = inputs.map((input) => {
      const totalQty = input.qty * acres;
      const sellers = getSellers(input.name);
      const bestPrice = Math.min(...sellers.map((s) => s.price));
      const cost = totalQty * bestPrice;
      return { ...input, totalQty, sellers, bestPrice, cost };
    });

    setResults(computed);
  };

  const totalCost = results
    ? results.reduce((sum, r) => sum + r.cost, 0)
    : 0;

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      <div className="relative z-10">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-green-400" />
          <h1 className="text-2xl font-semibold text-white drop-shadow">
            Input Shopping Advisor
          </h1>
        </div>

        {/* Form */}
        <div className="mb-8 rounded-lg border border-white/10 bg-black/40 backdrop-blur-md p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">
                Select Crop
              </label>
              <select
                value={crop}
                onChange={(e) => {
                  setCrop(e.target.value);
                  setResults(null);
                }}
                className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
              >
                <option value="">-- Choose a crop --</option>
                {CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/70">
                Area (acres)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  setResults(null);
                }}
                placeholder="e.g. 5"
                className="w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400"
              />
            </div>
          </div>

          <button
            onClick={handleRecommend}
            disabled={!crop || !area || Number(area) <= 0}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Package className="h-4 w-4" />
            Get Recommendations
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white drop-shadow">
              Input Requirements for {crop} — {area} acre{Number(area) !== 1 ? "s" : ""}
            </h2>

            {results.map((item) => (
              <div
                key={item.name}
                className="rounded-lg border border-white/10 bg-black/40 backdrop-blur-md p-5"
              >
                {/* Input header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-white/60" />
                    <span className="text-base font-semibold text-white">
                      {item.name}
                    </span>
                  </div>
                  <span className="rounded-full border border-green-200 bg-green-50 px-3 py-0.5 text-sm font-medium text-green-700">
                    {item.totalQty.toLocaleString()} {item.unit}
                  </span>
                </div>

                {/* Sellers */}
                <div className="space-y-2">
                  {item.sellers.map((seller) => {
                    const isBest = seller.price === item.bestPrice;
                    return (
                      <div
                        key={seller.name}
                        className={`flex items-center justify-between rounded-md border px-4 py-3 text-sm ${
                          isBest
                            ? "border-green-500/30 bg-green-500/20"
                            : "border-white/10 bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Store className="h-4 w-4 text-white/50" />
                          <div>
                            <p className="font-medium text-white">
                              {seller.name}
                              {isBest && (
                                <span className="ml-2 text-xs font-semibold text-green-600">
                                  Best Price
                                </span>
                              )}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-white/50">
                              <MapPin className="h-3 w-3" />
                              {seller.distance}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-0.5 font-medium text-white">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {seller.price}/{item.unit === "buds" ? "bud" : "kg"}
                          </span>
                          <span
                            className={`flex items-center gap-1 text-xs font-medium ${
                              seller.inStock ? "text-green-600" : "text-red-500"
                            }`}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            {seller.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Total cost */}
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 backdrop-blur-md px-6 py-4">
              <span className="text-base font-semibold text-white">
                Total Estimated Input Cost
              </span>
              <span className="flex items-center gap-1 text-lg font-bold text-green-400">
                <IndianRupee className="h-5 w-5" />
                {totalCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default InputAdvisor;

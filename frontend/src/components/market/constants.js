export const CROPS = [
  { name: "Wheat", icon: "🌾", unit: "quintal" },
  { name: "Rice", icon: "🍚", unit: "quintal" },
  { name: "Tomato", icon: "🍅", unit: "kg" },
  { name: "Onion", icon: "🧅", unit: "kg" },
  { name: "Potato", icon: "🥔", unit: "kg" },
  { name: "Maize", icon: "🌽", unit: "quintal" },
  { name: "Soybean", icon: "🫘", unit: "quintal" },
  { name: "Cotton", icon: "🌸", unit: "quintal" },
  { name: "Sugarcane", icon: "🎋", unit: "tonne" },
  { name: "Mustard", icon: "🌻", unit: "quintal" },
];

export const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar",
  "Chandigarh","Dadra and Nagar Haveli","Daman and Diu","Delhi",
  "Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
].sort();

export const SEASONS = ["Kharif", "Rabi", "Zaid"];

export const NAV_LINKS = [
  { label: "🏠 Home", path: "/dashboard" },
  { label: "🌱 Crops", path: "/dashboard/recommend" },
  { label: "📊 Market", path: "/dashboard/market" },
  { label: "🌦️ Weather", path: "/dashboard/weather" },
];

export const COST_PER_KM_PER_TONNE = 12; // ₹

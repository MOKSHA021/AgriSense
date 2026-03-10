import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
  FlaskConical,
  Sprout,
  CloudSun,
  TrendingUp,
  ShieldAlert,
  Bug,
  Wallet,
  ShoppingCart,
} from "lucide-react";

const features = [
  {
    icon: FlaskConical,
    title: "Soil Analysis",
    desc: "Detect soil type from photo",
    path: "/dashboard/soil",
  },
  {
    icon: Sprout,
    title: "Crop Recommendation",
    desc: "Find best crops for your land",
    path: "/dashboard/recommend",
  },
  {
    icon: CloudSun,
    title: "Weather Forecast",
    desc: "Live weather & farming advice",
    path: "/dashboard/weather",
  },
  {
    icon: TrendingUp,
    title: "Market Prices",
    desc: "Mandi rates & price predictions",
    path: "/dashboard/market",
  },
  {
    icon: ShieldAlert,
    title: "Risk Assessment",
    desc: "Flood, drought & heat alerts",
    path: "/dashboard/risk",
  },
  {
    icon: Bug,
    title: "Pest Detection",
    desc: "Identify diseases from leaf photo",
    path: "/dashboard/pests",
  },
  {
    icon: Wallet,
    title: "Expense Tracker",
    desc: "Track costs vs predicted profit",
    path: "/dashboard/expenses",
  },
  {
    icon: ShoppingCart,
    title: "Input Advisor",
    desc: "Seed, fertilizer shopping guide",
    path: "/dashboard/inputs",
  },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const userName = user?.user?.name || user?.name || "Farmer";

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          What would you like to do today?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                onClick={() => navigate(f.path)}
                className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors"
              >
                <div className="bg-gray-100 rounded-lg p-2 w-fit mb-4">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

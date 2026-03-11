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
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold text-white mb-1 drop-shadow">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-sm text-white/70 mb-10">
            What would you like to do today?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  onClick={() => navigate(f.path)}
                  className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 cursor-pointer hover:bg-black/50 hover:shadow-lg transition-all"
                >
                  <div className="bg-white/10 rounded-lg p-2 w-fit mb-4">
                    <Icon className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                  <p className="text-sm text-white/60">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

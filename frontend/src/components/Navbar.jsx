import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Wheat, LayoutDashboard, FlaskConical, Sprout, CloudSun,
  TrendingUp, ShieldAlert, Wallet, ShoppingCart, Menu, X, LogOut, Map, Activity, Bot
} from "lucide-react";

const navLinks = [
  { label: "Home",        path: "/dashboard",                 icon: LayoutDashboard, color: "text-green-400"  },
  { label: "Weather",     path: "/dashboard/weather",         icon: CloudSun,        color: "text-blue-400"   },

  { label: "Crops",       path: "/dashboard/recommend",       icon: Sprout,          color: "text-lime-400"   },
  { label: "Best Mandi",  path: "/dashboard/best-mandi",      icon: Map,             color: "text-emerald-400"},
  { label: "Live Prices", path: "/dashboard/live-prices",     icon: Activity,        color: "text-pink-400"   },
  { label: "Forecast",    path: "/dashboard/price-forecast",  icon: Bot,             color: "text-indigo-400" },
  { label: "Risk",        path: "/dashboard/risk",            icon: ShieldAlert,     color: "text-orange-400" },
  { label: "Expenses",    path: "/dashboard/expenses",        icon: Wallet,          color: "text-purple-400" },
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const userName = user?.user?.name || user?.name || "Farmer";
  const initials = userName.charAt(0).toUpperCase();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/8 bg-black/50 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-900/40">
            <Wheat className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
            AgriSense
          </span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 md:flex overflow-x-auto">
          {navLinks.map(({ label, path, icon: Icon, color }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/dashboard"}
              className={({ isActive }) =>
                `group relative flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/45 hover:bg-white/8 hover:text-white/80"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-3.5 w-3.5 transition-colors ${isActive ? color : "text-current"}`} />
                  {label}
                  {isActive && (
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full ${color.replace("text-", "bg-")} opacity-80`} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/30 text-sm font-bold text-green-300">
              {initials}
            </div>
            <span className="text-xs font-medium text-white/50 max-w-[80px] truncate">{userName}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs text-white/40 transition-all hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-xl p-2 text-white/50 hover:bg-white/10 hover:text-white md:hidden transition-colors"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/8 bg-black/60 backdrop-blur-xl px-4 pb-5 pt-3 md:hidden">
          <div className="grid grid-cols-2 gap-1">
            {navLinks.map(({ label, path, icon: Icon, color }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/dashboard"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/8 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-4 w-4 ${isActive ? color : "text-current"}`} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 border border-green-500/30 text-sm font-bold text-green-300">
                {initials}
              </div>
              <span className="text-sm font-medium text-white/60">{userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

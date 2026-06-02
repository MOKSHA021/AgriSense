import { useContext, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wheat, LayoutDashboard, Sprout, CloudSun,
  ShieldAlert, Wallet, Menu, X, LogOut, Map, Activity, Bot
} from "lucide-react";

const navLinks = [
  { label: "Home",        path: "/dashboard",                 icon: LayoutDashboard, color: "text-emerald-400" },
  { label: "Weather",     path: "/dashboard/weather",         icon: CloudSun,        color: "text-blue-400"   },
  { label: "Crops",       path: "/dashboard/recommend",       icon: Sprout,          color: "text-green-400"  },
  { label: "Best Mandi",  path: "/dashboard/best-mandi",      icon: Map,             color: "text-teal-400"   },
  { label: "Live Prices", path: "/dashboard/live-prices",     icon: Activity,        color: "text-pink-400"   },
  { label: "Forecast",    path: "/dashboard/price-forecast",  icon: Bot,             color: "text-indigo-400" },
  { label: "Risk",        path: "/dashboard/risk",            icon: ShieldAlert,     color: "text-orange-400" },
  { label: "Expenses",    path: "/dashboard/expenses",        icon: Wallet,          color: "text-purple-400" },
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const userName = user?.user?.name || user?.name || "Farmer";
  const initials = userName.charAt(0).toUpperCase();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-transparent backdrop-blur-3xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
            <Wheat className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            AgriSense
          </span>
        </NavLink>

        {/* Desktop nav with Framer Motion layout animations */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ label, path, icon: Icon, color }) => {
            const isActive = location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
            
            return (
              <NavLink
                key={path}
                to={path}
                className={`relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? "text-white" : "text-white/40 hover:text-white/80"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 bg-white/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`h-4 w-4 transition-colors ${isActive ? color : "text-current"}`} />
                  {label}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex border-l border-white/10 pl-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-400">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center justify-center h-8 w-8 rounded-full hover:bg-red-500/10 hover:text-red-400 text-white/40 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white md:hidden transition-colors"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu with AnimatePresence */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-[#030712]/95 backdrop-blur-3xl overflow-hidden md:hidden"
          >
            <div className="px-4 py-4 grid grid-cols-2 gap-2">
              {navLinks.map(({ label, path, icon: Icon, color }) => {
                const isActive = location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
                return (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                      isActive ? "bg-white/10 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? color : "text-current"}`} />
                    {label}
                  </NavLink>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-sm font-bold text-emerald-400">
                  {initials}
                </div>
                <span className="text-sm font-medium text-white/80">{userName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

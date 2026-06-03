import { useContext, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wheat, LayoutDashboard, Sprout, CloudSun, FlaskConical,
  ShieldAlert, Wallet, Menu, X, LogOut, Map, Activity, Bot, ChevronDown
} from "lucide-react";

const navLinks = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, color: "#2D6A4F" },
  { label: "Soil", path: "/dashboard/soil", icon: FlaskConical, color: "#D97706" },
  { label: "Crops", path: "/dashboard/recommend", icon: Sprout, color: "#16A34A" },
  { label: "Weather", path: "/dashboard/weather", icon: CloudSun, color: "#2563EB" },
  { label: "Markets", path: "/dashboard/live-prices", icon: Activity, color: "#D4673A" },
  { label: "Forecast", path: "/dashboard/price-forecast", icon: Bot, color: "#7C3AED" },
  { label: "Risk", path: "/dashboard/risk", icon: ShieldAlert, color: "#DC2626" },
  { label: "Expenses", path: "/dashboard/expenses", icon: Wallet, color: "#0891B2" },
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const userName = user?.user?.name || user?.name || "Farmer";
  const initials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#1B4332] shadow-lg shadow-[#1B4332]/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* ── Logo ── */}
        <NavLink to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 bg-[#D4673A] rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Wheat className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold text-white tracking-tight font-heading">AgriSense</span>
            <span className="text-[9px] text-[#52B788] font-semibold tracking-widest uppercase">Smart Farming</span>
          </div>
        </NavLink>

        {/* ── Desktop Links ── */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${isActive
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "white" : undefined }} />
                    {link.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* ── Right: User + Logout ── */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Mandi Finder */}
          <NavLink
            to="/dashboard/best-mandi"
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
              }`
            }
          >
            <Map className="w-3.5 h-3.5" />
            Mandi
          </NavLink>

          {/* Divider */}
          <div className="w-px h-6 bg-white/20" />

          {/* User pill */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#52B788] flex items-center justify-center text-[#1B4332] text-xs font-black">
              {initials}
            </div>
            <span className="text-xs font-semibold text-white/80 max-w-[100px] truncate">{userName}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>

        {/* ── Mobile Menu Button ── */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden lg:hidden border-t border-white/10 bg-[#1B4332]"
          >
            <div className="px-4 py-4 grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === "/dashboard"}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </NavLink>
                );
              })}
              <NavLink
                to="/dashboard/best-mandi"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                <Map className="w-4 h-4" />
                Mandi
              </NavLink>
            </div>

            {/* User row */}
            <div className="px-4 pb-4 border-t border-white/10 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#52B788] flex items-center justify-center text-[#1B4332] text-xs font-black">
                  {initials}
                </div>
                <span className="text-sm font-semibold text-white">{userName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white/60 hover:text-white bg-white/5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;

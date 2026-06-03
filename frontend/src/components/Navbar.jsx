import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wheat, LayoutDashboard, Sprout, CloudSun, FlaskConical,
  ShieldAlert, Wallet, Menu, X, LogOut, Map, Activity, Bot, ChevronRight
} from "lucide-react";

const navLinks = [
  { label: "Dashboard", path: "/dashboard",                  icon: LayoutDashboard },
  { label: "Soil Analysis",  path: "/dashboard/soil",             icon: FlaskConical },
  { label: "Crop Selection", path: "/dashboard/recommend",        icon: Sprout },
  { label: "Weather Radar",   path: "/dashboard/weather",          icon: CloudSun },
  { label: "Live Mandi Prices",   path: "/dashboard/live-prices",      icon: Activity },
  { label: "Price Forecast",  path: "/dashboard/price-forecast",   icon: Bot },
  { label: "Risk Assessment", path: "/dashboard/risk",             icon: ShieldAlert },
  { label: "Expense Tracker",  path: "/dashboard/expenses",         icon: Wallet },
  { label: "Best Mandi Finder", path: "/dashboard/best-mandi",    icon: Map },
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const userName = user?.user?.name || user?.name || "Farmer";
  const email = user?.user?.email || user?.email || "farmer@agrisense.com";
  const initials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  return (
    <>
      {/* ══════════════════ DESKTOP SIDEBAR ══════════════════ */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-green-dark text-white z-40 flex-col border-r border-[#E5E7EB]/10">
        {/* Brand Logo Header */}
        <div className="h-20 flex items-center px-6 border-b border-white/5 shrink-0">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-green-mid rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Wheat className="h-5.5 w-5.5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black text-white tracking-tight font-heading">AgriSense</span>
              <span className="text-[9px] text-[#2BB673] font-bold tracking-widest uppercase mt-0.5">Enterprise SaaS</span>
            </div>
          </NavLink>
        </div>

        {/* Scrollable Navigation Area */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-3 mb-2">Platform Core</p>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 group ${
                    isActive
                      ? "bg-white/10 text-white shadow-inner"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-green-light group-hover:scale-110 transition-transform" />
                  <span>{link.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-white/40" />
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Pill */}
        <div className="p-4 border-t border-white/5 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-green-light flex items-center justify-center text-green-dark text-xs font-black shadow-inner">
              {initials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate leading-none">{userName}</span>
              <span className="text-[10px] text-white/45 truncate mt-1 leading-none">{email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/5 rounded-xl text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══════════════════ DESKTOP TOP HEADER ══════════════════ */}
      <header className="hidden lg:flex fixed top-0 right-0 left-64 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-30 items-center justify-between px-8 shadow-sm shadow-slate-100/10">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-light opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-mid"></span>
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            AI Operations Online
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Platform License</p>
            <p className="text-xs font-bold text-green-dark mt-0.5">Enterprise Tier</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-pale flex items-center justify-center text-green-dark text-xs font-bold border border-[#2BB673]/15">
              {initials}
            </div>
            <span className="text-xs font-bold text-slate-700">{userName}</span>
          </div>
        </div>
      </header>

      {/* ══════════════════ MOBILE NAV HEADER ══════════════════ */}
      <nav className="sticky top-0 z-50 w-full bg-green-dark shadow-md lg:hidden shrink-0">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-2 group">
            <Wheat className="h-5 w-5 text-green-light" />
            <span className="text-base font-extrabold text-white font-heading tracking-tight">AgriSense</span>
          </NavLink>

          {/* Menu Trigger */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            {menuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-green-dark border-t border-white/5"
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
                        `flex items-center gap-2 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                          isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 text-green-light" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              {/* User logout row */}
              <div className="px-4 pb-4 border-t border-white/5 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-light flex items-center justify-center text-green-dark text-xs font-black">
                    {initials}
                  </div>
                  <span className="text-xs font-bold text-white">{userName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white/70 hover:text-white bg-white/5 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;

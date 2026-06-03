import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf, BarChart3, FlaskConical, Sprout, CloudSun,
  Map, Activity, Bot, ShieldAlert, Wallet, Menu, X,
  LogOut, User, ChevronDown
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

const navLinks = [
  { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
  { label: "Soil Analysis", path: "/dashboard/soil", icon: FlaskConical },
  { label: "Crop Recommendation", path: "/dashboard/recommend", icon: Sprout },
  { label: "Weather Intelligence", path: "/dashboard/weather", icon: CloudSun },
  { label: "Best Mandi", path: "/dashboard/best-mandi", icon: Map },
  { label: "Live Prices", path: "/dashboard/live-prices", icon: Activity },
  { label: "Price Forecast", path: "/dashboard/price-forecast", icon: Bot },
  { label: "Risk Assessment", path: "/dashboard/risk", icon: ShieldAlert },
  { label: "Expenses", path: "/dashboard/expenses", icon: Wallet },
];

export default function DashboardNavbar() {
  const { user, logout } = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.name || user?.user?.name || user?.username || user?.email?.split("@")[0] || "Farmer";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white/85 backdrop-blur-md shadow-md border-b border-slate-200/50 py-3" 
        : "bg-white border-b border-slate-200/50 py-4"
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1E8E5A] rounded-xl flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight font-heading text-[#0F6B4A]">
                Agri<span className="text-[#2BB673]">Sense</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Enterprise</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-[#1E8E5A] text-white shadow-md shadow-[#1E8E5A]/20"
                      : "text-slate-600 hover:text-[#1E8E5A] hover:bg-[#E6F5EE]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher variant="navbar" />
            
            <div className="h-6 w-px bg-slate-200" />
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-[#1E8E5A] to-[#2BB673] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {initials}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">{displayName}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Farmer Account</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[200px]"
                    >
                      <div className="p-3 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">{displayName}</p>
                        <p className="text-xs text-slate-500">{user?.email || ''}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-3">
            <LanguageSwitcher variant="navbar" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-slate-200 bg-white"
          >
            <div className="px-6 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-[#1E8E5A] text-white"
                        : "text-slate-600 hover:bg-[#E6F5EE] hover:text-[#1E8E5A]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}
              
              <div className="border-t border-slate-200 my-4 pt-4">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1E8E5A] to-[#2BB673] rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{displayName}</p>
                    <p className="text-xs text-slate-500">Farmer Account</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

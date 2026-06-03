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
import { useTranslation } from "../translations";

const navLinks = [
  { label: "dashboard", path: "/dashboard", icon: BarChart3, transKey: "dashboard" },
  { label: "soil", path: "/dashboard/soil", icon: FlaskConical, transKey: "soil" },
  { label: "crops", path: "/dashboard/recommend", icon: Sprout, transKey: "crops" },
  { label: "weather", path: "/dashboard/weather", icon: CloudSun, transKey: "weather" },
  { label: "mandi", path: "/dashboard/best-mandi", icon: Map, transKey: "mandi" },
  { label: "markets", path: "/dashboard/live-prices", icon: Activity, transKey: "markets" },
  { label: "forecast", path: "/dashboard/price-forecast", icon: Bot, transKey: "forecast" },
  { label: "risk", path: "/dashboard/risk", icon: ShieldAlert, transKey: "risk" },
  { label: "expenses", path: "/dashboard/expenses", icon: Wallet, transKey: "expenses" },
];

export default function DashboardNavbar() {
  const { user, logout } = React.useContext(AuthContext);
  const { t } = useTranslation();
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
      <div className="w-full mx-auto px-4 md:px-8 xl:px-8">
        <div className="flex items-center w-full gap-4 xl:gap-8">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-[#1E8E5A] rounded-xl flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight font-heading text-[#0F6B4A]">
                Agri<span className="text-[#2BB673]">Sense</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">{t('nav.enterprise') || 'Enterprise'}</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex flex-1 items-center justify-center gap-0.5 overflow-x-auto no-scrollbar">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-3 py-2.5 text-[11px] xl:text-xs font-bold transition-colors duration-200 shrink-0 ${
                    isActive
                      ? "text-[#1E8E5A]"
                      : "text-slate-500 hover:text-[#1E8E5A]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-[#1E8E5A]/10 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    <span className="hidden 2xl:inline">{t(`nav.${link.transKey}`)}</span>
                    <span className="2xl:hidden">{t(`nav.${link.transKey}`).split(' ')[0]}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="hidden xl:flex items-center gap-4 shrink-0 ml-auto">
            <LanguageSwitcher variant="navbar" />
            
            <div className="h-6 w-px bg-slate-200" />
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all shrink-0"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-[#1E8E5A] to-[#2BB673] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {initials}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800">{displayName}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{t('nav.farmerAccount') || 'Farmer Account'}</p>
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
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('nav.account') || 'Account'}</p>
                        <p className="text-sm font-bold text-slate-800 mt-1">{displayName}</p>
                        <p className="text-xs text-slate-500">{user?.email || ''}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="xl:hidden flex items-center gap-4 ml-auto">
            <LanguageSwitcher variant="navbar" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-white border-t border-slate-200/50 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? "text-[#1E8E5A] bg-[#1E8E5A]/5"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobile-nav-spotlight"
                        className="absolute left-0 top-2 bottom-2 w-1 bg-[#1E8E5A] rounded-r-md"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Icon className="w-5 h-5" />
                    {t(`nav.${link.transKey}`)}
                  </Link>
                );
              })}
              
              <div className="h-px bg-slate-100 my-2" />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                {t('nav.logout')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

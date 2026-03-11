import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Wheat,
  LayoutDashboard,
  FlaskConical,
  Sprout,
  CloudSun,
  TrendingUp,
  ShieldAlert,
  Wallet,
  ShoppingCart,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navLinks = [
  { label: "Home", path: "/dashboard", icon: LayoutDashboard },
  { label: "Soil", path: "/dashboard/soil", icon: FlaskConical },
  { label: "Crops", path: "/dashboard/recommend", icon: Sprout },
  { label: "Weather", path: "/dashboard/weather", icon: CloudSun },
  { label: "Market", path: "/dashboard/market", icon: TrendingUp },
  { label: "Risk", path: "/dashboard/risk", icon: ShieldAlert },
  { label: "Expenses", path: "/dashboard/expenses", icon: Wallet },
  { label: "Inputs", path: "/dashboard/inputs", icon: ShoppingCart },
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const userName = user?.user?.name || user?.name || "Farmer";
  const initials = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <NavLink
          to="/dashboard"
          className="flex items-center gap-1.5 text-lg font-semibold text-white"
        >
          <Wheat className="h-5 w-5 text-green-600" />
          AgriSense
        </NavLink>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* User info — desktop */}
          <div className="hidden items-center gap-2 md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">
              {initials}
            </div>
            <span className="text-sm font-medium text-white/70">
              {userName}
            </span>
            <button
              onClick={handleLogout}
              className="ml-1 flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-md p-1.5 text-white/50 hover:bg-white/10 hover:text-white md:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-black/40 backdrop-blur-md px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/dashboard"}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">
                {initials}
              </div>
              <span className="text-sm font-medium text-white/70">
                {userName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

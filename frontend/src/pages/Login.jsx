import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wheat, Eye, EyeOff } from "lucide-react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/auth/login", form);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex">
      {/* Left: Farm Image Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-end p-12"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/90 via-[#1B4332]/40 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#D4673A] rounded-xl flex items-center justify-center">
              <Wheat className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white font-heading">AgriSense</span>
          </div>
          <h2 className="text-3xl font-bold text-white font-heading mb-3 leading-tight">
            Smart farming starts<br />with the right data.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm">
            AI-powered soil analysis, crop recommendations, market prices, and weather risk — all in one platform.
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-[#D4673A] rounded-xl flex items-center justify-center">
              <Wheat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1B4332] font-heading">AgriSense</span>
          </div>

          <h1 className="text-2xl font-bold text-[#1B3A28] font-heading mb-1">Welcome back</h1>
          <p className="text-[#6B8C7B] text-sm mb-8">Sign in to your farming dashboard</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span className="shrink-0">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#1B4332] uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com" required
                className="w-full px-4 py-3 bg-white border border-[#E0EDD9] rounded-xl text-sm text-[#1B3A28] placeholder-[#A0B8A8] focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:border-[#52B788] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1B4332] uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"} name="password" value={form.password}
                  onChange={handleChange} placeholder="Enter your password" required
                  className="w-full px-4 py-3 bg-white border border-[#E0EDD9] rounded-xl text-sm text-[#1B3A28] placeholder-[#A0B8A8] focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:border-[#52B788] transition pr-10"
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8C7B] hover:text-[#1B4332] transition">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-[#D4673A] hover:bg-[#b85530] text-white text-sm font-bold rounded-xl disabled:opacity-50 shadow-md shadow-[#D4673A]/30 transition-all mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B8C7B] mt-8">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-[#2D6A4F] font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

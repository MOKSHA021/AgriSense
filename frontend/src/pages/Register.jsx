import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wheat, Eye, EyeOff, CheckCircle } from "lucide-react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await API.post("/auth/register", form);
      if (data.requireOTP === false && data.token) {
        setSuccess("Account created! Redirecting...");
        login(data);
        setTimeout(() => navigate("/dashboard"), 1200);
      } else {
        localStorage.setItem("pending_email", form.email);
        navigate("/verify-otp");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3;
  const pwdColors = ["", "bg-red-500", "bg-yellow-500", "bg-[#52B788]"];
  const pwdLabels = ["", "Weak", "Fair", "Strong"];
  const pwdTextColors = ["", "text-red-600", "text-yellow-600", "text-[#2D6A4F]"];

  const benefits = [
    "AI-powered soil analysis from photos",
    "Personalized crop recommendations",
    "Live market price tracking",
    "Weather-based risk alerts",
  ];

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex">
      {/* Left: Farm Image Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-end p-12"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80)",
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
          <h2 className="text-3xl font-bold text-white font-heading mb-4 leading-tight">
            Join thousands of<br />smart farmers.
          </h2>
          <ul className="space-y-2.5">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-white/80">
                <CheckCircle className="w-4 h-4 text-[#52B788] shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right: Register Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-[#D4673A] rounded-xl flex items-center justify-center">
              <Wheat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1B4332] font-heading">AgriSense</span>
          </div>

          <h1 className="text-2xl font-bold text-[#1B3A28] font-heading mb-1">Create your account</h1>
          <p className="text-[#6B8C7B] text-sm mb-8">Start farming smarter with AI — it's free</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <span className="shrink-0">⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#1B4332] uppercase tracking-wide mb-1.5">
                Full Name
              </label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="Your name" required
                className="w-full px-4 py-3 bg-white border border-[#E0EDD9] rounded-xl text-sm text-[#1B3A28] placeholder-[#A0B8A8] focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:border-[#52B788] transition"
              />
            </div>

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
                  onChange={handleChange} placeholder="Min 6 characters" required
                  className="w-full px-4 py-3 bg-white border border-[#E0EDD9] rounded-xl text-sm text-[#1B3A28] placeholder-[#A0B8A8] focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:border-[#52B788] transition pr-10"
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8C7B] hover:text-[#1B4332] transition">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map(level => (
                      <div key={level} className={`h-1.5 flex-1 rounded-full transition-all ${pwdStrength >= level ? pwdColors[pwdStrength] : "bg-[#E0EDD9]"}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-semibold ${pwdTextColors[pwdStrength]}`}>{pwdLabels[pwdStrength]}</span>
                </div>
              )}
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
                  Creating Account...
                </span>
              ) : "Create Free Account →"}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B8C7B] mt-8">
            Already have an account?{" "}
            <Link to="/login" className="text-[#2D6A4F] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

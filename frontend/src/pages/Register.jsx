import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wheat, Eye, EyeOff, CheckCircle, Leaf } from "lucide-react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "../translations";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { t } = useTranslation();

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
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left: Farm Image Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-end p-12"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F4C3A]/95 via-[#0F4C3A]/50 to-transparent" />
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#1E8E5A] rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-white font-heading tracking-tight">AgriSense</span>
            </div>
            <h2 className="text-4xl font-bold text-white font-heading mb-4 leading-tight" dangerouslySetInnerHTML={{ __html: t('auth.registerTitle') }}>
            </h2>
            <p className="text-white/80 text-base leading-relaxed max-w-md mb-6">
              {t('auth.registerDesc')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right: Register Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-8 lg:hidden"
          >
            <div className="w-10 h-10 bg-[#1E8E5A] rounded-xl flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800 font-heading">AgriSense</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-3xl font-bold text-slate-800 font-heading mb-2">{t('auth.createAccount')}</h1>
            <p className="text-slate-500 text-base mb-8">{t('auth.startOptimizing')}</p>

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
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  {t('auth.fullName')}
                </label>
                <input
                  type="text" name="name" value={form.name}
                  onChange={handleChange} placeholder={t('auth.namePlaceholder')} required
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E8E5A] focus:border-[#1E8E5A] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  {t('auth.email')}
                </label>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder={t('auth.emailPlaceholder')} required
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E8E5A] focus:border-[#1E8E5A] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"} name="password" value={form.password}
                    onChange={handleChange} placeholder={t('auth.createPassword')} required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E8E5A] focus:border-[#1E8E5A] transition-all pr-10"
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map(level => (
                        <div key={level} className={`h-1.5 flex-1 rounded-full transition-all ${pwdStrength >= level ? pwdColors[pwdStrength] : "bg-slate-200"}`} />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${pwdTextColors[pwdStrength]}`}>{pwdLabels[pwdStrength]}</span>
                  </div>
                )}
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3.5 bg-[#1E8E5A] hover:bg-[#0F6B4A] text-white text-sm font-semibold rounded-xl disabled:opacity-50 shadow-md shadow-[#1E8E5A]/20 transition-all mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                    </svg>
                    {t('auth.creating')}
                  </span>
                ) : t('auth.createAccount')}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-8">
              {t('auth.alreadyHave')}{" "}
              <Link to="/login" className="text-[#1E8E5A] font-semibold hover:underline">{t('auth.signInInstead')}</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;

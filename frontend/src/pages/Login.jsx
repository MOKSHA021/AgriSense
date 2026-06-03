import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wheat, Eye, EyeOff, Leaf } from "lucide-react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "../translations";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { t } = useTranslation();

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
      setError(err.response?.data?.message || t('auth.invalidCreds'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Left: Farm Image Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative items-end p-12"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80)",
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
            <h2 className="text-4xl font-bold text-white font-heading mb-4 leading-tight" dangerouslySetInnerHTML={{ __html: t('auth.loginTitle') }}>
            </h2>
            <p className="text-white/80 text-base leading-relaxed max-w-md">
              {t('auth.loginDesc')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right: Login Form */}
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
            <h1 className="text-3xl font-bold text-slate-800 font-heading mb-2">{t('auth.welcomeBack')}</h1>
            <p className="text-slate-500 text-base mb-8">{t('auth.signInDesc')}</p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                <span className="shrink-0">⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                    onChange={handleChange} placeholder={t('auth.passwordPlaceholder')} required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E8E5A] focus:border-[#1E8E5A] transition-all pr-10"
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
                    {t('auth.signingIn')}
                  </span>
                ) : t('auth.signIn')}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-8">
              {t('auth.noAccount')}{" "}
              <Link to="/register" className="text-[#1E8E5A] font-semibold hover:underline">{t('auth.createOne')}</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;

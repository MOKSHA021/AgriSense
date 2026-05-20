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
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      {/* Background */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
        src="https://videos.pexels.com/video-files/2252574/2252574-uhd_2560_1440_30fps.mp4"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 z-10" />

      <div className="relative z-20 w-full max-w-md">
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wheat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                AgriSense
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">Welcome back</h2>
            <p className="text-white/40 text-sm mt-1">Sign in to your account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/15 text-red-300 text-sm px-4 py-3 rounded-xl mb-5 border border-red-500/25 flex items-start gap-2">
              <span className="shrink-0">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5 block">Email Address</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com" required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wide mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"} name="password" value={form.password}
                  onChange={handleChange} placeholder="Enter your password" required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition pr-10"
                />
                <button type="button" onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 shadow-lg shadow-green-900/30 transition-all mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign in →"}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-green-400 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

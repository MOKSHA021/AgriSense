import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wheat } from "lucide-react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://videos.pexels.com/video-files/2252574/2252574-uhd_2560_1440_30fps.mp4"
      />
      <div className="absolute inset-0 bg-black/50 z-10" />
      <div className="relative z-20 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-10 w-full max-w-md shadow-2xl">

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wheat className="w-5 h-5 text-green-400" />
            <span className="text-lg font-bold text-white">AgriSense</span>
          </div>
          <h2 className="text-xl font-bold text-white">Welcome back</h2>
          <p className="text-white/50 text-sm mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-300 text-sm px-4 py-2.5 rounded-lg mb-4 border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-white/70">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full mt-1.5 px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white/70">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full mt-1.5 px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition mt-1"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-white/50 mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-green-400 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

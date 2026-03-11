import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Wheat, Mail } from "lucide-react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const inputRefs = useRef([]);
  const email = localStorage.getItem("pending_email");

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const otpString = otp.join("");
    if (otpString.length < 6) {
      setError("Please enter all 6 digits");
      setLoading(false);
      return;
    }
    try {
      const { data } = await API.post("/auth/verify-otp", { email, otp: otpString });
      localStorage.removeItem("pending_email");
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await API.post("/auth/resend-otp", { email });
      setResendMsg("OTP resent — check your email.");
    } catch {
      setResendMsg("Failed to resend. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg border border-gray-200 p-8 w-full max-w-sm text-center">

        <div className="flex items-center justify-center gap-2 mb-4">
          <Wheat className="w-5 h-5 text-green-700" />
          <span className="text-lg font-bold text-gray-800">AgriSense</span>
        </div>

        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Mail className="w-5 h-5 text-gray-600" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Check your email</h2>
        <p className="text-gray-400 text-sm mb-6">
          We sent a 6-digit code to<br />
          <span className="font-medium text-gray-700">{email}</span>
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4 border border-red-100">
            {error}
          </div>
        )}

        {resendMsg && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-2.5 rounded-lg mb-4 border border-green-100">
            {resendMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2.5 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-11 text-center text-lg font-bold border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900 transition"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-6">
          Didn&apos;t receive it?{" "}
          <button
            onClick={handleResend}
            className="text-gray-900 font-medium hover:underline"
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;

import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // 🧠 6 boxes = 6 slots in array, all start empty
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  // 🧠 useRef array — one ref per input box for auto-focus control
  const inputRefs = useRef([]);

  // 🧠 Read email stored during Register
  const email = localStorage.getItem("pending_email");

  const handleChange = (index, value) => {
    // Only allow single digit
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // 🧠 Auto-focus next box when digit entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // 🧠 Auto-focus previous box on backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const otpString = otp.join(""); // 🧠 ["1","2","3","4","5","6"] → "123456"

    if (otpString.length < 6) {
      setError("Please enter all 6 digits");
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.post("/auth/verify-otp", {
        email,
        otp: otpString,
      });

      localStorage.removeItem("pending_email"); // 🧠 Clean up
      login(data); // 🧠 Save user + token in AuthContext
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
      setResendMsg("OTP resent! Check your email.");
    } catch {
      setResendMsg("Failed to resend. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">

        {/* Header */}
        <span className="text-4xl">📧</span>
        <h2 className="text-2xl font-bold text-green-800 mt-2">
          Verify Your Email
        </h2>
        <p className="text-gray-500 text-sm mt-1 mb-6">
          We sent a 6-digit OTP to <br />
          <span className="font-medium text-green-700">{email}</span>
        </p>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Resend message */}
        {resendMsg && (
          <div className="bg-green-50 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">
            {resendMsg}
          </div>
        )}

        {/* OTP Boxes */}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)} // 🧠 attach ref to each box
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP →"}
          </button>
        </form>

        {/* Resend */}
        <p className="text-sm text-gray-500 mt-4">
          Didn't receive it?{" "}
          <button
            onClick={handleResend}
            className="text-green-700 font-medium hover:underline"
          >
            Resend OTP
          </button>
        </p>

      </div>
    </div>
  );
};

export default VerifyOTP;

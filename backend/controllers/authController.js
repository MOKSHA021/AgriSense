const bcrypt      = require("bcryptjs");
const jwt         = require("jsonwebtoken");
const User        = require("../models/User");
const redisClient = require("../config/redis");
const sendOTPEmail = require("../utils/sendEmail");

// ── REGISTER ─────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Store temp — don't save to DB yet
    await redisClient.setTempUser(email, { name, email, password: hashedPassword });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.setEx(`otp:${email}`, 600, otp);
    await sendOTPEmail(email, name, otp);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};




// ── VERIFY OTP ────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const savedOTP = await redisClient.get(`otp:${email}`);
    if (!savedOTP)       return res.status(400).json({ message: "OTP expired" });
    if (savedOTP !== otp) return res.status(400).json({ message: "Invalid OTP" });

    // ✅ Now save to DB after verification
    const tempUser = await redisClient.getTempUser(email);
    if (!tempUser) return res.status(400).json({ message: "Session expired, register again" });

    const user = new User({ ...tempUser, isVerified: true });
    await user.save();

    await redisClient.del(`otp:${email}`);
    await redisClient.delTempUser(email);

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};


// ── LOGIN ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.isVerified) return res.status(400).json({ message: "Please verify your email first" });

    // 🧠 bcrypt.compare hashes the input and checks against stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── RESEND OTP ────────────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.setEx(`otp:${email}`, 600, otp);
    await sendOTPEmail(email, user.name, otp);

    res.status(200).json({ message: "OTP resent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, verifyOTP, login, resendOTP };

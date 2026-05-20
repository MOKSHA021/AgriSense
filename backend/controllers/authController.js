const bcrypt      = require("bcryptjs");
const jwt         = require("jsonwebtoken");
const User        = require("../models/User");
const redisClient = require("../config/redis");
const sendOTPEmail = require("../utils/sendEmail");

// ─────────────────────────────────────────────────────────
// REGISTER
// Strategy:
//   1. Try to send OTP via Brevo email.
//   2. If email succeeds  → redirect to OTP verify page.
//   3. If email fails (IP block, no API key, etc.)
//      → register user directly as verified and return a JWT.
//      This ensures signup always works regardless of email service.
// ─────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing && existing.isVerified) {
      return res.status(400).json({ message: "Email already registered" });
    }
    if (existing && !existing.isVerified) {
      // Allow re-register for unverified accounts — delete old record
      await User.deleteOne({ email });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Store temp user in memory
    await redisClient.setTempUser(email, { name, email, password: hashedPassword });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.setEx(`otp:${email}`, 600, otp);

    // Try sending email
    let emailSent = false;
    try {
      await sendOTPEmail(email, name, otp);
      emailSent = true;
    } catch (emailErr) {
      console.warn("⚠️  Email service unavailable:", emailErr?.body?.message || emailErr.message);
      console.log(`📋 DEV FALLBACK — OTP for ${email}: ${otp}`);
    }

    if (emailSent) {
      // Normal OTP flow
      return res.status(200).json({
        message: "OTP sent to your email",
        requireOTP: true,
      });
    }

    // ── Email failed: register directly ──────────────────
    // Create user as verified so they can log in immediately
    const user = new User({ name, email, password: hashedPassword, isVerified: true });
    await user.save();

    // Clean up temp storage
    await redisClient.del(`otp:${email}`);
    await redisClient.delTempUser(email);

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Account created successfully (email service unavailable — auto-verified)",
      requireOTP: false,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Register ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};


// ── VERIFY OTP ────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const savedOTP = await redisClient.get(`otp:${email}`);
    if (!savedOTP)        return res.status(400).json({ message: "OTP expired. Please register again." });
    if (savedOTP !== otp) return res.status(400).json({ message: "Invalid OTP. Please try again." });

    const tempUser = await redisClient.getTempUser(email);
    if (!tempUser) return res.status(400).json({ message: "Session expired. Please register again." });

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
    console.error("❌ VerifyOTP ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};


// ── LOGIN ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)           return res.status(400).json({ message: "No account found with this email" });
    if (!user.isVerified) return res.status(400).json({ message: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

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
    console.error("❌ Login ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ── RESEND OTP ────────────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check for temp user first (for newly registering users)
    const tempUser = await redisClient.getTempUser(email);
    const dbUser   = await User.findOne({ email });

    const name = tempUser?.name || dbUser?.name || "User";
    if (!tempUser && !dbUser) {
      return res.status(400).json({ message: "User not found. Please register again." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.setEx(`otp:${email}`, 600, otp);

    try {
      await sendOTPEmail(email, name, otp);
      res.status(200).json({ message: "OTP resent to your email" });
    } catch (emailErr) {
      console.log(`📋 DEV FALLBACK — Resent OTP for ${email}: ${otp}`);
      res.status(200).json({ message: "Email service unavailable — OTP printed to server console (dev mode)" });
    }
  } catch (err) {
    console.error("❌ ResendOTP ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, verifyOTP, login, resendOTP };

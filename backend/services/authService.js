const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const redisClient = require("../config/redis");
const sendOTPEmail = require("../utils/sendEmail");

class AuthServiceError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const generateTokens = async (user, res) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await redisClient.setEx(`refreshToken:${user._id}`, 604800, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return accessToken;
};

const registerUser = async (name, email, password) => {
  if (!name || !email || !password) {
    throw new AuthServiceError("Name, email and password are required", 400);
  }

  const existing = await User.findOne({ email });
  if (existing && existing.isVerified) {
    throw new AuthServiceError("Email already registered", 400);
  }
  if (existing && !existing.isVerified) {
    await User.deleteOne({ email });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await redisClient.setTempUser(email, { name, email, password: hashedPassword });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.setEx(`otp:${email}`, 600, otp);

  let emailSent = false;
  try {
    await sendOTPEmail(email, name, otp);
    emailSent = true;
  } catch (emailErr) {
    console.warn("⚠️  Email service unavailable:", emailErr?.body?.message || emailErr.message);
    console.log(`📋 DEV FALLBACK — OTP for ${email}: ${otp}`);
  }

  if (!emailSent) {
    await redisClient.del(`otp:${email}`);
    await redisClient.delTempUser(email);
    throw new AuthServiceError("Sorry, our email service is currently unavailable. Please try again later.", 500);
  }

  return { message: "OTP sent to your email", requireOTP: true };
};

const verifyUserOTP = async (email, otp, res) => {
  const savedOTP = await redisClient.get(`otp:${email}`);
  if (!savedOTP) throw new AuthServiceError("OTP expired. Please register again.", 400);
  if (savedOTP !== otp) throw new AuthServiceError("Invalid OTP. Please try again.", 400);

  const tempUser = await redisClient.getTempUser(email);
  if (!tempUser) throw new AuthServiceError("Session expired. Please register again.", 400);

  const user = new User({ ...tempUser, isVerified: true });
  await user.save();

  await redisClient.del(`otp:${email}`);
  await redisClient.delTempUser(email);

  const accessToken = await generateTokens(user, res);
  return {
    token: accessToken,
    user: { id: user._id, name: user.name, email: user.email },
  };
};

const loginUser = async (email, password, res) => {
  const user = await User.findOne({ email });
  if (!user) throw new AuthServiceError("No account found with this email", 400);
  if (!user.isVerified) throw new AuthServiceError("Please verify your email first", 400);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AuthServiceError("Incorrect password", 400);

  const accessToken = await generateTokens(user, res);
  return {
    token: accessToken,
    user: { id: user._id, name: user.name, email: user.email },
  };
};

const resendUserOTP = async (email) => {
  const tempUser = await redisClient.getTempUser(email);
  const dbUser   = await User.findOne({ email });

  const name = tempUser?.name || dbUser?.name || "User";
  if (!tempUser && !dbUser) {
    throw new AuthServiceError("User not found. Please register again.", 400);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.setEx(`otp:${email}`, 600, otp);

  try {
    await sendOTPEmail(email, name, otp);
    return { message: "OTP resent to your email" };
  } catch (emailErr) {
    console.error("⚠️ Email service unavailable:", emailErr.message);
    await redisClient.del(`otp:${email}`);
    throw new AuthServiceError("Sorry, our email service is currently unavailable. Please try again later.", 500);
  }
};

const refreshUserToken = async (token, res) => {
  if (!token) throw new AuthServiceError("No refresh token provided", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_SECRET);
  } catch (err) {
    throw new AuthServiceError("Invalid refresh token", 401);
  }

  const savedToken = await redisClient.get(`refreshToken:${decoded.id}`);
  if (!savedToken || savedToken !== token) {
    throw new AuthServiceError("Invalid or expired refresh token", 401);
  }

  const freshUser = await User.findById(decoded.id);
  if (!freshUser) throw new AuthServiceError("User no longer exists", 401);

  const newAccessToken = jwt.sign(
    { id: freshUser._id, email: freshUser.email, name: freshUser.name },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  return { token: newAccessToken };
};

const logoutUser = async (token, res) => {
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
      await redisClient.del(`refreshToken:${decoded.id}`);
    } catch (e) {}
  }
  res.clearCookie("refreshToken");
  return { message: "Logged out successfully" };
};

module.exports = {
  AuthServiceError,
  registerUser,
  verifyUserOTP,
  loginUser,
  resendUserOTP,
  refreshUserToken,
  logoutUser
};

const {
  AuthServiceError,
  registerUser,
  verifyUserOTP,
  loginUser,
  resendUserOTP,
  refreshUserToken,
  logoutUser
} = require("../services/authService");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser(name, email, password);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof AuthServiceError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("❌ Register ERROR:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await verifyUserOTP(email, otp, res);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof AuthServiceError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("❌ VerifyOTP ERROR:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password, res);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof AuthServiceError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("❌ Login ERROR:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await resendUserOTP(email);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof AuthServiceError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("❌ ResendOTP ERROR:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    const result = await refreshUserToken(token, res);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof AuthServiceError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("❌ RefreshToken ERROR:", err.message);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    const result = await logoutUser(token, res);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof AuthServiceError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    console.error("❌ Logout ERROR:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { register, verifyOTP, login, resendOTP, refreshToken, logout };

const express = require("express");
const router  = express.Router();
const { register, verifyOTP, login, resendOTP, refreshToken, logout } = require("../controllers/authController");
const { loginLimiter, registerLimiter, sendOtpLimiter, verifyOtpLimiter } = require('../middleware/rateLimiter');

router.post("/register",   registerLimiter, register);
router.post("/verify-otp", verifyOtpLimiter, verifyOTP);
router.post("/login",      loginLimiter, login);
router.post("/resend-otp", sendOtpLimiter, resendOTP);
router.post("/refresh",    refreshToken);
router.post("/logout",     logout);

module.exports = router;

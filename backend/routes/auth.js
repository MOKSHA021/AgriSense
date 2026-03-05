const express = require("express");
const router  = express.Router();
const { register, verifyOTP, login, resendOTP } = require("../controllers/authController");

router.post("/register",   register);
router.post("/verify-otp", verifyOTP);
router.post("/login",      login);
router.post("/resend-otp", resendOTP);

module.exports = router;

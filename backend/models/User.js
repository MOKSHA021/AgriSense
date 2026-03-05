const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,   // 🧠 no two users with same email
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false, // 🧠 false until OTP verified
    },
  },
  { timestamps: true } // 🧠 auto adds createdAt, updatedAt
);

module.exports = mongoose.model("User", userSchema);

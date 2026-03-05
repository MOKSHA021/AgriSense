const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // ✅ read INSIDE function — dotenv has already run by this point
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

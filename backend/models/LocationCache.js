const mongoose = require("mongoose");

const locationCacheSchema = new mongoose.Schema({
  query: { type: String, required: true, unique: true, index: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("LocationCache", locationCacheSchema);

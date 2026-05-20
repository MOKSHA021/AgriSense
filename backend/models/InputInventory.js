const mongoose = require("mongoose");

const inputInventorySchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    inputName: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    qtyPerAcre: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    sellerName: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    distanceKm: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQty: {
      type: Number,
      required: true,
      min: 0,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    source: {
      type: String,
      enum: ["seed", "seller"],
      default: "seed",
    },
  },
  { timestamps: true }
);

inputInventorySchema.index({ crop: 1, inputName: 1, district: 1, state: 1 });

module.exports = mongoose.model("InputInventory", inputInventorySchema);

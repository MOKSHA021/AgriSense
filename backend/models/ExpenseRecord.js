const mongoose = require("mongoose");

const cropPlanSchema = new mongoose.Schema(
  {
    crop: { type: String, default: "Wheat" },
    season: { type: String, default: "Rabi" },
    area: { type: String, default: "2" },
    expectedYield: { type: String, default: "22" },
    expectedPrice: { type: String, default: "2300" },
  },
  { _id: false }
);

const expenseItemSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const expenseRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: cropPlanSchema,
      default: () => ({}),
    },
    expenses: {
      type: [expenseItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExpenseRecord", expenseRecordSchema);

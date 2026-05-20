const express = require("express");
const auth = require("../middleware/auth");
const ExpenseRecord = require("../models/ExpenseRecord");

const router = express.Router();

const CATEGORIES = new Set([
  "Seeds",
  "Fertilizer",
  "Pesticide",
  "Labour",
  "Irrigation",
  "Equipment",
  "Transport",
  "Other",
]);

const normalizePlan = (plan = {}) => ({
  crop: String(plan.crop || "Wheat").trim() || "Wheat",
  season: String(plan.season || "Rabi").trim() || "Rabi",
  area: String(plan.area || "2").trim() || "2",
  expectedYield: String(plan.expectedYield || "22").trim() || "22",
  expectedPrice: String(plan.expectedPrice || "2300").trim() || "2300",
});

const getRecord = (userId) =>
  ExpenseRecord.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

router.get("/", auth, async (req, res) => {
  try {
    const record = await getRecord(req.user.id);
    res.json(record);
  } catch (err) {
    console.error("Expense fetch error:", err.message);
    res.status(500).json({ message: "Failed to load expenses" });
  }
});

router.put("/plan", auth, async (req, res) => {
  try {
    const record = await getRecord(req.user.id);
    record.plan = normalizePlan(req.body.plan || req.body);
    await record.save();
    res.json(record);
  } catch (err) {
    console.error("Expense plan update error:", err.message);
    res.status(500).json({ message: "Failed to update crop plan" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { category, amount, date, notes = "" } = req.body;
    const parsedAmount = Number(amount);

    if (!CATEGORIES.has(category)) {
      return res.status(400).json({ message: "Invalid expense category" });
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (!date || Number.isNaN(Date.parse(date))) {
      return res.status(400).json({ message: "A valid date is required" });
    }

    const record = await getRecord(req.user.id);
    record.expenses.push({
      id: Date.now(),
      category,
      amount: Math.round(parsedAmount * 100) / 100,
      date,
      notes: String(notes).trim().slice(0, 160),
    });
    await record.save();

    res.status(201).json(record);
  } catch (err) {
    console.error("Expense create error:", err.message);
    res.status(500).json({ message: "Failed to add expense" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const expenseId = Number(req.params.id);
    if (!Number.isFinite(expenseId)) {
      return res.status(400).json({ message: "Invalid expense id" });
    }

    const record = await getRecord(req.user.id);
    record.expenses = record.expenses.filter((expense) => expense.id !== expenseId);
    await record.save();

    res.json(record);
  } catch (err) {
    console.error("Expense delete error:", err.message);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

router.delete("/", auth, async (req, res) => {
  try {
    const record = await getRecord(req.user.id);
    record.expenses = [];
    await record.save();
    res.json(record);
  } catch (err) {
    console.error("Expense clear error:", err.message);
    res.status(500).json({ message: "Failed to clear expenses" });
  }
});

module.exports = router;

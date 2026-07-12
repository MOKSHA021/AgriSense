const ExpenseRecord = require("../models/ExpenseRecord");
const { CATEGORIES } = require("../data/referenceData");

const CATEGORY_SET = new Set(CATEGORIES);

const normalizePlan = (plan = {}) => ({
  crop: String(plan.crop || "Wheat").trim() || "Wheat",
  season: String(plan.season || "Rabi").trim() || "Rabi",
  area: String(plan.area || "2").trim() || "2",
  expectedYield: String(plan.expectedYield || "18").trim() || "18",
  expectedPrice: String(plan.expectedPrice || "2275").trim() || "2275",
});

const getRecord = (userId) =>
  ExpenseRecord.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

const fetchExpenses = async (userId) => {
  return await getRecord(userId);
};

const updateCropPlan = async (userId, planData) => {
  const record = await getRecord(userId);
  record.plan = normalizePlan(planData);
  await record.save();
  return record;
};

const addExpenseRecord = async (userId, category, amount, date, notes = "") => {
  const parsedAmount = Number(amount);

  if (!CATEGORY_SET.has(category)) {
    const err = new Error("Invalid expense category");
    err.status = 400;
    throw err;
  }

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    const err = new Error("Amount must be greater than 0");
    err.status = 400;
    throw err;
  }

  if (!date || Number.isNaN(Date.parse(date))) {
    const err = new Error("A valid date is required");
    err.status = 400;
    throw err;
  }

  const record = await getRecord(userId);
  record.expenses.push({
    id: Date.now(),
    category,
    amount: Math.round(parsedAmount * 100) / 100,
    date,
    notes: String(notes).trim().slice(0, 160),
  });
  await record.save();

  return record;
};

const deleteExpenseRecord = async (userId, expenseId) => {
  const parsedId = Number(expenseId);
  if (!Number.isFinite(parsedId)) {
    const err = new Error("Invalid expense id");
    err.status = 400;
    throw err;
  }

  const record = await getRecord(userId);
  record.expenses = record.expenses.filter((expense) => expense.id !== parsedId);
  await record.save();

  return record;
};

const clearAllExpenses = async (userId) => {
  const record = await getRecord(userId);
  record.expenses = [];
  await record.save();
  return record;
};

module.exports = {
  fetchExpenses,
  updateCropPlan,
  addExpenseRecord,
  deleteExpenseRecord,
  clearAllExpenses,
};

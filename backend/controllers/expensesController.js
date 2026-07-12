const expenseService = require("../services/expensesService");

const getExpenses = async (req, res) => {
  try {
    const record = await expenseService.fetchExpenses(req.user.id);
    res.json(record);
  } catch (err) {
    console.error("Expense fetch error:", err.message);
    res.status(500).json({ message: "Failed to load expenses" });
  }
};

const updatePlan = async (req, res) => {
  try {
    const record = await expenseService.updateCropPlan(req.user.id, req.body.plan || req.body);
    res.json(record);
  } catch (err) {
    console.error("Expense plan update error:", err.message);
    res.status(500).json({ message: "Failed to update crop plan" });
  }
};

const addExpense = async (req, res) => {
  try {
    const { category, amount, date, notes } = req.body;
    const record = await expenseService.addExpenseRecord(req.user.id, category, amount, date, notes);
    res.status(201).json(record);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("Expense create error:", err.message);
    res.status(500).json({ message: "Failed to add expense" });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const record = await expenseService.deleteExpenseRecord(req.user.id, req.params.id);
    res.json(record);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("Expense delete error:", err.message);
    res.status(500).json({ message: "Failed to delete expense" });
  }
};

const clearExpenses = async (req, res) => {
  try {
    const record = await expenseService.clearAllExpenses(req.user.id);
    res.json(record);
  } catch (err) {
    console.error("Expense clear error:", err.message);
    res.status(500).json({ message: "Failed to clear expenses" });
  }
};

module.exports = {
  getExpenses,
  updatePlan,
  addExpense,
  deleteExpense,
  clearExpenses,
};

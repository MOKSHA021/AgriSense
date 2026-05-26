const express = require("express");
const auth = require("../middleware/auth");
const {
  getExpenses,
  updatePlan,
  addExpense,
  deleteExpense,
  clearExpenses,
} = require("../controllers/expensesController");

const router = express.Router();

router.get("/", auth, getExpenses);
router.put("/plan", auth, updatePlan);
router.post("/", auth, addExpense);
router.delete("/:id", auth, deleteExpense);
router.delete("/", auth, clearExpenses);

module.exports = router;
 
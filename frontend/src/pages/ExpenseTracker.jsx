import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  Wallet,
  Plus,
  Trash2,
  TrendingUp,
  IndianRupee,
  BarChart3,
} from "lucide-react";

const CATEGORIES = [
  "Seeds",
  "Fertilizer",
  "Pesticide",
  "Labour",
  "Irrigation",
  "Equipment",
  "Transport",
  "Other",
];

const PREDICTED_REVENUE = 85000;

const STORAGE_KEY = "agrisense_expenses";

const loadExpenses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveExpenses = (expenses) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
};

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState(loadExpenses);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const estimatedProfit = PREDICTED_REVENUE - totalSpent;
  const profitRatio = PREDICTED_REVENUE > 0 ? estimatedProfit / PREDICTED_REVENUE : 0;

  let statusLabel, statusColor;
  if (profitRatio > 0.3) {
    statusLabel = "On Track";
    statusColor = "bg-green-100 text-green-700";
  } else if (profitRatio > 0.1) {
    statusLabel = "Tight";
    statusColor = "bg-amber-100 text-amber-700";
  } else {
    statusLabel = "Over Budget";
    statusColor = "bg-red-100 text-red-700";
  }

  const categoryTotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {});

  const maxCategoryTotal = Math.max(...Object.values(categoryTotals), 1);

  const handleAdd = (e) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;
    setExpenses((prev) => [
      ...prev,
      {
        id: Date.now(),
        category,
        amount: parsed,
        date,
        notes: notes.trim(),
      },
    ]);
    setAmount("");
    setNotes("");
  };

  const handleDelete = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleClearAll = () => {
    setExpenses([]);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Page title */}
        <div className="mb-8 flex items-center gap-2">
          <Wallet className="h-6 w-6 text-gray-900" />
          <h1 className="text-xl font-semibold text-gray-900">
            Expense Tracker
          </h1>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-1 text-xs font-medium text-gray-500">
              Total Spent
            </p>
            <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
              <IndianRupee className="h-4 w-4" />
              {totalSpent.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-1 text-xs font-medium text-gray-500">
              Predicted Revenue
            </p>
            <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
              <TrendingUp className="h-4 w-4" />
              {PREDICTED_REVENUE.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-1 text-xs font-medium text-gray-500">
              Estimated Profit
            </p>
            <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
              <IndianRupee className="h-4 w-4" />
              {estimatedProfit.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-1 text-xs font-medium text-gray-500">Status</p>
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-medium ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Add expense form */}
        <form
          onSubmit={handleAdd}
          className="mb-8 rounded-lg border border-gray-200 p-4"
        >
          <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <Plus className="h-4 w-4" />
            Add Expense
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">
                Notes
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 flex items-center gap-1.5 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </form>

        {/* Category breakdown */}
        {expenses.length > 0 && (
          <div className="mb-8 rounded-lg border border-gray-200 p-4">
            <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <BarChart3 className="h-4 w-4" />
              Category Breakdown
            </h2>
            <div className="space-y-3">
              {CATEGORIES.filter((cat) => categoryTotals[cat] > 0).map(
                (cat) => (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                      <span>{cat}</span>
                      <span className="font-medium text-gray-900">
                        {categoryTotals[cat].toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-gray-900"
                        style={{
                          width: `${(categoryTotals[cat] / maxCategoryTotal) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Expense list */}
        {expenses.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                All Expenses ({expenses.length})
              </h2>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-medium text-gray-500">
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Category</th>
                    <th className="pb-2 pr-4">Amount</th>
                    <th className="pb-2 pr-4">Notes</th>
                    <th className="pb-2" />
                  </tr>
                </thead>
                <tbody>
                  {[...expenses]
                    .sort((a, b) => b.id - a.id)
                    .map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b border-gray-100 text-gray-700"
                      >
                        <td className="py-2.5 pr-4 whitespace-nowrap">
                          {expense.date}
                        </td>
                        <td className="py-2.5 pr-4">{expense.category}</td>
                        <td className="py-2.5 pr-4 whitespace-nowrap font-medium text-gray-900">
                          {expense.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-500">
                          {expense.notes || "-"}
                        </td>
                        <td className="py-2.5">
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {expenses.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No expenses recorded yet. Add one above to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTracker;

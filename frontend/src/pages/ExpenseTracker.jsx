import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  Wallet,
  Plus,
  Trash2,
  TrendingUp,
  IndianRupee,
  BarChart3,
  Save,
  CheckCircle2,
  Download,
  FileText,
} from "lucide-react";
import API from "../services/api";

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

const PLAN_CROPS = [
  "Wheat",
  "Rice",
  "Maize",
  "Cotton",
  "Sugarcane",
  "Potato",
  "Soybean",
  "Groundnut",
  "Millets",
  "Sorghum",
  "Banana",
  "Jute",
];

const SEASONS = ["Kharif", "Rabi", "Zaid"];

const DEFAULT_PLAN = {
  crop: "Wheat",
  season: "Rabi",
  area: "2",
  expectedYield: "22",
  expectedPrice: "2300",
};

const currency = (value) => Number(value || 0).toLocaleString("en-IN");

const escapeCsv = (value) => {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [savedPlan, setSavedPlan] = useState(DEFAULT_PLAN);
  const [categories, setCategories] = useState([]);
  const [planCrops, setPlanCrops] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);
  const [error, setError] = useState("");
  const [planStatus, setPlanStatus] = useState("");

  useEffect(() => {
    let active = true;

    const loadReferenceData = async () => {
      try {
        const [catRes, cropRes, seasonRes] = await Promise.all([
          API.get("/reference/expense-categories"),
          API.get("/reference/plan-crops"),
          API.get("/reference/seasons"),
        ]);
        if (!active) return;
        setCategories(catRes.data.categories || []);
        setPlanCrops(cropRes.data.crops || []);
        setSeasons(seasonRes.data.seasons || []);
        setCategory(catRes.data.categories?.[0] || "");
      } catch (err) {
        if (active) {
          console.error("Failed to load reference data:", err);
          setCategories(CATEGORIES);
          setPlanCrops(PLAN_CROPS);
          setSeasons(SEASONS);
          setCategory(CATEGORIES[0]);
        }
      }
    };

    const loadRecord = async () => {
      try {
        const { data } = await API.get("/expenses");
        if (!active) return;
        const nextPlan = { ...DEFAULT_PLAN, ...(data.plan || {}) };
        setExpenses(data.expenses || []);
        setPlan(nextPlan);
        setSavedPlan(nextPlan);
        setPlanStatus("Forecast saved");
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Could not load expenses");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadReferenceData();
    loadRecord();
    return () => {
      active = false;
    };
  }, []);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const predictedRevenue =
    Number(plan.area || 0) *
    Number(plan.expectedYield || 0) *
    Number(plan.expectedPrice || 0);
  const estimatedProfit = predictedRevenue - totalSpent;
  const profitRatio = predictedRevenue > 0 ? estimatedProfit / predictedRevenue : 0;

  let statusLabel, statusColor;
  if (profitRatio > 0.3) {
    statusLabel = "On Track";
    statusColor = "bg-green-500/30 text-green-300 border-green-500/40";
  } else if (profitRatio > 0.1) {
    statusLabel = "Tight";
    statusColor = "bg-amber-500/30 text-amber-300 border-amber-500/40";
  } else {
    statusLabel = "Over Budget";
    statusColor = "bg-red-500/30 text-red-300 border-red-500/40";
  }

  const categoryTotals = categories.reduce((acc, cat) => {
    acc[cat] = expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {});

  const maxCategoryTotal = Math.max(...Object.values(categoryTotals), 1);
  const hasPlanChanges = JSON.stringify(plan) !== JSON.stringify(savedPlan);

  const handlePlanChange = (e) => {
    setPlan((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPlanStatus("Forecast changed");
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!hasPlanChanges) return;
    setSavingPlan(true);
    setError("");
    try {
      const { data } = await API.put("/expenses/plan", { plan });
      const nextPlan = { ...DEFAULT_PLAN, ...(data.plan || {}) };
      setPlan(nextPlan);
      setSavedPlan(nextPlan);
      setExpenses(data.expenses || []);
      setPlanStatus("Forecast saved");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save crop plan");
      setPlanStatus("Save failed");
    } finally {
      setSavingPlan(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) return;

    try {
      setSavingExpense(true);
      const { data } = await API.post("/expenses", {
        category,
        amount: parsed,
        date,
        notes,
      });
      setExpenses(data.expenses || []);
      setAmount("");
      setNotes("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not add expense");
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      const { data } = await API.delete(`/expenses/${id}`);
      setExpenses(data.expenses || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete expense");
    }
  };

  const handleClearAll = async () => {
    setError("");
    try {
      const { data } = await API.delete("/expenses");
      setExpenses(data.expenses || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not clear expenses");
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => b.id - a.id);

  const handleExportCsv = () => {
    const summaryRows = [
      ["AgriSense Expense Report"],
      ["Crop", plan.crop],
      ["Season", plan.season],
      ["Area", plan.area],
      ["Yield/acre", plan.expectedYield],
      ["Price/quintal", plan.expectedPrice],
      ["Predicted Revenue", predictedRevenue],
      ["Total Spent", totalSpent],
      ["Estimated Profit", estimatedProfit],
      ["Status", statusLabel],
      [],
      ["Date", "Category", "Amount", "Notes"],
    ];

    const expenseRows = sortedExpenses.map((expense) => [
      expense.date,
      expense.category,
      expense.amount,
      expense.notes || "",
    ]);

    const csv = [...summaryRows, ...expenseRows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `agrisense-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    const rows = sortedExpenses
      .map(
        (expense) => `
          <tr>
            <td>${escapeHtml(expense.date)}</td>
            <td>${escapeHtml(expense.category)}</td>
            <td>Rs ${currency(expense.amount)}</td>
            <td>${escapeHtml(expense.notes || "-")}</td>
          </tr>
        `,
      )
      .join("");

    const report = window.open("", "_blank", "width=900,height=700");
    if (!report) return;

    report.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>AgriSense Expense Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; padding: 32px; }
            h1 { margin: 0 0 6px; font-size: 24px; }
            .muted { color: #6b7280; margin-bottom: 24px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .card { border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; }
            .label { color: #6b7280; font-size: 12px; margin-bottom: 6px; }
            .value { font-weight: 700; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { border-bottom: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            th { color: #374151; background: #f3f4f6; }
            @media print { button { display: none; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <button onclick="window.print()" style="float:right;padding:8px 12px">Save as PDF</button>
          <h1>AgriSense Expense Report</h1>
          <div class="muted">${escapeHtml(plan.crop || "Crop")} / ${escapeHtml(plan.season || "Season")} - ${new Date().toLocaleDateString("en-IN")}</div>
          <div class="grid">
            <div class="card"><div class="label">Total Spent</div><div class="value">Rs ${currency(totalSpent)}</div></div>
            <div class="card"><div class="label">Predicted Revenue</div><div class="value">Rs ${currency(predictedRevenue)}</div></div>
            <div class="card"><div class="label">Estimated Profit</div><div class="value">Rs ${currency(estimatedProfit)}</div></div>
            <div class="card"><div class="label">Status</div><div class="value">${statusLabel}</div></div>
          </div>
          <h2>Expenses</h2>
          <table>
            <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Notes</th></tr></thead>
            <tbody>${rows || '<tr><td colspan="4">No expenses recorded.</td></tr>'}</tbody>
          </table>
        </body>
      </html>
    `);
    report.document.close();
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=1920&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/50 to-black/70" />
      </div>
      <div className="relative z-10">
        <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Page title */}
        <div className="mb-8">
          <div className="mb-1 flex items-center gap-3">
            <Wallet className="h-7 w-7 text-green-400" />
            <h1 className="text-2xl font-bold text-white">Expense Tracker</h1>
          </div>
          <p className="ml-10 text-sm text-white/50">
            Track farm spending against your current crop revenue forecast.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-lg backdrop-blur-xl">
            <p className="mb-1 text-xs font-medium text-white/55">
              Total Spent
            </p>
            <div className="flex items-center gap-1 text-lg font-semibold text-white">
              <IndianRupee className="h-4 w-4" />
              {totalSpent.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-lg backdrop-blur-xl">
            <p className="mb-1 text-xs font-medium text-white/55">
              Predicted Revenue
            </p>
            <div className="flex items-center gap-1 text-lg font-semibold text-white">
              <TrendingUp className="h-4 w-4" />
              {predictedRevenue.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-lg backdrop-blur-xl">
            <p className="mb-1 text-xs font-medium text-white/55">
              Estimated Profit
            </p>
            <div className="flex items-center gap-1 text-lg font-semibold text-white">
              <IndianRupee className="h-4 w-4" />
              {estimatedProfit.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 shadow-lg backdrop-blur-xl">
            <p className="mb-1 text-xs font-medium text-white/55">Status</p>
            <span
              className={`inline-block rounded-full border px-2.5 py-0.5 text-sm font-medium ${statusColor}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Crop plan */}
        <form
          onSubmit={handleSavePlan}
          className="mb-8 rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-xl"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-white">
              <TrendingUp className="h-4 w-4" />
              Current Forecast
            </h2>
            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
              {plan.crop || "Crop"} / {plan.season || "Season"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/55">
                Crop
              </label>
              <select
                name="crop"
                value={plan.crop}
                onChange={handlePlanChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-green-400"
              >
                {planCrops.map((crop) => (
                  <option key={crop} value={crop} className="bg-zinc-900 text-white">
                    {crop}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/55">
                Season
              </label>
              <select
                name="season"
                value={plan.season}
                onChange={handlePlanChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-green-400"
              >
                {seasons.map((season) => (
                  <option key={season} value={season} className="bg-zinc-900 text-white">
                    {season}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/55">
                Area
              </label>
              <input
                name="area"
                type="number"
                min="0"
                step="0.01"
                value={plan.area}
                onChange={handlePlanChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/55">
                Yield/acre
              </label>
              <input
                name="expectedYield"
                type="number"
                min="0"
                step="0.01"
                value={plan.expectedYield}
                onChange={handlePlanChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/55">
                Price/quintal
              </label>
              <input
                name="expectedPrice"
                type="number"
                min="0"
                step="0.01"
                value={plan.expectedPrice}
                onChange={handlePlanChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={savingPlan || !hasPlanChanges}
              className="flex items-center gap-1.5 rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-green-900/20 transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/35 disabled:shadow-none"
            >
              <Save className="h-4 w-4" />
              {savingPlan ? "Updating..." : "Update Forecast"}
            </button>
            {planStatus && (
              <p
                className={`flex items-center gap-1.5 text-xs ${
                  planStatus === "Save failed"
                    ? "text-red-300"
                    : hasPlanChanges
                      ? "text-amber-200"
                      : "text-green-300"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {planStatus}
              </p>
            )}
          </div>
        </form>

        {/* Add expense form */}
        <form
          onSubmit={handleAdd}
          className="mb-8 rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-xl"
        >
          <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            Add Expense
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-white/55">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-green-400"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/55">
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
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/55">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-white/55">
                Notes
              </label>
              <input
                type="text"
                placeholder="Optional"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={savingExpense}
            className="mt-4 flex items-center gap-1.5 rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-green-900/20 transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {savingExpense ? "Adding..." : "Add Expense"}
          </button>
        </form>

        {loading && (
          <div className="py-12 text-center text-sm text-white/80">
            Loading expenses...
          </div>
        )}

        {/* Category breakdown */}
        {!loading && expenses.length > 0 && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-xl">
            <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-white">
              <BarChart3 className="h-4 w-4" />
              Category Breakdown
            </h2>
            <div className="space-y-3">
              {categories.filter((cat) => categoryTotals[cat] > 0).map(
                (cat) => (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between text-xs text-white/55">
                      <span>{cat}</span>
                      <span className="font-medium text-white">
                        {categoryTotals[cat].toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-green-500"
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
        {!loading && expenses.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-lg backdrop-blur-xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white">
                All Expenses ({expenses.length})
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </button>
                <button
                  onClick={handleExportPdf}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-white/65 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <FileText className="h-3.5 w-3.5" />
                  PDF
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear All
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-medium text-white/55">
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
                        className="border-b border-white/10 text-white/70"
                      >
                        <td className="py-2.5 pr-4 whitespace-nowrap">
                          {expense.date}
                        </td>
                        <td className="py-2.5 pr-4">{expense.category}</td>
                        <td className="py-2.5 pr-4 whitespace-nowrap font-medium text-white">
                          {expense.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 pr-4 text-white/50">
                          {expense.notes || "-"}
                        </td>
                        <td className="py-2.5">
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="rounded-md p-1 text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-300"
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
        {!loading && expenses.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-black/40 py-12 text-center text-sm text-white/55 shadow-lg backdrop-blur-xl">
            No expenses recorded yet. Add one above to get started.
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default ExpenseTracker;

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
import { motion, AnimatePresence } from "framer-motion";

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

  let statusLabel, statusColor, statusBorder;
  if (profitRatio > 0.3) {
    statusLabel = "On Track";
    statusColor = "text-emerald-400 bg-emerald-500/10";
    statusBorder = "border-emerald-500/30";
  } else if (profitRatio > 0.1) {
    statusLabel = "Tight";
    statusColor = "text-amber-400 bg-amber-500/10";
    statusBorder = "border-amber-500/30";
  } else {
    statusLabel = "Over Budget";
    statusColor = "text-red-400 bg-red-500/10";
    statusBorder = "border-red-500/30";
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
    <div className="relative min-h-screen bg-transparent text-white selection:bg-emerald-500/30">
      
      <div className="relative z-10">
        <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Page title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Wallet className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Expense Tracker</h1>
            <p className="text-white/40 text-sm mt-1 font-medium">Track farm spending against your current crop revenue forecast.</p>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-medium text-red-400 flex items-center gap-3"
            >
              <Trash2 className="w-5 h-5" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary cards */}
        <div className="mb-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-xl backdrop-blur-2xl"
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Total Spent</p>
            <div className="flex items-center gap-1.5 text-3xl font-black text-white tracking-tighter">
              <span className="text-white/30 text-xl">₹</span>
              {totalSpent.toLocaleString("en-IN")}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-xl backdrop-blur-2xl"
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Predicted Revenue</p>
            <div className="flex items-center gap-1.5 text-3xl font-black text-emerald-400 tracking-tighter">
              <span className="text-emerald-500/30 text-xl">₹</span>
              {predictedRevenue.toLocaleString("en-IN")}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-xl backdrop-blur-2xl"
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Estimated Profit</p>
            <div className="flex items-center gap-1.5 text-3xl font-black text-white tracking-tighter">
              <span className="text-white/30 text-xl">₹</span>
              {estimatedProfit.toLocaleString("en-IN")}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-6 shadow-xl backdrop-blur-2xl flex flex-col justify-between"
          >
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Status</p>
            <div>
              <span className={`inline-block rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-inner ${statusColor} ${statusBorder}`}>
                {statusLabel}
              </span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          {/* Add expense form */}
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleAdd}
            className="lg:col-span-5 rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl h-fit"
          >
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Plus className="h-4 w-4 text-emerald-400" />
              </div>
              Add Expense
            </h2>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none focus:border-emerald-500 transition-colors appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-zinc-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white placeholder:text-white/20 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Notes</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white placeholder:text-white/20 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={savingExpense}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:from-emerald-400 hover:to-green-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {savingExpense ? "Adding..." : "Add Expense"}
            </button>
          </motion.form>

          <div className="lg:col-span-7 space-y-8">
            {/* Crop plan */}
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSavePlan}
              className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl"
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white tracking-tight">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <TrendingUp className="h-4 w-4 text-blue-400" />
                  </div>
                  Current Forecast
                </h2>
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-300">
                  {plan.crop || "Crop"} / {plan.season || "Season"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Crop</label>
                  <select
                    name="crop"
                    value={plan.crop}
                    onChange={handlePlanChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors appearance-none"
                  >
                    {planCrops.map((crop) => (
                      <option key={crop} value={crop} className="bg-zinc-900 text-white">
                        {crop}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Season</label>
                  <select
                    name="season"
                    value={plan.season}
                    onChange={handlePlanChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors appearance-none"
                  >
                    {seasons.map((season) => (
                      <option key={season} value={season} className="bg-zinc-900 text-white">
                        {season}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Area</label>
                  <input
                    name="area"
                    type="number"
                    min="0"
                    step="0.01"
                    value={plan.area}
                    onChange={handlePlanChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Yield/acre</label>
                  <input
                    name="expectedYield"
                    type="number"
                    min="0"
                    step="0.01"
                    value={plan.expectedYield}
                    onChange={handlePlanChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Price/qtl</label>
                  <input
                    name="expectedPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={plan.expectedPrice}
                    onChange={handlePlanChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={savingPlan || !hasPlanChanges}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all hover:from-blue-500 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  <Save className="h-4 w-4" />
                  {savingPlan ? "Updating..." : "Update Forecast"}
                </button>
                {planStatus && (
                  <p
                    className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${
                      planStatus === "Save failed"
                        ? "text-red-400"
                        : hasPlanChanges
                          ? "text-amber-400"
                          : "text-emerald-400"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {planStatus}
                  </p>
                )}
              </div>
            </motion.form>

            {/* Category breakdown */}
            {!loading && expenses.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl"
              >
                <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white tracking-tight">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                    <BarChart3 className="h-4 w-4 text-orange-400" />
                  </div>
                  Category Breakdown
                </h2>
                <div className="space-y-4">
                  {categories.filter((cat) => categoryTotals[cat] > 0).map(
                    (cat) => (
                      <div key={cat}>
                        <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/50">
                          <span>{cat}</span>
                          <span className="text-white">
                            ₹{categoryTotals[cat].toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-white/5 shadow-inner overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(categoryTotals[cat] / maxCategoryTotal) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Expense list */}
        {!loading && expenses.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                All Expenses 
                <span className="bg-white/10 text-white/70 text-xs px-2.5 py-1 rounded-md">{expenses.length}</span>
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/70 transition-all hover:bg-white/10 hover:text-white"
                >
                  <Download className="h-4 w-4" />
                  CSV
                </button>
                <button
                  onClick={handleExportPdf}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white/70 transition-all hover:bg-white/10 hover:text-white"
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.01]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-white/40">
                    <th className="p-4 pl-6">Date</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4 pr-6" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence>
                    {[...expenses]
                      .sort((a, b) => b.id - a.id)
                      .map((expense) => (
                        <motion.tr
                          initial={{ opacity: 0, backgroundColor: "rgba(255,255,255,0.05)" }}
                          animate={{ opacity: 1, backgroundColor: "transparent" }}
                          exit={{ opacity: 0, height: 0 }}
                          key={expense.id}
                          className="text-white/70 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="p-4 pl-6 whitespace-nowrap font-medium">
                            {expense.date}
                          </td>
                          <td className="p-4">
                            <span className="inline-block px-2.5 py-1 rounded-md bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/60">
                              {expense.category}
                            </span>
                          </td>
                          <td className="p-4 whitespace-nowrap font-bold text-white">
                            ₹{expense.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="p-4 text-white/40 font-medium">
                            {expense.notes || "-"}
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="rounded-lg p-2 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && expenses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[2rem] border border-white/5 bg-white/[0.02] py-16 text-center shadow-xl backdrop-blur-2xl flex flex-col items-center"
          >
            <Wallet className="w-12 h-12 text-white/10 mb-4" />
            <p className="text-white/40 font-medium">No expenses recorded yet.<br/>Add one above to get started.</p>
          </motion.div>
        )}
      </main>
      </div>
    </div>
  );
};

export default ExpenseTracker;

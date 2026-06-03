import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  Wallet, Plus, Trash2, TrendingUp, IndianRupee, BarChart3, Save, CheckCircle2, Download, FileText
} from "lucide-react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  "Seeds", "Fertilizer", "Pesticide", "Labour", "Irrigation", "Equipment", "Transport", "Other"
];

const PLAN_CROPS = [
  "Wheat", "Rice", "Maize", "Cotton", "Sugarcane", "Potato", "Soybean", "Groundnut", "Millets", "Sorghum", "Banana", "Jute"
];

const SEASONS = ["Kharif", "Rabi", "Zaid"];

const DEFAULT_PLAN = {
  crop: "Wheat", season: "Rabi", area: "2", expectedYield: "22", expectedPrice: "2300"
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
    statusColor = "text-[#0F6B4A] bg-[#E6F5EE]";
    statusBorder = "border-[#2BB673]/20";
  } else if (profitRatio > 0.1) {
    statusLabel = "Tight Budget";
    statusColor = "text-amber-700 bg-amber-50";
    statusBorder = "border-amber-250";
  } else {
    statusLabel = "Over Budget";
    statusColor = "text-red-700 bg-red-50";
    statusBorder = "border-red-200";
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
        category, amount: parsed, date, notes
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
      expense.date, expense.category, expense.amount, expense.notes || "",
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
    <div className="min-h-screen bg-[#F7F9FA] text-slate-800 selection:bg-emerald-100">
      <Navbar />

      <main className="dashboard-main-content max-w-5xl mx-auto px-6 py-8">
        
        {/* Page Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-4 pt-4"
        >
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
            <Wallet className="h-6 w-6 text-[#1E8E5A]" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0F6B4A] tracking-tight font-heading">Expense Tracker</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 font-semibold">
              Track seasonal farm expenditure next to predicted crop revenue indexes.
            </p>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-xs font-bold text-red-650 flex items-center gap-3 shadow-sm"
            >
              <Trash2 className="w-4 h-4" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Metric Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Spent", val: totalSpent, color: "text-slate-800" },
            { label: "Predicted Revenue", val: predictedRevenue, color: "text-[#1E8E5A]" },
            { label: "Estimated Net Margin", val: estimatedProfit, color: "text-[#0F6B4A]" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm"
            >
              <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
              <div className={`flex items-baseline gap-0.5 text-2xl font-black tracking-tight font-heading ${stat.color}`}>
                <span className="text-sm font-bold opacity-60 mr-0.5">₹</span>
                {stat.val.toLocaleString("en-IN")}
              </div>
            </motion.div>
          ))}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between"
          >
            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">Budget Status</p>
            <div>
              <span className={`inline-block rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wider shadow-sm ${statusColor} ${statusBorder}`}>
                {statusLabel}
              </span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left: Add expense form */}
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleAdd}
            className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit"
          >
            <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-800 tracking-tight font-heading uppercase">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm shrink-0">
                <Plus className="h-4 w-4 text-[#1E8E5A]" />
              </div>
              Record Expense
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition-colors focus:border-[#1E8E5A] focus:outline-none appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-white text-slate-800">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">Amount (INR)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-450 focus:border-[#1E8E5A] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">Transaction Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 focus:border-[#1E8E5A] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">Notes / Dealer</label>
                <input
                  type="text"
                  placeholder="e.g. Seed Purchase"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#1E8E5A] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingExpense}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-full bg-[#1E8E5A] hover:bg-[#0F6B4A] py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#1E8E5A]/10 transition-all disabled:opacity-50 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              {savingExpense ? "Saving..." : "Add Transaction"}
            </button>
          </motion.form>

          {/* Right: Crop plan & Forecast */}
          <div className="lg:col-span-7 space-y-6">
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              onSubmit={handleSavePlan}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 tracking-tight font-heading uppercase">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                    <TrendingUp className="h-4 w-4 text-[#2F80ED]" />
                  </div>
                  Crop Budget Forecast
                </h2>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#2F80ED]">
                  {plan.crop || "Crop"} / {plan.season || "Season"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">Crop Type</label>
                  <select
                    name="crop"
                    value={plan.crop}
                    onChange={handlePlanChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none appearance-none"
                  >
                    {planCrops.map((crop) => (
                      <option key={crop} value={crop} className="bg-white text-slate-800">
                        {crop}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">Season</label>
                  <select
                    name="season"
                    value={plan.season}
                    onChange={handlePlanChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none appearance-none"
                  >
                    {seasons.map((season) => (
                      <option key={season} value={season} className="bg-white text-slate-800">
                        {season}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">Area (Acres)</label>
                  <input
                    name="area"
                    type="number"
                    min="0"
                    step="0.01"
                    value={plan.area}
                    onChange={handlePlanChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">Yield/Acre (Qtl)</label>
                  <input
                    name="expectedYield"
                    type="number"
                    min="0"
                    step="0.01"
                    value={plan.expectedYield}
                    onChange={handlePlanChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">Price/Qtl (INR)</label>
                  <input
                    name="expectedPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={plan.expectedPrice}
                    onChange={handlePlanChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
                <button
                  type="submit"
                  disabled={savingPlan || !hasPlanChanges}
                  className="flex items-center gap-2 rounded-full bg-[#2F80ED] hover:bg-[#1B6AD1] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#2F80ED]/10 transition-all disabled:opacity-50 active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  {savingPlan ? "Updating..." : "Update Forecast"}
                </button>
                {planStatus && (
                  <p
                    className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${
                      planStatus === "Save failed"
                        ? "text-red-500"
                        : hasPlanChanges
                          ? "text-amber-500"
                          : "text-[#0F6B4A]"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {planStatus}
                  </p>
                )}
              </div>
            </motion.form>

            {/* Category breakdown progress indicators */}
            {!loading && expenses.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
              >
                <h2 className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-800 tracking-tight font-heading uppercase">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 shadow-sm shrink-0">
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </div>
                  Category Expenditures
                </h2>
                <div className="space-y-4">
                  {categories.filter((cat) => categoryTotals[cat] > 0).map(
                    (cat) => (
                      <div key={cat}>
                        <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <span>{cat}</span>
                          <span className="text-slate-800">
                            ₹{categoryTotals[cat].toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 border border-slate-200/20 shadow-inner overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(categoryTotals[cat] / maxCategoryTotal) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-[#1E8E5A] rounded-full"
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

        {/* Expense transactions list */}
        {!loading && expenses.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-base font-bold text-slate-800 tracking-tight font-heading flex items-center gap-2">
                All Transactions 
                <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-md border border-slate-200/50">{expenses.length}</span>
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-800"
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </button>
                <button
                  onClick={handleExportPdf}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-800"
                >
                  <FileText className="h-3.5 w-3.5" />
                  PDF
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-red-650 transition-all hover:bg-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/50">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <th className="p-4 pl-6">Date</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Notes</th>
                    <th className="p-4 pr-6" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                    {sortedExpenses.map((expense) => (
                      <motion.tr
                        initial={{ opacity: 0, backgroundColor: "rgba(240,247,244,0.3)" }}
                        animate={{ opacity: 1, backgroundColor: "transparent" }}
                        exit={{ opacity: 0 }}
                        key={expense.id}
                        className="text-slate-650 hover:bg-slate-50/60 transition-colors"
                      >
                        <td className="p-4 pl-6 whitespace-nowrap font-bold text-slate-700">
                          {expense.date}
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/50 text-[9px] font-black uppercase tracking-wider text-slate-500">
                            {expense.category}
                          </span>
                        </td>
                        <td className="p-4 whitespace-nowrap font-black text-slate-800">
                          ₹{expense.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="p-4 text-slate-400 font-semibold truncate max-w-[150px]">
                          {expense.notes || "-"}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="rounded-lg p-2 text-slate-350 transition-colors hover:bg-red-50 hover:text-red-500"
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

        {/* Empty state panel */}
        {!loading && expenses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-slate-200 rounded-3xl py-16 text-center shadow-sm flex flex-col items-center justify-center"
          >
            <Wallet className="w-10 h-10 text-slate-300 mb-4" />
            <p className="text-slate-400 font-semibold text-sm">No recorded transactions for this forecast cycle.<br/>Input a transaction above to log metrics.</p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ExpenseTracker;

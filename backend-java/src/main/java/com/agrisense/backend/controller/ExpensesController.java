package com.agrisense.backend.controller;

import com.agrisense.backend.model.ExpenseRecord;
import com.agrisense.backend.repository.ExpenseRecordRepository;
import com.agrisense.backend.security.AgriSensePrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Expenses controller — mirrors controllers/expensesController.js
 *
 * GET    /api/expenses        → fetch or create ExpenseRecord for user
 * POST   /api/expenses        → add expense item
 * DELETE /api/expenses/{id}   → delete expense item by id
 * POST   /api/expenses/plan   → update crop forecast plan
 * DELETE /api/expenses/clear  → clear all expenses
 */
@RestController
@RequestMapping("/api/expenses")
public class ExpensesController {

    private static final Logger log = LoggerFactory.getLogger(ExpensesController.class);

    private static final Set<String> VALID_CATEGORIES = Set.of(
        "Seeds", "Fertilizer", "Pesticide", "Labour",
        "Irrigation", "Equipment", "Transport", "Other"
    );

    private final ExpenseRecordRepository expenseRepo;

    public ExpensesController(ExpenseRecordRepository expenseRepo) {
        this.expenseRepo = expenseRepo;
    }

    // ── Upsert helper (mirrors getRecord() in Node) ──────────────────

    private ExpenseRecord getOrCreateRecord(String userId) {
        return expenseRepo.findByUser(userId).orElseGet(() -> {
            ExpenseRecord rec = new ExpenseRecord();
            rec.setUser(userId);
            rec.setPlan(new ExpenseRecord.CropPlan());
            rec.setExpenses(new ArrayList<>());
            return expenseRepo.save(rec);
        });
    }

    // ── GET /api/expenses ────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<?> getExpenses(@AuthenticationPrincipal AgriSensePrincipal principal) {
        try {
            ExpenseRecord record = getOrCreateRecord(principal.getUserId());
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            log.error("Expense fetch error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed to load expenses"));
        }
    }

    // ── POST /api/expenses ───────────────────────────────────────────

    @PostMapping
    public ResponseEntity<?> addExpense(
            @AuthenticationPrincipal AgriSensePrincipal principal,
            @RequestBody Map<String, Object> body) {
        try {
            String category = getString(body, "category");
            double amount   = toDouble(body.get("amount"));
            String date     = getString(body, "date");
            String notes    = getString(body, "notes");

            if (!VALID_CATEGORIES.contains(category))
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid expense category"));
            if (amount <= 0)
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Amount must be greater than 0"));
            if (date == null || date.isBlank())
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "A valid date is required"));

            ExpenseRecord record = getOrCreateRecord(principal.getUserId());

            ExpenseRecord.ExpenseItem item = new ExpenseRecord.ExpenseItem();
            item.setId(System.currentTimeMillis());
            item.setCategory(category);
            item.setAmount(Math.round(amount * 100.0) / 100.0);
            item.setDate(date);
            item.setNotes(notes != null ? notes.substring(0, Math.min(notes.length(), 160)) : "");

            record.getExpenses().add(item);
            record = expenseRepo.save(record);

            return ResponseEntity.status(201).body(record);
        } catch (Exception e) {
            log.error("Expense create error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed to add expense"));
        }
    }

    // ── DELETE /api/expenses/{id} ────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(
            @AuthenticationPrincipal AgriSensePrincipal principal,
            @PathVariable Long id) {
        try {
            ExpenseRecord record = getOrCreateRecord(principal.getUserId());
            record.getExpenses().removeIf(e -> e.getId() != null && e.getId().equals(id));
            record = expenseRepo.save(record);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            log.error("Expense delete error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed to delete expense"));
        }
    }

    // ── POST /api/expenses/plan ──────────────────────────────────────

    @RequestMapping(path = "/plan", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<?> updatePlan(
            @AuthenticationPrincipal AgriSensePrincipal principal,
            @RequestBody Map<String, Object> body) {
        try {
            // Accept both { plan: {...} } and flat { crop, season, ... }
            Map<String, Object> planData = body.containsKey("plan")
                    ? (Map<String, Object>) body.get("plan")
                    : body;

            ExpenseRecord record = getOrCreateRecord(principal.getUserId());

            ExpenseRecord.CropPlan plan = new ExpenseRecord.CropPlan();
            plan.setCrop(getStrOrDefault(planData, "crop",          "Wheat"));
            plan.setSeason(getStrOrDefault(planData, "season",      "Rabi"));
            plan.setArea(getStrOrDefault(planData, "area",          "2"));
            plan.setExpectedYield(getStrOrDefault(planData, "expectedYield", "18"));
            plan.setExpectedPrice(getStrOrDefault(planData, "expectedPrice", "2275"));

            record.setPlan(plan);
            record = expenseRepo.save(record);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            log.error("Expense plan update error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed to update crop plan"));
        }
    }

    // ── DELETE /api/expenses/clear ───────────────────────────────────

    @DeleteMapping({"", "/", "/clear"})
    public ResponseEntity<?> clearExpenses(
            @AuthenticationPrincipal AgriSensePrincipal principal) {
        try {
            ExpenseRecord record = getOrCreateRecord(principal.getUserId());
            record.setExpenses(new ArrayList<>());
            record = expenseRepo.save(record);
            return ResponseEntity.ok(record);
        } catch (Exception e) {
            log.error("Expense clear error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed to clear expenses"));
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private String getString(Map<String, Object> m, String k) {
        Object v = m.get(k);
        return v != null ? v.toString().trim() : "";
    }

    private String getStrOrDefault(Map<String, Object> m, String k, String def) {
        Object v = m.get(k);
        return (v != null && !v.toString().isBlank()) ? v.toString().trim() : def;
    }

    private double toDouble(Object v) {
        if (v == null) return 0.0;
        try { return Double.parseDouble(v.toString()); } catch (Exception e) { return 0.0; }
    }
}

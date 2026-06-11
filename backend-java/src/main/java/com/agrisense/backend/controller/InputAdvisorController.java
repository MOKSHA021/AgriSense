package com.agrisense.backend.controller;

import com.agrisense.backend.model.InputInventory;
import com.agrisense.backend.repository.InputInventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Input Advisor controller — mirrors controllers/inputAdvisorController.js
 *
 * GET  /api/input-advisor/crops       → list supported crops
 * POST /api/input-advisor/recommend   → compute input recommendations for a crop + area
 */
@RestController
@RequestMapping("/api/input-advisor")
public class InputAdvisorController {

    private static final Logger log = LoggerFactory.getLogger(InputAdvisorController.class);

    private final InputInventoryRepository inventoryRepo;

    public InputAdvisorController(InputInventoryRepository inventoryRepo) {
        this.inventoryRepo = inventoryRepo;
    }

    private static final Map<String, List<Map<String, Object>>> CROP_REQUIREMENTS = Map.of(
        "Wheat", List.of(
            Map.of("inputName", "Seed",         "displayName", "Wheat Seeds",              "qtyPerAcre", 40.0, "unit", "kg"),
            Map.of("inputName", "DAP",          "displayName", "Root Booster Fertilizer",  "qtyPerAcre", 50.0, "unit", "kg"),
            Map.of("inputName", "Urea",         "displayName", "Growth Fertilizer",        "qtyPerAcre", 60.0, "unit", "kg"),
            Map.of("inputName", "Zinc Sulphate","displayName", "Micronutrient Fertilizer", "qtyPerAcre", 10.0, "unit", "kg")
        ),
        "Rice", List.of(
            Map.of("inputName", "Seed", "displayName", "Rice Seeds",             "qtyPerAcre", 25.0, "unit", "kg"),
            Map.of("inputName", "DAP",  "displayName", "Root Booster Fertilizer","qtyPerAcre", 45.0, "unit", "kg"),
            Map.of("inputName", "Urea", "displayName", "Growth Fertilizer",      "qtyPerAcre", 80.0, "unit", "kg"),
            Map.of("inputName", "MOP",  "displayName", "Potash Fertilizer",      "qtyPerAcre", 30.0, "unit", "kg")
        ),
        "Maize", List.of(
            Map.of("inputName", "Seed",         "displayName", "Maize Seeds",              "qtyPerAcre", 20.0, "unit", "kg"),
            Map.of("inputName", "DAP",          "displayName", "Root Booster Fertilizer",  "qtyPerAcre", 55.0, "unit", "kg"),
            Map.of("inputName", "Urea",         "displayName", "Growth Fertilizer",        "qtyPerAcre", 70.0, "unit", "kg"),
            Map.of("inputName", "Zinc Sulphate","displayName", "Micronutrient Fertilizer", "qtyPerAcre", 12.0, "unit", "kg")
        ),
        "Cotton", List.of(
            Map.of("inputName", "Seed", "displayName", "Cotton Seeds",           "qtyPerAcre",  3.0, "unit", "kg"),
            Map.of("inputName", "DAP",  "displayName", "Root Booster Fertilizer","qtyPerAcre", 40.0, "unit", "kg"),
            Map.of("inputName", "Urea", "displayName", "Growth Fertilizer",      "qtyPerAcre", 50.0, "unit", "kg"),
            Map.of("inputName", "MOP",  "displayName", "Potash Fertilizer",      "qtyPerAcre", 25.0, "unit", "kg")
        ),
        "Sugarcane", List.of(
            Map.of("inputName", "Setts","displayName", "Sugarcane Setts",        "qtyPerAcre", 25000.0, "unit", "buds"),
            Map.of("inputName", "DAP",  "displayName", "Root Booster Fertilizer","qtyPerAcre",    60.0, "unit", "kg"),
            Map.of("inputName", "Urea", "displayName", "Growth Fertilizer",      "qtyPerAcre",   100.0, "unit", "kg"),
            Map.of("inputName", "MOP",  "displayName", "Potash Fertilizer",      "qtyPerAcre",    40.0, "unit", "kg")
        ),
        "Potato", List.of(
            Map.of("inputName", "Seed", "displayName", "Potato Seeds",           "qtyPerAcre", 800.0, "unit", "kg"),
            Map.of("inputName", "DAP",  "displayName", "Root Booster Fertilizer","qtyPerAcre",  50.0, "unit", "kg"),
            Map.of("inputName", "Urea", "displayName", "Growth Fertilizer",      "qtyPerAcre",  60.0, "unit", "kg"),
            Map.of("inputName", "MOP",  "displayName", "Potash Fertilizer",      "qtyPerAcre",  50.0, "unit", "kg")
        ),
        "Soybean", List.of(
            Map.of("inputName", "Seed", "displayName", "Soybean Seeds",          "qtyPerAcre", 30.0, "unit", "kg"),
            Map.of("inputName", "DAP",  "displayName", "Root Booster Fertilizer","qtyPerAcre", 40.0, "unit", "kg"),
            Map.of("inputName", "Urea", "displayName", "Growth Fertilizer",      "qtyPerAcre", 20.0, "unit", "kg")
        ),
        "Groundnut", List.of(
            Map.of("inputName", "Seed",  "displayName", "Groundnut Seeds",       "qtyPerAcre",  50.0, "unit", "kg"),
            Map.of("inputName", "SSP",   "displayName", "Root Booster Fertilizer","qtyPerAcre",100.0, "unit", "kg"),
            Map.of("inputName", "Gypsum","displayName", "Soil Conditioner",      "qtyPerAcre", 200.0, "unit", "kg")
        )
    );

    // ── GET /api/input-advisor/crops ─────────────────────────────────

    @GetMapping("/crops")
    public ResponseEntity<?> listCrops() {
        return ResponseEntity.ok(Map.of("crops", new ArrayList<>(CROP_REQUIREMENTS.keySet())));
    }

    // ── POST /api/input-advisor/recommend ────────────────────────────

    @PostMapping("/recommend")
    public ResponseEntity<?> recommendInputs(@RequestBody Map<String, Object> body) {
        try {
            String crop      = getString(body, "crop");
            double acres     = toDouble(body.get("area"));
            String location  = getString(body, "location");
            boolean inStockOnly = Boolean.parseBoolean(getString(body, "inStockOnly"));

            List<Map<String, Object>> requirements = CROP_REQUIREMENTS.get(crop);
            if (requirements == null)
                return ResponseEntity.badRequest().body(Map.of("message", "Unsupported crop"));
            if (acres <= 0)
                return ResponseEntity.badRequest().body(Map.of("message", "Area must be greater than 0"));

            List<String> inputNames = requirements.stream()
                    .map(r -> (String) r.get("inputName"))
                    .collect(Collectors.toList());

            List<InputInventory> inventory = inventoryRepo.findByCropAndInputNameIn(crop, inputNames);

            List<Map<String, Object>> recommendations = new ArrayList<>();
            double totalCost = 0;

            for (Map<String, Object> req : requirements) {
                String inputName   = (String) req.get("inputName");
                String displayName = (String) req.get("displayName");
                double qtyPerAcre  = (Double) req.get("qtyPerAcre");
                String unit        = (String) req.get("unit");
                double totalQty    = qtyPerAcre * acres;

                List<Map<String, Object>> sellers = inventory.stream()
                        .filter(inv -> inv.getInputName().equals(inputName))
                        .map(inv -> {
                            boolean inStock = inv.getStockQty() != null && inv.getStockQty() >= totalQty;
                            Map<String, Object> s = new LinkedHashMap<>();
                            s.put("id",           inv.getId());
                            s.put("name",         inv.getSellerName());
                            s.put("district",     inv.getDistrict());
                            s.put("state",        inv.getState());
                            s.put("distanceKm",   inv.getDistanceKm());
                            s.put("price",        inv.getPricePerUnit());
                            s.put("stockQty",     inv.getStockQty());
                            s.put("inStock",      inStock);
                            s.put("phone",        inv.getPhone());
                            s.put("source",       inv.getSource());
                            s.put("locationScore",locationScore(inv, location));
                            return s;
                        })
                        .filter(s -> !inStockOnly || (Boolean) s.get("inStock"))
                        .sorted(Comparator
                                .comparingInt((Map<String, Object> s) -> (Boolean) s.get("inStock") ? 0 : 1)
                                .thenComparingInt(s -> -((int) s.get("locationScore")))
                                .thenComparingDouble(s -> toDouble(s.get("price")))
                                .thenComparingDouble(s -> toDouble(s.get("distanceKm"))))
                        .limit(3)
                        .collect(Collectors.toList());

                Map<String, Object> bestSeller = sellers.isEmpty() ? null : sellers.get(0);
                double bestPrice = bestSeller != null ? toDouble(bestSeller.get("price")) : 0;
                double cost      = bestSeller != null ? totalQty * bestPrice : 0;
                totalCost += cost;

                Map<String, Object> rec = new LinkedHashMap<>();
                rec.put("name",        inputName);
                rec.put("displayName", displayName);
                rec.put("qtyPerAcre",  qtyPerAcre);
                rec.put("unit",        unit);
                rec.put("totalQty",    totalQty);
                rec.put("bestPrice",   bestPrice);
                rec.put("cost",        cost);
                rec.put("sellers",     sellers);
                recommendations.add(rec);
            }

            return ResponseEntity.ok(Map.of(
                "crop",            crop,
                "area",            acres,
                "location",        location,
                "recommendations", recommendations,
                "totalCost",       totalCost,
                "dataSource",      "MongoDB inventory seeded with demo seller records"
            ));

        } catch (Exception e) {
            log.error("Input advisor error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed to build input recommendations"));
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private int locationScore(InputInventory inv, String location) {
        if (location == null || location.isBlank()) return 0;
        String needle   = location.toLowerCase();
        String district = inv.getDistrict() != null ? inv.getDistrict().toLowerCase() : "";
        String state    = inv.getState()    != null ? inv.getState().toLowerCase()    : "";
        if (!district.isBlank() && needle.contains(district)) return 2;
        if (!state.isBlank()    && needle.contains(state))    return 1;
        return 0;
    }

    private double toDouble(Object v) {
        if (v == null) return 0.0;
        try { return Double.parseDouble(v.toString()); } catch (Exception e) { return 0.0; }
    }

    private String getString(Map<String, Object> m, String k) {
        Object v = m.get(k);
        return v != null ? v.toString().trim() : "";
    }
}

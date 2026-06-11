package com.agrisense.backend.service;

import com.agrisense.backend.model.InputInventory;
import com.agrisense.backend.repository.InputInventoryRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Seeds the InputInventory collection on startup if empty.
 * Mirrors ensureSeedInventory() + buildSeedInventory() in inputAdvisorController.js.
 */
@Component
public class InputInventorySeeder {

    private static final Logger log = LoggerFactory.getLogger(InputInventorySeeder.class);

    private final InputInventoryRepository repository;

    public InputInventorySeeder(InputInventoryRepository repository) {
        this.repository = repository;
    }

    // ── Static data (mirrors inputAdvisorController.js constants) ──

    private static final Map<String, List<Map<String, Object>>> CROP_REQUIREMENTS = Map.of(
        "Wheat", List.of(
            Map.of("inputName", "Seed",         "displayName", "Wheat Seeds",              "qtyPerAcre", 40.0,     "unit", "kg"),
            Map.of("inputName", "DAP",          "displayName", "Root Booster Fertilizer",  "qtyPerAcre", 50.0,     "unit", "kg"),
            Map.of("inputName", "Urea",         "displayName", "Growth Fertilizer",        "qtyPerAcre", 60.0,     "unit", "kg"),
            Map.of("inputName", "Zinc Sulphate","displayName", "Micronutrient Fertilizer", "qtyPerAcre", 10.0,     "unit", "kg")
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
            Map.of("inputName", "Seed",  "displayName", "Groundnut Seeds",    "qtyPerAcre",  50.0, "unit", "kg"),
            Map.of("inputName", "SSP",   "displayName", "Root Booster Fertilizer", "qtyPerAcre", 100.0, "unit", "kg"),
            Map.of("inputName", "Gypsum","displayName", "Soil Conditioner",   "qtyPerAcre", 200.0, "unit", "kg")
        )
    );

    private static final List<Map<String, Object>> SELLERS = List.of(
        Map.of("sellerName", "Agri Seeds Hub",      "district", "Hyderabad",   "state", "Telangana",   "distanceKm", 2.3, "phone", "9000001001"),
        Map.of("sellerName", "Kisan Beej Kendra",   "district", "Medchal",     "state", "Telangana",   "distanceKm", 4.1, "phone", "9000001002"),
        Map.of("sellerName", "Sri Fertilizers",     "district", "Hyderabad",   "state", "Telangana",   "distanceKm", 1.5, "phone", "9000001003"),
        Map.of("sellerName", "National Agro Store", "district", "Rangareddy",  "state", "Telangana",   "distanceKm", 3.7, "phone", "9000001004"),
        Map.of("sellerName", "Green Valley Inputs", "district", "Medchal",     "state", "Telangana",   "distanceKm", 5.2, "phone", "9000001005"),
        Map.of("sellerName", "District Agri Mart",  "district", "Nashik",      "state", "Maharashtra", "distanceKm", 6.4, "phone", "9000001006")
    );

    private static final Map<String, double[]> PRICE_BY_INPUT = Map.of(
        "Seed",          new double[]{48, 55, 52},
        "DAP",           new double[]{24, 27, 26},
        "Urea",          new double[]{5.5, 6, 6.2},
        "Zinc Sulphate", new double[]{78, 85, 90},
        "MOP",           new double[]{16, 18, 17.5},
        "Setts",         new double[]{0.35, 0.4, 0.42},
        "SSP",           new double[]{7, 8, 8.5},
        "Gypsum",        new double[]{3.5, 4, 4.2}
    );

    @PostConstruct
    public void seed() {
        if (repository.count() > 0) {
            log.info("[Seeder] InputInventory already seeded, skipping.");
            return;
        }

        log.info("[Seeder] Seeding InputInventory collection...");
        List<InputInventory> docs = new ArrayList<>();

        for (Map.Entry<String, List<Map<String, Object>>> cropEntry : CROP_REQUIREMENTS.entrySet()) {
            String crop = cropEntry.getKey();
            for (Map<String, Object> requirement : cropEntry.getValue()) {
                String inputName    = (String) requirement.get("inputName");
                String displayName  = (String) requirement.get("displayName");
                double qtyPerAcre   = (Double) requirement.get("qtyPerAcre");
                String unit         = (String) requirement.get("unit");
                double[] prices     = PRICE_BY_INPUT.getOrDefault(inputName, new double[]{30, 32, 34});

                for (int i = 0; i < Math.min(4, SELLERS.size()); i++) {
                    Map<String, Object> seller = SELLERS.get(i);
                    double pricePerUnit = prices[i % prices.length];
                    double stockQty     = qtyPerAcre * (i == 3 ? 1.5 : 25 + i * 10);

                    InputInventory inv = new InputInventory();
                    inv.setCrop(crop);
                    inv.setInputName(inputName);
                    inv.setDisplayName(displayName);
                    inv.setQtyPerAcre(qtyPerAcre);
                    inv.setUnit(unit);
                    inv.setSellerName((String) seller.get("sellerName"));
                    inv.setDistrict((String) seller.get("district"));
                    inv.setState((String) seller.get("state"));
                    inv.setDistanceKm(((Number) seller.get("distanceKm")).doubleValue());
                    inv.setPricePerUnit(pricePerUnit);
                    inv.setStockQty((double) Math.round(stockQty));
                    inv.setPhone((String) seller.get("phone"));
                    inv.setSource("seed");
                    docs.add(inv);
                }
            }
        }

        repository.saveAll(docs);
        log.info("[Seeder] Seeded {} InputInventory documents.", docs.size());
    }
}

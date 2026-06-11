package com.agrisense.backend.controller;

import com.agrisense.backend.model.ChosenCrop;
import com.agrisense.backend.repository.ChosenCropRepository;
import com.agrisense.backend.security.AgriSensePrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

/**
 * Reference data controller — mirrors routes/reference.js
 *
 * All static reference data + risk engine + chosen-crop tracking.
 */
@RestController
@RequestMapping("/api/reference")
public class ReferenceController {

    private static final Logger log = LoggerFactory.getLogger(ReferenceController.class);
    private static final int CROP_THRESHOLD = 15;

    private final ChosenCropRepository chosenCropRepo;

    public ReferenceController(ChosenCropRepository chosenCropRepo) {
        this.chosenCropRepo = chosenCropRepo;
    }

    // ── Static Data ──────────────────────────────────────────────────

    @GetMapping("/expense-categories")
    public ResponseEntity<?> expenseCategories() {
        return ResponseEntity.ok(Map.of("categories", List.of(
            "Seeds","Fertilizer","Pesticide","Labour","Irrigation","Equipment","Transport","Other"
        )));
    }

    @GetMapping("/plan-crops")
    public ResponseEntity<?> planCrops() {
        return ResponseEntity.ok(Map.of("crops", List.of(
            "Wheat","Rice","Maize","Cotton","Sugarcane","Potato","Soybean",
            "Groundnut","Millets","Sorghum","Banana","Jute"
        )));
    }

    @GetMapping("/seasons")
    public ResponseEntity<?> seasons() {
        return ResponseEntity.ok(Map.of("seasons", List.of("Kharif","Rabi","Zaid")));
    }

    @GetMapping("/soil-database")
    public ResponseEntity<?> soilDatabase() {
        return ResponseEntity.ok(Map.of("soilDatabase", buildSoilDatabase()));
    }

    @GetMapping("/soil-presets")
    public ResponseEntity<?> soilPresets() {
        return ResponseEntity.ok(Map.of("soilPresets", Map.of(
            "Alluvial",  Map.of("N", 80, "P", 40, "K", 40),
            "Black",     Map.of("N", 60, "P", 30, "K", 50),
            "Red",       Map.of("N", 40, "P", 20, "K", 30),
            "Laterite",  Map.of("N", 30, "P", 15, "K", 25),
            "Sandy",     Map.of("N", 20, "P", 10, "K", 15)
        )));
    }

    @GetMapping("/crops")
    public ResponseEntity<?> crops() {
        return ResponseEntity.ok(Map.of("crops", buildCropsData()));
    }

    @GetMapping("/input-crop-requirements")
    public ResponseEntity<?> inputCropRequirements() {
        return ResponseEntity.ok(Map.of("cropRequirements", buildInputCropRequirements()));
    }

    // ── Risk Engine ──────────────────────────────────────────────────

    @PostMapping("/compute-risks")
    public ResponseEntity<?> computeRisks(@RequestBody Map<String, Object> body) {
        Object currentObj  = body.get("current");
        Object forecastObj = body.get("forecast");
        if (currentObj == null || forecastObj == null)
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "current and forecast data are required"));

        Map<String, Object>       current  = (Map<String, Object>) currentObj;
        List<Map<String, Object>> forecast = (List<Map<String, Object>>) forecastObj;

        List<Map<String, Object>> risks = computeRisksLogic(current, forecast);
        return ResponseEntity.ok(Map.of("risks", risks));
    }

    @PostMapping("/safe-crops")
    public ResponseEntity<?> safeCrops(@RequestBody Map<String, Object> body) {
        Object risksObj = body.get("risks");
        if (risksObj == null || !(risksObj instanceof List))
            return ResponseEntity.badRequest().body(Map.of("message", "risks array is required"));

        List<Map<String, Object>> risks = (List<Map<String, Object>>) risksObj;
        List<Map<String, Object>> safeCrops = getSafeCropsLogic(risks);
        return ResponseEntity.ok(Map.of("safeCrops", safeCrops));
    }

    // ── Chosen Crop ──────────────────────────────────────────────────

    @PostMapping("/choose-crop")
    public ResponseEntity<?> chooseCrop(
            @AuthenticationPrincipal AgriSensePrincipal principal,
            @RequestBody Map<String, Object> body) {
        try {
            String crop     = getString(body, "crop");
            String district = getString(body, "district");

            if (crop.isBlank() || district.isBlank())
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "crop and district are required"));

            String normDistrict = district.trim().toLowerCase();

            long count = chosenCropRepo.countByDistrictAndCrop(normDistrict, crop);
            if (count >= CROP_THRESHOLD)
                return ResponseEntity.badRequest().body(Map.of("message",
                    "Overproduction Alert: The threshold limit of " + CROP_THRESHOLD +
                    " selections for " + crop + " has already been reached in " + district +
                    ". Please choose a different crop."));

            ChosenCrop choice = chosenCropRepo.findByUser(principal.getUserId())
                    .orElseGet(ChosenCrop::new);
            choice.setUser(principal.getUserId());
            choice.setCrop(crop);
            choice.setDistrict(normDistrict);
            choice = chosenCropRepo.save(choice);

            return ResponseEntity.ok(Map.of(
                "message", "Crop choice recorded successfully",
                "choice",  choice
            ));
        } catch (Exception e) {
            log.error("Choose crop error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed to record crop choice"));
        }
    }

    @GetMapping("/district-crop-counts")
    public ResponseEntity<?> districtCropCounts(@RequestParam String district) {
        if (district == null || district.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "district is required"));

        try {
            String normDistrict = district.trim().toLowerCase();
            List<ChosenCropRepository.CropCount> counts =
                    chosenCropRepo.countByCropInDistrict(normDistrict);

            Map<String, Long> countsMap = new LinkedHashMap<>();
            counts.forEach(c -> countsMap.put(c.get_id(), c.getCount()));

            return ResponseEntity.ok(Map.of(
                "district",  normDistrict,
                "counts",    countsMap,
                "threshold", CROP_THRESHOLD
            ));
        } catch (Exception e) {
            log.error("Get crop counts error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed to load district crop statistics"));
        }
    }

    @GetMapping("/user-chosen-crop")
    public ResponseEntity<?> userChosenCrop(
            @AuthenticationPrincipal AgriSensePrincipal principal) {
        try {
            Optional<ChosenCrop> choice = chosenCropRepo.findByUser(principal.getUserId());
            return ResponseEntity.ok(Map.of("choice", choice.orElse(null) != null ? choice.get() : ""));
        } catch (Exception e) {
            log.error("Get user chosen crop error: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed to fetch user crop choice"));
        }
    }

    // ── Risk Computation Logic ────────────────────────────────────────

    private List<Map<String, Object>> computeRisksLogic(
            Map<String, Object> current, List<Map<String, Object>> forecast) {

        Map<String, Object> main = current.containsKey("main")
                ? (Map<String, Object>) current.get("main")
                : current;

        double temp     = toDouble(main.get("temp"),     25);
        double humidity = toDouble(main.get("humidity"), 50);

        double totalRainMm = forecast.stream()
                .mapToDouble(item -> {
                    Object rain = item.get("rain");
                    if (rain instanceof Map) {
                        return toDouble(((Map<?, ?>) rain).get("3h"), 0);
                    }
                    return 0;
                }).sum();

        boolean hasRainForecast = totalRainMm > 0;

        // Flood Risk
        String floodLevel, floodDesc, floodAction;
        if (totalRainMm > 200) {
            floodLevel  = "HIGH";
            floodDesc   = String.format("Heavy rainfall forecast (%.0fmm). Waterlogging and flooding likely.", totalRainMm);
            floodAction = "Clear drainage channels immediately. Move livestock to higher ground. Avoid low-lying fields.";
        } else if (totalRainMm > 100) {
            floodLevel  = "MEDIUM";
            floodDesc   = String.format("Moderate rainfall expected (%.0fmm). Some waterlogging possible.", totalRainMm);
            floodAction = "Ensure drainage systems are functioning. Delay sowing in flood-prone areas.";
        } else {
            floodLevel  = "LOW";
            floodDesc   = "No significant rainfall expected. Fields are safe.";
            floodAction = "Continue normal operations and monitor weather updates.";
        }

        // Drought Risk
        String droughtLevel, droughtDesc, droughtAction;
        if (humidity < 30 && !hasRainForecast) {
            droughtLevel  = "HIGH";
            droughtDesc   = String.format("Very low humidity (%.0f%%) with no rain forecast. Severe moisture deficit likely.", humidity);
            droughtAction = "Increase irrigation frequency. Apply mulch to retain soil moisture. Consider drought-resistant varieties.";
        } else if (humidity < 50) {
            droughtLevel  = "MEDIUM";
            droughtDesc   = String.format("Below-average humidity (%.0f%%). Moderate moisture stress possible.", humidity);
            droughtAction = "Monitor soil moisture closely. Schedule supplemental irrigation if needed.";
        } else {
            droughtLevel  = "LOW";
            droughtDesc   = "Adequate moisture levels detected. No drought concern.";
            droughtAction = "Maintain regular irrigation schedule.";
        }

        // Heat Stress
        String heatLevel, heatDesc, heatAction;
        if (temp > 40) {
            heatLevel  = "HIGH";
            heatDesc   = String.format("Extreme temperature (%.0f°C). Crop wilting and heat damage expected.", temp);
            heatAction = "Irrigate early morning and late evening. Provide shade for nurseries. Avoid midday field work.";
        } else if (temp > 35) {
            heatLevel  = "MEDIUM";
            heatDesc   = String.format("Elevated temperature (%.0f°C). Some heat-sensitive crops may be affected.", temp);
            heatAction = "Increase watering frequency. Monitor for signs of heat stress in crops.";
        } else {
            heatLevel  = "LOW";
            heatDesc   = "Temperature is within a safe range for most crops.";
            heatAction = "No special measures needed. Continue regular field work.";
        }

        // Frost Risk
        String frostLevel, frostDesc, frostAction;
        if (temp < 5) {
            frostLevel  = "HIGH";
            frostDesc   = String.format("Near-freezing temperature (%.0f°C). Frost damage to crops is highly likely.", temp);
            frostAction = "Cover sensitive crops with row covers or mulch. Avoid sowing frost-sensitive varieties. Use smudge pots if available.";
        } else if (temp < 10) {
            frostLevel  = "MEDIUM";
            frostDesc   = String.format("Cool temperature (%.0f°C). Light frost possible during early morning.", temp);
            frostAction = "Monitor overnight temperatures. Prepare frost covers for vulnerable crops.";
        } else {
            frostLevel  = "LOW";
            frostDesc   = "No frost risk at current temperatures.";
            frostAction = "No protective measures required.";
        }

        List<Map<String, Object>> allRisks = List.of(
            Map.of("name", "Flood Risk",   "icon", "Droplets",    "level", floodLevel,   "description", floodDesc,   "action", floodAction),
            Map.of("name", "Drought Risk", "icon", "Sun",         "level", droughtLevel, "description", droughtDesc, "action", droughtAction),
            Map.of("name", "Heat Stress",  "icon", "Thermometer", "level", heatLevel,    "description", heatDesc,    "action", heatAction),
            Map.of("name", "Frost Risk",   "icon", "Snowflake",   "level", frostLevel,   "description", frostDesc,   "action", frostAction)
        );

        return allRisks.stream()
                .filter(r -> !r.get("level").equals("LOW"))
                .collect(Collectors.toList());
    }

    // ── Safe Crops Logic ─────────────────────────────────────────────

    private List<Map<String, Object>> getSafeCropsLogic(List<Map<String, Object>> risks) {
        Map<String, String> levels = new HashMap<>();
        risks.forEach(r -> levels.put((String) r.get("name"), (String) r.get("level")));

        List<Map<String, Object>> crops = new ArrayList<>();

        if ("HIGH".equals(levels.get("Flood Risk"))) {
            crops.add(Map.of("name", "Rice (Paddy)", "reason", "Thrives in waterlogged conditions and tolerates excess moisture."));
            crops.add(Map.of("name", "Jute",         "reason", "Grows well in high-moisture and humid environments."));
        }
        if ("HIGH".equals(levels.get("Drought Risk"))) {
            crops.add(Map.of("name", "Pearl Millet (Bajra)", "reason", "Highly drought-tolerant and requires minimal water."));
            crops.add(Map.of("name", "Sorghum (Jowar)",      "reason", "Deep root system helps survive prolonged dry spells."));
        }
        if ("HIGH".equals(levels.get("Heat Stress")) || "MEDIUM".equals(levels.get("Heat Stress"))) {
            crops.add(Map.of("name", "Finger Millet (Ragi)", "reason", "Heat-tolerant and nutritious grain suitable for hot climates."));
            crops.add(Map.of("name", "Sesame (Til)",         "reason", "Performs well under high temperature and low rainfall."));
        }
        if ("HIGH".equals(levels.get("Frost Risk")) || "MEDIUM".equals(levels.get("Frost Risk"))) {
            crops.add(Map.of("name", "Wheat",   "reason", "Cold-hardy crop that tolerates low temperatures well."));
            crops.add(Map.of("name", "Mustard", "reason", "Grows well in cool weather and withstands light frost."));
        }
        if (crops.isEmpty()) {
            crops.addAll(List.of(
                Map.of("name", "Wheat",              "reason", "Versatile crop suitable for moderate conditions."),
                Map.of("name", "Rice (Paddy)",       "reason", "Stable choice with favorable weather conditions."),
                Map.of("name", "Maize",              "reason", "Good yield potential in current low-risk conditions."),
                Map.of("name", "Pulses (Moong/Urad)","reason", "Short-duration crops ideal when conditions are favorable.")
            ));
        }

        // Deduplicate
        Set<String> seen = new LinkedHashSet<>();
        return crops.stream()
                .filter(c -> seen.add((String) c.get("name")))
                .limit(4)
                .collect(Collectors.toList());
    }

    // ── Static Data Builders ─────────────────────────────────────────

    private Map<String, Object> buildSoilDatabase() {
        return Map.of(
            "Alluvial",  Map.of("color","Light grey to ash grey","texture","Sandy loam to clay loam","drainage","Well-drained","phRange","6.5 - 8.0","crops",List.of("Rice","Wheat","Sugarcane","Maize","Cotton")),
            "Black",     Map.of("color","Deep black to dark grey","texture","Clayey and compact","drainage","Poor (high water retention)","phRange","7.2 - 8.5","crops",List.of("Cotton","Sorghum","Wheat","Sugarcane","Groundnut")),
            "Red",       Map.of("color","Red to reddish-brown","texture","Sandy to clayey","drainage","Moderate","phRange","5.5 - 7.0","crops",List.of("Millets","Groundnut","Potato","Maize","Pulses")),
            "Laterite",  Map.of("color","Reddish-brown","texture","Coarse and gravelly","drainage","Excessive","phRange","5.0 - 6.5","crops",List.of("Tea","Coffee","Cashew","Rubber","Coconut")),
            "Sandy",     Map.of("color","Light yellow to brown","texture","Sandy","drainage","Excessive","phRange","5.5 - 7.5","crops",List.of("Watermelon","Muskmelon","Groundnut","Sorghum","Millets")),
            "Clay",      Map.of("color","Grey to brown","texture","Clayey","drainage","Poor","phRange","6.0 - 8.0","crops",List.of("Rice","Wheat","Sugarcane","Cotton","Soybean")),
            "Loamy",     Map.of("color","Dark brown","texture","Loam","drainage","Well-drained","phRange","6.0 - 7.5","crops",List.of("Wheat","Maize","Potato","Vegetables","Pulses")),
            "Peaty",     Map.of("color","Dark brown to black","texture","Spongy and organic","drainage","Poor","phRange","4.5 - 6.0","crops",List.of("Rice","Vegetables","Tea","Coffee","Fruits"))
        );
    }

    private List<Map<String, Object>> buildCropsData() {
        return List.of(
            crop("Rice",     List.of(60,120),  List.of(20,60),  List.of(20,60),  List.of(20,35),  List.of(60,90),  List.of(5.5,7.0),  List.of(150,300), true,  true,  20,  2100, 0.6, "Maintain 5 cm standing water during tillering stage."),
            crop("Wheat",    List.of(80,150),  List.of(30,60),  List.of(20,50),  List.of(10,25),  List.of(40,70),  List.of(6.0,7.5),  List.of(50,100),  true,  false, 18,  2275, 0.6, "Sow in mid-November for optimal vernalisation."),
            crop("Maize",    List.of(80,150),  List.of(30,60),  List.of(20,50),  List.of(18,35),  List.of(50,80),  List.of(5.5,7.5),  List.of(60,110),  true,  true,  22,  1870, 0.6, "Apply nitrogen in three split doses for better cob filling."),
            crop("Sugarcane",List.of(100,200), List.of(40,80),  List.of(40,80),  List.of(25,40),  List.of(60,90),  List.of(6.0,7.5),  List.of(100,200), true,  false, 350, 350,  0.6, "Use trench planting method for better ratoon management."),
            crop("Millets",  List.of(20,60),   List.of(10,30),  List.of(10,30),  List.of(25,40),  List.of(30,60),  List.of(5.0,7.0),  List.of(30,80),   false, true,  8,   2800, 0.4, "Sow at onset of monsoon for best germination."),
            crop("Cotton",   List.of(60,120),  List.of(30,60),  List.of(30,60),  List.of(20,35),  List.of(50,80),  List.of(6.0,8.0),  List.of(50,100),  true,  true,  15,  6500, 0.5, "Ensure proper spacing for better boll development."),
            crop("Potato",   List.of(80,120),  List.of(40,80),  List.of(80,120), List.of(15,25),  List.of(70,90),  List.of(5.0,6.5),  List.of(40,80),   true,  false, 200, 1200, 0.5, "Plant in well-drained sandy loam soil."),
            crop("Soybean",  List.of(20,40),   List.of(30,60),  List.of(20,40),  List.of(20,30),  List.of(60,80),  List.of(6.0,7.0),  List.of(60,100),  true,  true,  12,  4500, 0.4, "Inoculate seeds with rhizobium for better nitrogen fixation."),
            crop("Groundnut",List.of(20,40),   List.of(30,50),  List.of(20,40),  List.of(25,35),  List.of(50,70),  List.of(5.5,7.0),  List.of(50,80),   true,  true,  15,  5500, 0.4, "Harvest when 75% of pods are mature.")
        );
    }

    private Map<String, Object> crop(String name, List<?> N, List<?> P, List<?> K,
                                      List<?> temp, List<?> humidity, List<?> ph, List<?> rainfall,
                                      boolean irrigated, boolean rainfed,
                                      int yield, int price, double costPct, String tip) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name",      name);     m.put("N",         N);
        m.put("P",         P);        m.put("K",         K);
        m.put("temp",      temp);     m.put("humidity",  humidity);
        m.put("ph",        ph);       m.put("rainfall",  rainfall);
        m.put("irrigated", irrigated);m.put("rainfed",   rainfed);
        m.put("yield",     yield);    m.put("price",     price);
        m.put("cost_pct",  costPct);  m.put("tip",       tip);
        return m;
    }

    private Map<String, List<Map<String, Object>>> buildInputCropRequirements() {
        return Map.of(
            "Wheat", List.of(
                Map.of("inputName","Seed",         "displayName","Wheat Seeds",              "qtyPerAcre",40,  "unit","kg"),
                Map.of("inputName","DAP",          "displayName","Root Booster Fertilizer",  "qtyPerAcre",50,  "unit","kg"),
                Map.of("inputName","Urea",         "displayName","Growth Fertilizer",        "qtyPerAcre",60,  "unit","kg"),
                Map.of("inputName","Zinc Sulphate","displayName","Micronutrient Fertilizer", "qtyPerAcre",10,  "unit","kg")
            ),
            "Rice", List.of(
                Map.of("inputName","Seed","displayName","Rice Seeds",             "qtyPerAcre",25,"unit","kg"),
                Map.of("inputName","DAP", "displayName","Root Booster Fertilizer","qtyPerAcre",45,"unit","kg"),
                Map.of("inputName","Urea","displayName","Growth Fertilizer",      "qtyPerAcre",80,"unit","kg"),
                Map.of("inputName","MOP", "displayName","Potash Fertilizer",      "qtyPerAcre",30,"unit","kg")
            ),
            "Maize", List.of(
                Map.of("inputName","Seed",         "displayName","Maize Seeds",              "qtyPerAcre",20,"unit","kg"),
                Map.of("inputName","DAP",          "displayName","Root Booster Fertilizer",  "qtyPerAcre",55,"unit","kg"),
                Map.of("inputName","Urea",         "displayName","Growth Fertilizer",        "qtyPerAcre",70,"unit","kg"),
                Map.of("inputName","Zinc Sulphate","displayName","Micronutrient Fertilizer", "qtyPerAcre",12,"unit","kg")
            ),
            "Cotton", List.of(
                Map.of("inputName","Seed","displayName","Cotton Seeds",           "qtyPerAcre", 3,"unit","kg"),
                Map.of("inputName","DAP", "displayName","Root Booster Fertilizer","qtyPerAcre",40,"unit","kg"),
                Map.of("inputName","Urea","displayName","Growth Fertilizer",      "qtyPerAcre",50,"unit","kg"),
                Map.of("inputName","MOP", "displayName","Potash Fertilizer",      "qtyPerAcre",25,"unit","kg")
            ),
            "Sugarcane", List.of(
                Map.of("inputName","Setts","displayName","Sugarcane Setts",       "qtyPerAcre",25000,"unit","buds"),
                Map.of("inputName","DAP",  "displayName","Root Booster Fertilizer","qtyPerAcre",  60,"unit","kg"),
                Map.of("inputName","Urea", "displayName","Growth Fertilizer",     "qtyPerAcre", 100,"unit","kg"),
                Map.of("inputName","MOP",  "displayName","Potash Fertilizer",     "qtyPerAcre",  40,"unit","kg")
            ),
            "Potato", List.of(
                Map.of("inputName","Seed","displayName","Potato Seeds",           "qtyPerAcre",800,"unit","kg"),
                Map.of("inputName","DAP", "displayName","Root Booster Fertilizer","qtyPerAcre", 50,"unit","kg"),
                Map.of("inputName","Urea","displayName","Growth Fertilizer",      "qtyPerAcre", 60,"unit","kg"),
                Map.of("inputName","MOP", "displayName","Potash Fertilizer",      "qtyPerAcre", 50,"unit","kg")
            ),
            "Soybean", List.of(
                Map.of("inputName","Seed","displayName","Soybean Seeds",          "qtyPerAcre",30,"unit","kg"),
                Map.of("inputName","DAP", "displayName","Root Booster Fertilizer","qtyPerAcre",40,"unit","kg"),
                Map.of("inputName","Urea","displayName","Growth Fertilizer",      "qtyPerAcre",20,"unit","kg")
            ),
            "Groundnut", List.of(
                Map.of("inputName","Seed",  "displayName","Groundnut Seeds",    "qtyPerAcre", 50,"unit","kg"),
                Map.of("inputName","SSP",   "displayName","Root Booster Fertilizer","qtyPerAcre",100,"unit","kg"),
                Map.of("inputName","Gypsum","displayName","Soil Conditioner",   "qtyPerAcre",200,"unit","kg")
            )
        );
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private double toDouble(Object v, double def) {
        if (v == null) return def;
        try { return Double.parseDouble(v.toString()); } catch (Exception e) { return def; }
    }

    private String getString(Map<String, Object> m, String k) {
        Object v = m.get(k);
        return v != null ? v.toString().trim() : "";
    }
}

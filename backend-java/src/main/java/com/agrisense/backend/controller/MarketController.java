package com.agrisense.backend.controller;

import com.agrisense.backend.service.DataGovService;
import com.agrisense.backend.service.ScraperService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Market controller — mirrors controllers/marketController.js
 *
 * GET  /api/market/districts    → unique districts from data.gov.in
 * GET  /api/market/live-prices  → data.gov.in or scraper fallback
 * POST /api/market/best-mandis  → ranked mandis from data.gov.in or static fallback
 * POST /api/market/predict      → statistical price prediction
 */
@RestController
@RequestMapping("/api/market")
public class MarketController {

    private static final Logger log = LoggerFactory.getLogger(MarketController.class);

    private final DataGovService dataGovService;
    private final ScraperService scraperService;

    // Static fallback mandi data (mirrors data/mandiData.js)
    private static final Map<String, List<Map<String, Object>>> MANDI_DATA = buildMandiData();

    public MarketController(DataGovService dataGovService, ScraperService scraperService) {
        this.dataGovService = dataGovService;
        this.scraperService = scraperService;
    }

    // ── GET /api/market/districts ────────────────────────────────────

    @GetMapping("/districts")
    public ResponseEntity<?> getDistricts(@RequestParam String state) {
        if (state == null || state.isBlank())
            return ResponseEntity.badRequest().body(Map.of("message", "state is required"));

        try {
            List<Map<String, Object>> records = dataGovService.fetchRecords(
                    Map.of("State", state), 1000);

            if (records.isEmpty())
                return ResponseEntity.status(404)
                        .body(Map.of("message", "No data found for state: " + state));

            List<String> districts = records.stream()
                    .map(r -> (String) r.get("District"))
                    .filter(d -> d != null && !d.isBlank())
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of("districts", districts, "state", state));
        } catch (Exception e) {
            log.error("[Districts] {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed to fetch districts"));
        }
    }

    // ── GET /api/market/live-prices ──────────────────────────────────

    @GetMapping("/live-prices")
    public ResponseEntity<?> getLivePrices(
            @RequestParam String crop,
            @RequestParam String state,
            @RequestParam(required = false) String district) {

        if (crop == null || state == null)
            return ResponseEntity.badRequest().body(Map.of("message", "crop and state are required"));

        try {
            List<Map<String, Object>> scraped = new ArrayList<>();
            String source = "todaypricerates";

            if (district != null && !district.isBlank()) {
                List<Map<String, Object>> records = dataGovService.fetchRecords(
                        Map.of("State", state, "District", district, "Commodity", crop), 100);
                if (!records.isEmpty()) {
                    scraped = records.stream().map(r -> {
                        double min   = toDouble(r.get("Min_Price"));
                        double max   = toDouble(r.get("Max_Price"));
                        double modal = toDouble(r.get("Modal_Price"));
                        Map<String, Object> m = new LinkedHashMap<>();
                        m.put("commodity",   r.getOrDefault("Commodity", ""));
                        m.put("unit",        "Quintal");
                        m.put("mandiPrice",  modal);
                        m.put("minPrice",    min);
                        m.put("maxPrice",    max);
                        m.put("modalPrice",  modal);
                        m.put("priceChange", 0);
                        m.put("trend",       "stable");
                        m.put("date",        r.getOrDefault("Arrival_Date", ""));
                        m.put("state",       r.getOrDefault("State", ""));
                        m.put("district",    r.getOrDefault("District", ""));
                        m.put("market",      r.getOrDefault("Market", ""));
                        m.put("source",      "data.gov.in");
                        return m;
                    }).collect(Collectors.toList());
                    source = "data.gov.in";
                }
            }

            if (scraped.isEmpty()) {
                scraped = scraperService.scrapeVegetablePrices(state, crop);
                source = "todaypricerates";
            }

            if (scraped.isEmpty())
                return ResponseEntity.status(404)
                        .body(Map.of("message", "No price found for " + crop + " in " + state));

            List<Double> prices = scraped.stream()
                    .map(r -> toDouble(r.get("modalPrice")))
                    .filter(p -> p > 0)
                    .collect(Collectors.toList());
            long avgModal = Math.round(prices.stream().mapToDouble(Double::doubleValue).average().orElse(0));
            double minPrice = scraped.stream().mapToDouble(r -> toDouble(r.get("minPrice"))).min().orElse(0);
            double maxPrice = scraped.stream().mapToDouble(r -> toDouble(r.get("maxPrice"))).max().orElse(0);

            return ResponseEntity.ok(Map.of(
                "markets",  scraped,
                "avgModal", avgModal,
                "minPrice", minPrice,
                "maxPrice", maxPrice,
                "crop",     crop,
                "state",    state,
                "district", district != null ? district : "",
                "source",   source
            ));

        } catch (Exception e) {
            log.error("[LivePrices] {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Scraping failed. Try again."));
        }
    }

    // ── POST /api/market/best-mandis ─────────────────────────────────

    @PostMapping("/best-mandis")
    public ResponseEntity<?> getBestMandis(@RequestBody Map<String, Object> body) {
        String crop     = getString(body, "crop");
        String quantity = getString(body, "quantity");
        String state    = getString(body, "state");
        String district = getString(body, "district");

        if (crop.isBlank() || quantity.isBlank() || state.isBlank() || district.isBlank())
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "crop, quantity, state and district are required"));

        try {
            List<Map<String, Object>> records = dataGovService.fetchRecords(
                    Map.of("State", state, "District", district, "Commodity", crop), 100);

            List<Map<String, Object>> mandis;

            if (!records.isEmpty()) {
                // Sort by date descending, deduplicate by market name
                records.sort((a, b) -> {
                    String da = (String) a.getOrDefault("Arrival_Date", "");
                    String db_ = (String) b.getOrDefault("Arrival_Date", "");
                    return dateToComparable(db_).compareTo(dateToComparable(da));
                });

                Set<String> seen = new LinkedHashSet<>();
                mandis = records.stream()
                        .filter(r -> seen.add((String) r.getOrDefault("Market", "")))
                        .map(r -> dataGovService.cleanRecord(r))
                        .filter(r -> toDouble(r.get("modalPrice")) > 0)
                        .map(r -> {
                            Map<String, Object> m = new LinkedHashMap<>();
                            m.put("name",         r.get("market"));
                            m.put("district",     r.get("district"));
                            m.put("variety",      r.get("variety"));
                            m.put("grade",        r.get("grade"));
                            m.put("date",         r.get("date"));
                            m.put("lat",          null);
                            m.put("lng",          null);
                            m.put("pricePerUnit", r.get("modalPrice"));
                            m.put("isRealData",   true);
                            return m;
                        })
                        .sorted(Comparator.comparingDouble(
                                (Map<String, Object> m) -> toDouble(m.get("pricePerUnit"))).reversed())
                        .collect(Collectors.toList());
            } else {
                List<Map<String, Object>> mockList = MANDI_DATA.getOrDefault(state, Collections.emptyList());
                mandis = mockList.stream()
                        .filter(m -> ((Map<?, ?>) m.get("prices")).containsKey(crop))
                        .map(m -> {
                            Map<String, Object> prices = (Map<String, Object>) m.get("prices");
                            Map<String, Object> out = new LinkedHashMap<>();
                            out.put("name",         m.get("name"));
                            out.put("district",     m.get("district"));
                            out.put("lat",          m.getOrDefault("lat", null));
                            out.put("lng",          m.getOrDefault("lng", null));
                            out.put("pricePerUnit", toDouble(prices.get(crop)));
                            out.put("isRealData",   false);
                            return out;
                        })
                        .sorted(Comparator.comparingDouble(
                                (Map<String, Object> m) -> toDouble(m.get("pricePerUnit"))).reversed())
                        .collect(Collectors.toList());
            }

            if (mandis.isEmpty())
                return ResponseEntity.status(404).body(Map.of("message", "No mandi data found"));

            return ResponseEntity.ok(Map.of(
                "mandis",   mandis,
                "crop",     crop,
                "quantity", quantity,
                "state",    state,
                "district", district
            ));

        } catch (Exception e) {
            log.error("[BestMandis] {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Failed to fetch mandi data"));
        }
    }

    // ── POST /api/market/predict ─────────────────────────────────────

    @PostMapping("/predict")
    public ResponseEntity<?> predictPrice(@RequestBody Map<String, Object> body) {
        String crop     = getString(body, "crop");
        String state    = getString(body, "state");
        String district = getString(body, "district");
        String season   = getString(body, "season");
        String year     = getString(body, "year");

        if (crop.isBlank() || state.isBlank() || season.isBlank() || year.isBlank())
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "crop, state, season and year are required"));

        try {
            Map<String, String> filters = new LinkedHashMap<>();
            filters.put("State",     state);
            filters.put("Commodity", crop);
            if (!district.isBlank()) filters.put("District", district);

            List<Map<String, Object>> records = dataGovService.fetchRecords(filters, 100);
            if (records.isEmpty() && !district.isBlank()) {
                filters.remove("District");
                records = dataGovService.fetchRecords(filters, 100);
            }

            if (records.isEmpty())
                return ResponseEntity.status(404)
                        .body(Map.of("message", "No historical data for " + crop + " in " + state));

            List<Double> prices = records.stream()
                    .map(r -> toDouble(r.get("Modal_Price")))
                    .filter(p -> p > 0)
                    .collect(Collectors.toList());

            if (prices.isEmpty())
                return ResponseEntity.status(404).body(Map.of("message", "No valid prices found"));

            double avg    = prices.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            double stdDev = Math.sqrt(prices.stream()
                    .mapToDouble(p -> Math.pow(p - avg, 2)).average().orElse(0));

            Map<String, Double> seasonMult = Map.of("Kharif", 1.05, "Rabi", 0.97, "Zaid", 1.02);
            double inflMult    = Math.pow(1.02, Double.parseDouble(year) - 2024);
            long predictedPrice = Math.round(avg * seasonMult.getOrDefault(season, 1.0) * inflMult);

            Map<String, String> advice = Map.of(
                "Kharif", "Kharif season sees higher " + crop + " demand. Sell in Oct–Nov for peak rates.",
                "Rabi",   "Rabi brings moderate prices. Early March sales yield better returns.",
                "Zaid",   "Zaid is a short season — " + crop + " prices can be volatile. Monitor weekly."
            );

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("predicted_price", predictedPrice);
            result.put("min_price",       Math.round(predictedPrice - stdDev));
            result.put("max_price",       Math.round(predictedPrice + stdDev));
            result.put("confidence",      Math.min(95, (long) Math.round(100 - (stdDev / avg) * 100)));
            result.put("advice",          advice.getOrDefault(season, "Based on " + prices.size() + " historical records from " + state + "."));
            result.put("data_points",     prices.size());
            result.put("crop",            crop);
            result.put("state",           state);
            result.put("district",        district.isBlank() ? null : district);
            result.put("season",          season);
            result.put("year",            year);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("[Predict] {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("message", "Prediction failed. Try again."));
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private double toDouble(Object v) {
        if (v == null) return 0.0;
        try { return Double.parseDouble(v.toString()); } catch (Exception e) { return 0.0; }
    }

    private String getString(Map<String, Object> m, String k) {
        Object v = m.get(k);
        return v != null ? v.toString().trim() : "";
    }

    /** Convert "dd/MM/yyyy" to "yyyy-MM-dd" for natural string comparison. */
    private String dateToComparable(String date) {
        if (date == null || !date.contains("/")) return "";
        String[] parts = date.split("/");
        if (parts.length != 3) return "";
        return parts[2] + "-" + parts[1] + "-" + parts[0];
    }

    private static Map<String, List<Map<String, Object>>> buildMandiData() {
        // Minimal static fallback — mirrors mandiData.js
        return Map.of(
            "Telangana", List.of(
                Map.of("name", "Bowenpally Market", "district", "Hyderabad",
                       "lat", 17.44, "lng", 78.49,
                       "prices", Map.of("Tomato", 2500, "Onion", 1800, "Potato", 1200)),
                Map.of("name", "Gaddiannaram Market", "district", "Medchal",
                       "lat", 17.35, "lng", 78.54,
                       "prices", Map.of("Tomato", 2400, "Onion", 1750, "Potato", 1150))
            ),
            "Maharashtra", List.of(
                Map.of("name", "Lasalgaon APMC", "district", "Nashik",
                       "lat", 20.12, "lng", 74.11,
                       "prices", Map.of("Onion", 2100, "Tomato", 2200, "Potato", 1300))
            )
        );
    }
}

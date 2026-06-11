package com.agrisense.backend.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Web scraper for todaypricerates.com — replaces services/scraper.js (Cheerio + Puppeteer).
 *
 * Uses Jsoup (lightweight HTML parser) since the price table is static HTML.
 * Parses the same table#customers tbody tr structure as the Cheerio scraper.
 *
 * Returns List<Map<String,Object>> matching the Node scraper output shape:
 *   { commodity, unit, mandiPrice, minPrice, maxPrice, modalPrice,
 *     priceChange, trend, date, state, source }
 */
@Service
public class ScraperService {

    private static final Logger log = LoggerFactory.getLogger(ScraperService.class);
    private static final Pattern NUMBER_PATTERN = Pattern.compile("[\\d.]+");
    private static final Pattern CHANGE_PATTERN = Pattern.compile("([\\d.]+)%");

    /**
     * Scrapes vegetable/crop prices for a given state and commodity.
     * Mirrors scrapeVegetablePrices(state, commodity) in scraper.js.
     */
    public List<Map<String, Object>> scrapeVegetablePrices(String state, String commodity) {
        String stateSlug = state.trim().replace(" ", "-");
        String url = "https://market.todaypricerates.com/" + stateSlug + "-vegetables-price";
        log.info("[Scraper] Fetching: {} for commodity: {}", url, commodity);

        List<Map<String, Object>> results = new ArrayList<>();

        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                               "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .timeout(20_000)
                    .get();

            Elements rows = doc.select("table#customers tbody tr");
            log.info("[Scraper] Found {} rows", rows.size());

            for (Element row : rows) {
                Elements cols = row.select("td");
                if (cols.size() < 4) continue;

                String cropName = cols.get(0).text().trim();
                if (cropName.isEmpty()) continue;

                // Filter by commodity (case-insensitive contains)
                if (!cropName.toLowerCase().contains(commodity.toLowerCase())) continue;

                String unit = cols.get(1).text().trim();

                // col2: "₹ 18 ▼ 2.6%" — strip span to get mandi price
                Element col2 = cols.get(2);
                col2.select("span").remove();
                String col2Text = col2.text().trim();
                double mandiPrice = parseFirstNumber(col2Text);

                // trend from span text
                Element col2Original = rows.get(rows.indexOf(row)).select("td").get(2);
                String trendText = col2Original.select("span").text().trim();
                String trend = trendText.contains("▼") ? "down"
                             : trendText.contains("▲") ? "up"
                             : "stable";
                Matcher changeMatcher = CHANGE_PATTERN.matcher(trendText);
                Double priceChange = changeMatcher.find() ? Double.parseDouble(changeMatcher.group(1)) : null;

                // col3: "₹ 22 - 27"
                String retailText = cols.get(3).text().trim();
                List<Double> retailNums = extractNumbers(retailText);
                double minPrice = retailNums.size() > 0 ? retailNums.get(0) : mandiPrice;
                double maxPrice = retailNums.size() > 1 ? retailNums.get(1) : mandiPrice;

                String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

                Map<String, Object> record = new LinkedHashMap<>();
                record.put("commodity",   cropName);
                record.put("unit",        unit);
                record.put("mandiPrice",  mandiPrice);
                record.put("minPrice",    minPrice);
                record.put("maxPrice",    maxPrice);
                record.put("modalPrice",  mandiPrice);
                record.put("priceChange", priceChange != null ? priceChange : 0.0);
                record.put("trend",       trend);
                record.put("date",        today);
                record.put("state",       state);
                record.put("source",      "todaypricerates");
                results.add(record);
            }

            log.info("[Scraper] Found {} results for '{}'", results.size(), commodity);

        } catch (Exception e) {
            log.error("[Scraper] Error: {}", e.getMessage());
        }

        return results;
    }

    private double parseFirstNumber(String text) {
        Matcher m = NUMBER_PATTERN.matcher(text);
        return m.find() ? Double.parseDouble(m.group()) : 0.0;
    }

    private List<Double> extractNumbers(String text) {
        List<Double> nums = new ArrayList<>();
        Matcher m = NUMBER_PATTERN.matcher(text);
        while (m.find()) {
            nums.add(Double.parseDouble(m.group()));
        }
        return nums;
    }
}

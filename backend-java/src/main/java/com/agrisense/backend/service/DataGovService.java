package com.agrisense.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

/**
 * Service for calling the data.gov.in Agmarknet API.
 * Replaces fetchFromAPI() and cleanRecord() helpers in marketController.js.
 */
@Service
public class DataGovService {

    private static final Logger log = LoggerFactory.getLogger(DataGovService.class);

    @Value("${data.gov.api-key}")
    private String apiKey;

    @Value("${data.gov.resource-id}")
    private String resourceId;

    private final RestTemplate restTemplate;

    public DataGovService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Fetches records from data.gov.in with optional filters.
     * Mirrors fetchFromAPI(filters, limit) in Node.
     *
     * @param filters  map of filter keys (State, District, Commodity, etc.)
     * @param limit    max records to return
     * @return list of raw record maps
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchRecords(Map<String, String> filters, int limit) {
        String baseUrl = "https://api.data.gov.in/resource/" + resourceId;

        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("api-key", apiKey)
                .queryParam("format", "json")
                .queryParam("limit", limit);

        filters.forEach((key, value) ->
                builder.queryParam("filters[" + key + "]", value));

        String url = builder.toUriString();
        log.debug("[DataGov] Fetching: {}", url);

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) return Collections.emptyList();
            Object records = response.get("records");
            if (records instanceof List) {
                return (List<Map<String, Object>>) records;
            }
        } catch (Exception e) {
            log.error("[DataGov] API error: {}", e.getMessage());
        }

        return Collections.emptyList();
    }

    /**
     * Normalizes a raw data.gov.in record to the standard shape.
     * Mirrors cleanRecord(r) in Node marketController.js.
     */
    public Map<String, Object> cleanRecord(Map<String, Object> r) {
        return Map.of(
            "state",      getString(r, "State"),
            "district",   getString(r, "District"),
            "market",     getString(r, "Market"),
            "commodity",  getString(r, "Commodity"),
            "variety",    getString(r, "Variety"),
            "grade",      getString(r, "Grade"),
            "date",       getString(r, "Arrival_Date"),
            "minPrice",   toDouble(r.get("Min_Price")),
            "maxPrice",   toDouble(r.get("Max_Price")),
            "modalPrice", toDouble(r.get("Modal_Price"))
        );
    }

    private String getString(Map<String, Object> r, String key) {
        Object v = r.get(key);
        return v != null ? v.toString() : "";
    }

    private double toDouble(Object v) {
        if (v == null) return 0.0;
        try { return Double.parseDouble(v.toString()); }
        catch (NumberFormatException e) { return 0.0; }
    }
}

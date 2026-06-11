package com.agrisense.backend.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * ML Proxy controller — mirrors controllers/mlController.js
 *
 * Proxies requests from frontend to the Python FastAPI ML service.
 *
 * POST /api/ml/predict/soil   → multipart image → FastAPI /predict/soil
 * POST /api/ml/predict/crop   → JSON body       → FastAPI /predict/crop
 * POST /api/ml/predict/price  → JSON body       → FastAPI /predict/price
 * GET  /api/ml/health         → FastAPI /
 */
@RestController
@RequestMapping("/api/ml")
public class MlProxyController {

    private static final Logger log = LoggerFactory.getLogger(MlProxyController.class);

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlBaseUrl;

    private final RestTemplate restTemplate;

    public MlProxyController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // ── POST /api/ml/predict/soil ────────────────────────────────────

    @PostMapping("/predict/soil")
    public ResponseEntity<?> predictSoil(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty())
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "No image file uploaded. Use field name 'file'."));

        try {
            // Build multipart body to forward to FastAPI
            MultiValueMap<String, Object> form = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override public String getFilename() { return file.getOriginalFilename(); }
            };

            HttpHeaders fileHeaders = new HttpHeaders();
            fileHeaders.setContentType(MediaType.parseMediaType(
                    file.getContentType() != null ? file.getContentType() : "image/jpeg"));

            form.add("file", new HttpEntity<>(resource, fileHeaders));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(form, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    mlBaseUrl + "/predict/soil", request, Map.class);

            Map<String, Object> data = response.getBody();
            if (data != null) {
                // Normalize: "Alluvial_Soil" → "Alluvial" (mirrors Node mlController)
                String raw = (String) data.getOrDefault("soil_type", "");
                data.put("soil_type_clean", raw.replaceAll("_Soil$", "").replace("_", " "));
            }

            return ResponseEntity.ok(data);

        } catch (RestClientResponseException e) {
            log.error("[ML Proxy] /predict/soil failed: {}", e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .body(errorBody("Soil prediction failed", e.getResponseBodyAsString()));
        } catch (ResourceAccessException e) {
            return mlUnavailable(e);
        } catch (Exception e) {
            log.error("[ML Proxy] /predict/soil error: {}", e.getMessage());
            return ResponseEntity.status(502).body(errorBody("ML proxy error", e.getMessage()));
        }
    }

    // ── POST /api/ml/predict/crop ────────────────────────────────────

    @PostMapping("/predict/crop")
    public ResponseEntity<?> predictCrop(@RequestBody Map<String, Object> body) {
        // Normalize soil_type: "Alluvial" → "Alluvial_Soil"
        String soilType = getString(body, "soil_type");
        if (!soilType.endsWith("_Soil")) {
            soilType = soilType.replace(" ", "_") + "_Soil";
            body.put("soil_type", soilType);
        }
        return proxyJson("/predict/crop", body);
    }

    // ── POST /api/ml/predict/price ───────────────────────────────────

    @PostMapping("/predict/price")
    public ResponseEntity<?> predictPrice(@RequestBody Map<String, Object> body) {
        String cropName    = getString(body, "crop_name");
        String harvestDate = getString(body, "harvest_date");

        if (cropName.isBlank() || harvestDate.isBlank())
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Required fields: crop_name, harvest_date (YYYY-MM-DD)"));

        return proxyJson("/predict/price", body);
    }

    // ── GET /api/ml/health ───────────────────────────────────────────

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(mlBaseUrl + "/", Map.class);
            return ResponseEntity.ok(Map.of("backend", "ok", "ml_service", response.getBody()));
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of(
                "backend",    "ok",
                "ml_service", "unreachable",
                "error",      e.getMessage()
            ));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> status() {
        try {
            return restTemplate.getForEntity(mlBaseUrl + "/models/status", Map.class);
        } catch (ResourceAccessException e) {
            return mlUnavailable(e);
        } catch (Exception e) {
            return ResponseEntity.status(502)
                    .body(errorBody("Could not read ML model status", e.getMessage()));
        }
    }

    // ── Helper: proxy JSON to ML service ────────────────────────────

    private ResponseEntity<?> proxyJson(String path, Object body) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Object> request = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    mlBaseUrl + path, request, Map.class);
            return ResponseEntity.ok(response.getBody());

        } catch (RestClientResponseException e) {
            int status = e.getStatusCode().value();
            String message = e.getResponseBodyAsString();
            log.error("[ML Proxy] {} failed ({}): {}", path, status, message);
            return ResponseEntity.status(status).body(errorBody("ML request failed", message));
        } catch (ResourceAccessException e) {
            return mlUnavailable(e);
        } catch (Exception e) {
            log.error("[ML Proxy] {} error: {}", path, e.getMessage());
            return ResponseEntity.status(502).body(errorBody("ML service error", e.getMessage()));
        }
    }

    private ResponseEntity<?> mlUnavailable(Exception e) {
        log.error("[ML Proxy] ML service unavailable at {}: {}", mlBaseUrl, e.getMessage());
        return ResponseEntity.status(503).body(Map.of(
                "message", "ML service is unavailable",
                "detail", "Start the FastAPI service on " + mlBaseUrl,
                "ml_service_url", mlBaseUrl
        ));
    }

    private Map<String, Object> errorBody(String message, String detail) {
        String finalMessage = message;
        String finalDetail = detail == null ? "" : detail;
        
        try {
            if (detail != null && detail.trim().startsWith("{")) {
                Map<?, ?> map = new com.fasterxml.jackson.databind.ObjectMapper().readValue(detail, Map.class);
                if (map.containsKey("detail")) {
                    finalMessage = String.valueOf(map.get("detail"));
                    finalDetail = finalMessage;
                } else if (map.containsKey("message")) {
                    finalMessage = String.valueOf(map.get("message"));
                    finalDetail = finalMessage;
                }
            }
        } catch (Exception e) {
            // Ignore parse errors, keep original strings
        }
        
        return Map.of(
                "message", finalMessage,
                "detail", finalDetail
        );
    }

    private String getString(Map<String, Object> m, String k) {
        Object v = m.get(k);
        return v != null ? v.toString().trim() : "";
    }
}

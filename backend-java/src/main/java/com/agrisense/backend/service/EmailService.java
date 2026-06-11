package com.agrisense.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Email service using Brevo (Sendinblue) REST API.
 * Replaces the @getbrevo/brevo npm SDK + utils/sendEmail.js.
 *
 * Falls back gracefully (logs OTP to console) if API key is missing
 * or the API call fails — identical behaviour to the Node fallback.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    @Value("${brevo.api-key:}")
    private String apiKey;

    @Value("${brevo.sender-email:agrisense@example.com}")
    private String senderEmail;

    @Value("${brevo.sender-name:AgriSense}")
    private String senderName;

    private final RestTemplate restTemplate;

    public EmailService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Sends an OTP email via Brevo.
     * @throws RuntimeException if the API call fails (so caller can fall back)
     */
    public void sendOTPEmail(String toEmail, String toName, String otp) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("⚠️  BREVO_API_KEY not set — cannot send email");
            throw new RuntimeException("Brevo API key not configured");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);

        String htmlContent = """
            <div style="font-family:Arial;max-width:400px;margin:auto;padding:20px;border:1px solid #e0e0e0;border-radius:10px">
              <h2 style="color:#2d7a3a">🌾 AgriSense</h2>
              <p>Hi <b>%s</b>,</p>
              <p>Your verification OTP is:</p>
              <h1 style="letter-spacing:8px;color:#2d7a3a">%s</h1>
              <p style="color:gray;font-size:12px">Valid for 10 minutes. Do not share.</p>
            </div>
            """.formatted(toName, otp);

        Map<String, Object> body = Map.of(
            "sender",      Map.of("name", senderName, "email", senderEmail),
            "to",          List.of(Map.of("email", toEmail, "name", toName)),
            "subject",     "Your AgriSense OTP",
            "htmlContent", htmlContent
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(BREVO_URL, request, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Brevo API returned: " + response.getStatusCode());
            }
            log.info("✅ OTP email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("❌ Brevo API Error: {}", e.getMessage());
            throw new RuntimeException("Email delivery failed: " + e.getMessage(), e);
        }
    }
}

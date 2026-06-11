package com.agrisense.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utility for generating and validating JWT tokens.
 * Mirrors the Node.js jsonwebtoken usage:
 *   jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' })
 *   jwt.verify(token, JWT_SECRET)
 */
@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationMs) {
        // JJWT 0.12 requires key >= 256 bits. Pad short secrets so they are always 32+ bytes.
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            secretBytes = java.util.Arrays.copyOf(secretBytes, 32);
        }
        this.key = Keys.hmacShaKeyFor(secretBytes);
        this.expirationMs = expirationMs;
    }

    /** Generate a 7-day JWT with { id, email } payload. */
    public String generateToken(String userId, String email) {
        return Jwts.builder()
                .claim("id", userId)
                .claim("email", email)
                .subject(userId)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    /** Extract all claims from a token. Throws JwtException if invalid/expired. */
    public Claims validateToken(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUserId(String token) {
        return validateToken(token).get("id", String.class);
    }

    public String getEmail(String token) {
        return validateToken(token).get("email", String.class);
    }
}

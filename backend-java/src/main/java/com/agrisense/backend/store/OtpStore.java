package com.agrisense.backend.store;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.*;

/**
 * In-memory OTP and temporary user store with TTL.
 *
 * Exact Java equivalent of the Node redis.js in-memory client:
 *   setEx(key, ttlSeconds, value)  →  set(key, value, ttl)
 *   get(key)                        →  get(key)
 *   del(key)                        →  delete(key)
 *   setTempUser / getTempUser / delTempUser
 *
 * Uses ConcurrentHashMap for thread safety and ScheduledExecutorService for TTL.
 */
@Component
public class OtpStore {

    private final Map<String, String>              otpMap      = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> tempUserMap = new ConcurrentHashMap<>();
    private final ScheduledExecutorService         scheduler   = Executors.newScheduledThreadPool(2);

    // ── OTP operations ──────────────────────────────────────────────

    public void setEx(String key, int ttlSeconds, String value) {
        otpMap.put(key, value);
        scheduler.schedule(() -> otpMap.remove(key), ttlSeconds, TimeUnit.SECONDS);
    }

    public String get(String key) {
        return otpMap.get(key);
    }

    public void del(String key) {
        otpMap.remove(key);
    }

    // ── Temp user operations (10-minute TTL) ────────────────────────

    public void setTempUser(String email, Map<String, Object> userData) {
        tempUserMap.put(email, userData);
        scheduler.schedule(() -> tempUserMap.remove(email), 600, TimeUnit.SECONDS);
    }

    public Map<String, Object> getTempUser(String email) {
        return tempUserMap.get(email);
    }

    public void delTempUser(String email) {
        tempUserMap.remove(email);
    }
}

package com.agrisense.backend.security;

/**
 * Represents the authenticated user extracted from a JWT.
 * Holds { id, email } — mirrors req.user in the Node backend.
 */
public class AgriSensePrincipal {

    private final String userId;
    private final String email;

    public AgriSensePrincipal(String userId, String email) {
        this.userId = userId;
        this.email  = email;
    }

    public String getUserId() { return userId; }
    public String getEmail()  { return email; }
}

package com.agrisense.backend.controller;

import com.agrisense.backend.model.User;
import com.agrisense.backend.repository.UserRepository;
import com.agrisense.backend.security.JwtUtil;
import com.agrisense.backend.service.EmailService;
import com.agrisense.backend.store.OtpStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.Random;

/**
 * Authentication controller — mirrors routes/auth.js + controllers/authController.js.
 *
 * POST /api/auth/register    → OTP or auto-verify if email fails
 * POST /api/auth/verify-otp  → validate OTP, create User, return JWT
 * POST /api/auth/login       → bcrypt compare, return JWT
 * POST /api/auth/resend-otp  → regenerate + resend OTP
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository   userRepo;
    private final PasswordEncoder  passwordEncoder;
    private final JwtUtil          jwtUtil;
    private final OtpStore         otpStore;
    private final EmailService     emailService;

    public AuthController(UserRepository userRepo,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          OtpStore otpStore,
                          EmailService emailService) {
        this.userRepo        = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil         = jwtUtil;
        this.otpStore        = otpStore;
        this.emailService    = emailService;
    }

    // ── REGISTER ─────────────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name     = body.get("name");
        String email    = body.get("email");
        String password = body.get("password");

        if (name == null || email == null || password == null ||
            name.isBlank() || email.isBlank() || password.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Name, email and password are required"));
        }

        Optional<User> existing = userRepo.findByEmail(email.toLowerCase());
        if (existing.isPresent() && existing.get().isVerified()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already registered"));
        }
        if (existing.isPresent() && !existing.get().isVerified()) {
            userRepo.deleteByEmail(email.toLowerCase());
        }

        String hashedPassword = passwordEncoder.encode(password);

        // Store temp user in-memory
        otpStore.setTempUser(email, Map.of(
            "name",     name,
            "email",    email.toLowerCase(),
            "password", hashedPassword
        ));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1_000_000));
        otpStore.setEx("otp:" + email, 600, otp);

        // Try sending email
        boolean emailSent = false;
        try {
            emailService.sendOTPEmail(email, name, otp);
            emailSent = true;
        } catch (Exception e) {
            log.warn("⚠️  Email service unavailable: {}", e.getMessage());
            log.info("📋 DEV FALLBACK — OTP for {}: {}", email, otp);
        }

        if (emailSent) {
            return ResponseEntity.ok(Map.of(
                "message",    "OTP sent to your email",
                "requireOTP", true
            ));
        }

        // Email failed: register directly as verified (dev fallback)
        User user = new User();
        user.setName(name);
        user.setEmail(email.toLowerCase());
        user.setPassword(hashedPassword);
        user.setVerified(true);
        user = userRepo.save(user);

        otpStore.del("otp:" + email);
        otpStore.delTempUser(email);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        return ResponseEntity.ok(Map.of(
            "message",    "Account created successfully (email service unavailable — auto-verified)",
            "requireOTP", false,
            "token",      token,
            "user",       Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail())
        ));
    }

    // ── VERIFY OTP ───────────────────────────────────────────────────

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp   = body.get("otp");

        String savedOtp = otpStore.get("otp:" + email);
        if (savedOtp == null)
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "OTP expired. Please register again."));
        if (!savedOtp.equals(otp))
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid OTP. Please try again."));

        Map<String, Object> tempUser = otpStore.getTempUser(email);
        if (tempUser == null)
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Session expired. Please register again."));

        User user = new User();
        user.setName((String) tempUser.get("name"));
        user.setEmail((String) tempUser.get("email"));
        user.setPassword((String) tempUser.get("password"));
        user.setVerified(true);
        user = userRepo.save(user);

        otpStore.del("otp:" + email);
        otpStore.delTempUser(email);

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        return ResponseEntity.ok(Map.of(
            "token", token,
            "user",  Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail())
        ));
    }

    // ── LOGIN ────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        Optional<User> optUser = userRepo.findByEmail(email != null ? email.toLowerCase() : "");
        if (optUser.isEmpty())
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "No account found with this email"));

        User user = optUser.get();
        if (!user.isVerified())
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please verify your email first"));

        if (!passwordEncoder.matches(password, user.getPassword()))
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Incorrect password"));

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());

        return ResponseEntity.ok(Map.of(
            "token", token,
            "user",  Map.of("id", user.getId(), "name", user.getName(), "email", user.getEmail())
        ));
    }

    // ── RESEND OTP ───────────────────────────────────────────────────

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");

        Map<String, Object> tempUser = otpStore.getTempUser(email);
        Optional<User>      dbUser   = userRepo.findByEmail(email != null ? email.toLowerCase() : "");

        if (tempUser == null && dbUser.isEmpty())
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "User not found. Please register again."));

        String name = tempUser != null ? (String) tempUser.get("name")
                    : dbUser.get().getName();

        String otp = String.format("%06d", new Random().nextInt(1_000_000));
        otpStore.setEx("otp:" + email, 600, otp);

        try {
            emailService.sendOTPEmail(email, name, otp);
            return ResponseEntity.ok(Map.of("message", "OTP resent to your email"));
        } catch (Exception e) {
            log.info("📋 DEV FALLBACK — Resent OTP for {}: {}", email, otp);
            return ResponseEntity.ok(Map.of(
                "message", "Email service unavailable — OTP printed to server console (dev mode)"
            ));
        }
    }
}

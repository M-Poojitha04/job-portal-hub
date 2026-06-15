package com.jobportal.backend.controller;

import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class PasswordResetController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 1. Request Password Reset Token Link
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            // Security Best Practice: Return a vague success message so malicious entities can't map out valid emails
            return ResponseEntity.ok(Map.of("message", "If that email account exists on our platform, a recovery link has been generated."));
        }

        User user = userOpt.get();

        // Generate a cryptographically secure token string expiring in 15 minutes
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));

        userRepository.save(user);

        // Simulation Payload: Return the direct URL in the response so you don't need a real mail server to test it!
        String simulationLink = "http://localhost:5173/reset-password?token=" + token;

        return ResponseEntity.ok(Map.of(
                "message", "Recovery token generated successfully.",
                "simulationResetLink", simulationLink
        ));
    }

    // 2. Commit and Overwrite Password Hash
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Missing verification credential validation parameters token.");
        }

        // Find user by reset token and check if the token hasn't expired yet
        Optional<User> userOpt = userRepository.findAll().stream()
                .filter(u -> token.equals(u.getResetToken()) && u.getResetTokenExpiry() != null && u.getResetTokenExpiry().isAfter(LocalDateTime.now()))
                .findFirst();

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Invalid or expired password reset token link reference.");
        }

        User user = userOpt.get();

        // Encrypt the new password string using BCrypt and clear out the old token fields
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Success: Your security password has been updated cleanly. You can now log in!"));
    }
}
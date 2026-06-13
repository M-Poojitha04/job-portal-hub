package com.jobportal.backend.controller;

import com.jobportal.backend.dto.AuthResponse;
import com.jobportal.backend.dto.LoginRequest;
import com.jobportal.backend.dto.RegisterRequest;
import com.jobportal.backend.model.Profile;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.ProfileRepository;
import com.jobportal.backend.repository.UserRepository;
import com.jobportal.backend.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserRepository userRepository,
                          ProfileRepository profileRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // 1. Create and save the secure credentials
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // BCrypt hash
                .role(request.getRole())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // 2. Automatically link a clean base Profile record
        Profile profile = Profile.builder()
                .id(savedUser.getId())
                .user(savedUser)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();

        profileRepository.save(profile);

        // 3. Auto-login on successful registration by issuing token immediately
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, savedUser.getEmail(), savedUser.getRole().name()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        // Authenticate credentials against our ProviderManager configuration safely
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getRole().name()));
    }
}
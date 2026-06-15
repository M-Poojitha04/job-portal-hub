package com.jobportal.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, CustomUserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 1. Public Auth endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // 2. Public / Shared browse endpoints
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/jobs").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/uploads/resumes/**").permitAll()

                        // 3. Shared Global Authenticated Access Endpoints (Bypasses prefix issues)
                        .requestMatchers("/api/v1/notifications/**").authenticated()
                        .requestMatchers("/api/v1/applications/**").authenticated() // Crucial: Sets wide clearance coverage!
                        .requestMatchers("/api/v1/profiles/**").authenticated()
                        .requestMatchers("/api/v1/interviews/**").authenticated()
                        .requestMatchers("/api/v1/analytics/**").authenticated()
                        .requestMatchers("/api/v1/bookmarks/**").authenticated()
                        .requestMatchers("/api/v1/companies/**").authenticated()
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/auth/forgot-password", "/api/v1/auth/reset-password").permitAll()
                        .requestMatchers("/ws-portal/**").permitAll()
                        .requestMatchers("/api/v1/ai/**").hasRole("JOB_SEEKER")
                        // 4. Job specific management rules
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/jobs/**").hasRole("RECRUITER")
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/v1/jobs/**").hasRole("RECRUITER")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/v1/jobs/**").hasRole("RECRUITER")

                        // 5. Generic catch-all
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // FIX 2: Added method calling parentheses () to resolve the compilation syntax error!
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        // Pass your custom userDetailsService straight into the constructor parameter!
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(this.userDetailsService);

        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(authenticationProvider());
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
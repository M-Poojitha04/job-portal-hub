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
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/auth/**").permitAll() // 1. Open Auth endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll() // FIX: Open static assets access to allow resume rendering!
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/jobs").permitAll() // 2. Public browse
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/jobs").hasRole("RECRUITER") // 3. Recruiter post
                        .requestMatchers("/api/v1/jobs/my-postings").hasRole("RECRUITER") // 4. Recruiter dashboard query
                        .requestMatchers("/api/v1/applications/apply/**").hasRole("JOB_SEEKER") // 5. Candidate apply action
                        .requestMatchers("/api/v1/applications/my-applications").hasRole("JOB_SEEKER") // 6. Candidate application logs
                        .requestMatchers("/api/v1/applications/job/**").hasRole("RECRUITER") // View applicants list
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/v1/applications/**").hasRole("RECRUITER") // Modify status
                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/v1/jobs/**").hasRole("RECRUITER")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/v1/jobs/**").hasRole("RECRUITER")
                        .requestMatchers("/api/v1/profiles/**").authenticated() // Secure complete profile context scope rules
                        .anyRequest().authenticated() // 7. ABSOLUTE FINAL: Protect anything else!
                )
                // FIX: Added parentheses to call the bean method instead of referencing a non-existent field variable
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Strong cryptographic password hashing
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
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
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); // Whitelist our React App
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
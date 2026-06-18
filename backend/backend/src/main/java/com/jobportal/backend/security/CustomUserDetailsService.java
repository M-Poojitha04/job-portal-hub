package com.jobportal.backend.security;

import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // 1. Fetch user from DB and throw a clean exception if missing
        com.jobportal.backend.model.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // 2. Safe string normalizer for the role prefixing mapping
        String rawRole = user.getRole() != null ? user.getRole().toString().toUpperCase().trim() : "JOB_SEEKER";

        // 3. Strip structural duplication if the string in the DB already includes "ROLE_"
        if (rawRole.startsWith("ROLE_")) {
            rawRole = rawRole.replace("ROLE_", "");
        }

        // 4. Format role precisely as "ROLE_X" for strict Spring Security RBAC filter matching
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + rawRole);

        System.out.println("🔐 Authenticating User: " + user.getEmail());
        System.out.println("🎭 Assigned Security Authority: " + authority.getAuthority());

        // 5. Construct the final authenticated UserDetails package container
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.isActive(),            // Enabled flag condition check
                true,                       // accountNonExpired
                true,                       // credentialsNonExpired
                true,                       // accountNonLocked
                java.util.Collections.singletonList(authority)
        );
    }
}
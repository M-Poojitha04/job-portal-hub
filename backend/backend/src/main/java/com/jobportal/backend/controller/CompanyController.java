package com.jobportal.backend.controller;

import com.jobportal.backend.model.Company;
import com.jobportal.backend.model.Profile;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.CompanyRepository;
import com.jobportal.backend.repository.ProfileRepository;
import com.jobportal.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/companies")
public class CompanyController {

    private final CompanyRepository companyRepository;
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public CompanyController(CompanyRepository companyRepository,
                             ProfileRepository profileRepository,
                             UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    // Get current recruiter's linked corporate workspace profile data
    @GetMapping("/my-company")
    public ResponseEntity<?> getMyCompanyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User session invalid"));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Recruiter profile structure missing"));

        if (profile.getCompany() == null) {
            return ResponseEntity.ok(new Company()); // Return clean empty structure shell
        }
        return ResponseEntity.ok(profile.getCompany());
    }

    // Save or update company settings data matrix
    @PutMapping("/update")
    public ResponseEntity<?> updateCompanyProfile(
            @RequestBody Company companyRequest,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User session invalid"));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Recruiter profile structure missing"));

        Company company = profile.getCompany();
        if (company == null) {
            company = new Company();
        }

        // Map text fields parameters atomically
        company.setCompanyName(companyRequest.getCompanyName());
        company.setDescription(companyRequest.getDescription());
        company.setLogoUrl(companyRequest.getLogoUrl());
        company.setWebsite(companyRequest.getWebsite());
        company.setSocialLinks(companyRequest.getSocialLinks());

        Company savedCompany = companyRepository.save(company);

        // Explicitly link company back to recruiter profile record line if first-time generation context
        if (profile.getCompany() == null) {
            profile.setCompany(savedCompany);
            profileRepository.save(profile);
        }

        return ResponseEntity.ok("Success: Corporate workspace updated successfully!");
    }
}
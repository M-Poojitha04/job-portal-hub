package com.jobportal.backend.controller;

import com.jobportal.backend.model.Company;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.CompanyRepository;
import com.jobportal.backend.repository.JobApplicationRepository;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.UserRepository;
import com.jobportal.backend.service.NotificationPushService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final NotificationPushService pushService;

    // Updated Constructor to correctly accept and inject dependencies
    public AdminController(UserRepository userRepository,
                           JobRepository jobRepository,
                           JobApplicationRepository applicationRepository,
                           CompanyRepository companyRepository,
                           NotificationPushService pushService) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.companyRepository = companyRepository;
        this.pushService = pushService;
    }

    // 1. Core Platform Health Analytics Summary Metrics
    @GetMapping("/summary")
    public ResponseEntity<?> getPlatformSummary() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalUsers", userRepository.count());
        metrics.put("totalJobs", jobRepository.count());
        metrics.put("totalApplications", applicationRepository.count());
        metrics.put("unverifiedCompanies", companyRepository.findAll().stream().filter(c -> !c.isVerified()).count());

        return ResponseEntity.ok(metrics);
    }

    // 2. Fetch All Registered Platform Accounts
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 3. Toggle User Account State Blockade Rule with Real-Time Pushing
    @PostMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Target account records not found"));

        user.setActive(!user.isActive());
        userRepository.save(user);

        // Real-Time Alert Broadcast Trigger Hook
        pushService.sendGlobalAlert("system-announcements", "Security Update Alert", "User account status modified: " + user.getEmail());

        String logMessage = user.isActive() ? "Account activated cleanly." : "Account blocked successfully.";
        return ResponseEntity.ok(Map.of("isActive", user.isActive(), "message", logMessage));
    }

    // 4. Fetch Unverified Recruiter Corporate Workspaces
    @GetMapping("/companies/pending")
    public ResponseEntity<?> getPendingCompanies() {
        List<Company> pending = companyRepository.findAll().stream()
                .filter(c -> !c.isVerified())
                .toList();
        return ResponseEntity.ok(pending);
    }

    // 5. Approve Corporate Company Workspace Profile
    @PostMapping("/companies/{id}/verify")
    public ResponseEntity<?> verifyCompany(@PathVariable Long id, @RequestParam boolean approve) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company configuration logs missing"));

        if (approve) {
            company.setVerified(true);
            companyRepository.save(company);
            return ResponseEntity.ok(Map.of("message", "Company verification approved successfully."));
        } else {
            return ResponseEntity.ok(Map.of("message", "Company registration profile flag rejected."));
        }
    }

    // 6. Administrative Job Moderation: Strip out Spam Job Postings
    @DeleteMapping("/jobs/{id}/moderate")
    public ResponseEntity<?> moderateJobListing(@PathVariable Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Target position tracking matrix missing"));

        jobRepository.delete(job);
        return ResponseEntity.ok(Map.of("message", "Spam listing stripped away from public ledger logs successfully."));
    }
}
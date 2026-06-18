package com.jobportal.backend.controller;

import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.JobStatus;
import com.jobportal.backend.model.User;
import com.jobportal.backend.model.Profile;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.UserRepository;
import com.jobportal.backend.repository.JobApplicationRepository;
import com.jobportal.backend.repository.ProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository applicationRepository;
    private final ProfileRepository profileRepository;

    // Unified Clean Constructor Injection
    public JobController(
            JobRepository jobRepository,
            UserRepository userRepository,
            JobApplicationRepository applicationRepository,
            ProfileRepository profileRepository
    ) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository;
        this.profileRepository = profileRepository;
    }

    // Public Endpoint: Anyone (including unauthenticated guests) can view active listings
    @GetMapping
    public ResponseEntity<List<Job>> getAllActiveJobs() {
        List<Job> activeJobs = jobRepository.findByStatusOrderByCreatedAtDesc(JobStatus.PUBLISHED);
        return ResponseEntity.ok(activeJobs);
    }

    // Secured Endpoint: Create a new job position linked directly to custom typed company metadata
    @PostMapping("/create")
    public ResponseEntity<?> createJobListing(
            @RequestBody Job jobRequest,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Recruiter session matching failed"));

        // REMOVED: Profile dependency and company lookup assertions have been bypassed to support blank database slates.
        // The companyName string comes directly from the interactive frontend input field instead.

        // Auto-assign properties from our managed database models safely
        jobRequest.setRecruiter(recruiter);

        // Ensure status field maps safely to its model fallback configuration
        if (jobRequest.getStatus() == null) {
            jobRequest.setStatus(JobStatus.PUBLISHED);
        }

        Job savedJob = jobRepository.save(jobRequest);
        return ResponseEntity.ok(savedJob);
    }

    // Secured Endpoint: Fetch listings managed strictly by the current recruiter account
    @GetMapping("/my-postings")
    public ResponseEntity<List<Job>> getRecruiterJobs(@AuthenticationPrincipal UserDetails userDetails) {
        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<Job> myJobs = jobRepository.findByRecruiterIdOrderByCreatedAtDesc(recruiter.getId());
        return ResponseEntity.ok(myJobs);
    }

    // Secured Endpoint: Delete a job posting along with cascading ownership guardrails
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Recruiter not found"));

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job posting not found"));

        // Security Validation Check: Does the authenticated recruiter own this record?
        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            return ResponseEntity.status(403).body("Error: Unauthorized action. You cannot delete this posting.");
        }

        jobRepository.delete(job);
        return ResponseEntity.ok("Success: Job posting removed from core ledger successfully.");
    }

    // Secured Endpoint: Edit an existing job posting's specifications
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(
            @PathVariable Long id,
            @RequestBody Job jobDetails,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Recruiter not found"));

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job posting not found"));

        // Security Validation Check: Does the authenticated recruiter own this record?
        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            return ResponseEntity.status(403).body("Error: Unauthorized action.");
        }

        // Apply modifications across specifications fields
        job.setTitle(jobDetails.getTitle());
        job.setDescription(jobDetails.getDescription());
        job.setLocation(jobDetails.getLocation());
        job.setSalaryRange(jobDetails.getSalaryRange());
        job.setExperienceRequired(jobDetails.getExperienceRequired());
        job.setJobType(jobDetails.getJobType());

        jobRepository.save(job);
        return ResponseEntity.ok("Success: Job specifications updated cleanly.");
    }

    // Secured Endpoint: Aggregate application volume tracking details
    @GetMapping("/total-applications")
    public ResponseEntity<?> getTotalApplicationsCount(@AuthenticationPrincipal UserDetails userDetails) {
        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Recruiter not found"));

        // Count how many applications exist across all jobs published by this recruiter
        long totalApplicationsCount = applicationRepository.countByJobRecruiterId(recruiter.getId());

        return ResponseEntity.ok(Map.of("totalApplications", totalApplicationsCount));
    }
}
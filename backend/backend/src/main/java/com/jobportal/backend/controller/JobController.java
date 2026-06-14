package com.jobportal.backend.controller;

import com.jobportal.backend.dto.JobRequest;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.JobStatus;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    // 1. ADD THIS FIELD DECLARATION
    private final com.jobportal.backend.repository.JobApplicationRepository applicationRepository;

    // 2. UPDATE YOUR CONSTRUCTOR TO INJECT IT
    public JobController(
            JobRepository jobRepository,
            UserRepository userRepository,
            com.jobportal.backend.repository.JobApplicationRepository applicationRepository
    ) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.applicationRepository = applicationRepository; // Assign it here!
    }

    // ... Your existing mapping endpoints remain exactly the same below ...

    // Public Endpoint: Anyone (including unauthenticated guests) can view active listings
    @GetMapping
    public ResponseEntity<List<Job>> getAllActiveJobs() {
        List<Job> activeJobs = jobRepository.findByStatusOrderByCreatedAtDesc(JobStatus.PUBLISHED);
        return ResponseEntity.ok(activeJobs);
    }

    // Secured Endpoint: Only recruiters can create listings
    @PostMapping
    public ResponseEntity<?> createJob(
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // Look up the active recruiter user profile object attached to the session token context
        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Recruiter account not found"));

        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .companyName(request.getCompanyName())
                .location(request.getLocation())
                .salaryRange(request.getSalaryRange())
                .experienceRequired(request.getExperienceRequired())
                .jobType(request.getJobType())
                .status(JobStatus.PUBLISHED)
                .recruiter(recruiter)
                .build();

        Job savedJob = jobRepository.save(job);
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

    // 1. Delete a job posting along with cascading guardrails if needed
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(
            @PathVariable Long id,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails
    ) {
        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("Recruiter not found"));

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job posting not found"));

        // Security Validation Check: Does the authenticated recruiter own this record?
        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            return ResponseEntity.status(430).body("Error: Unauthorized action. You cannot delete this posting.");
        }

        jobRepository.delete(job);
        return ResponseEntity.ok("Success: Job posting removed from core ledger successfully.");
    }

    // 2. Edit an existing job posting's specifications
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(
            @PathVariable Long id,
            @RequestBody Job jobDetails,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails
    ) {
        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("Recruiter not found"));

        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Job posting not found"));

        // Security Validation Check: Does the authenticated recruiter own this record?
        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            return ResponseEntity.status(430).body("Error: Unauthorized action.");
        }

        // Apply modifications across fields
        job.setTitle(jobDetails.getTitle());
        job.setDescription(jobDetails.getDescription());
        job.setLocation(jobDetails.getLocation());
        job.setSalaryRange(jobDetails.getSalaryRange());
        job.setExperienceRequired(jobDetails.getExperienceRequired());
        job.setJobType(jobDetails.getJobType());

        jobRepository.save(job);
        return ResponseEntity.ok("Success: Job specifications updated cleanly.");
    }

    @GetMapping("/total-applications")
    public ResponseEntity<?> getTotalApplicationsCount(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails
    ) {
        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("Recruiter not found"));

        // Count how many applications exist across all jobs published by this recruiter
        long totalApplicationsCount = applicationRepository.countByJobRecruiterId(recruiter.getId());

        return ResponseEntity.ok(java.util.Map.of("totalApplications", totalApplicationsCount));
    }
}
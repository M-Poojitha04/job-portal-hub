package com.jobportal.backend.controller;

import com.jobportal.backend.model.ApplicationStatus;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.JobApplication;
import com.jobportal.backend.model.Role;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.JobApplicationRepository;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/applications")
public class JobApplicationController {

    private final JobApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public JobApplicationController(JobApplicationRepository applicationRepository,
                                    JobRepository jobRepository,
                                    UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/apply/{jobId}")
    public ResponseEntity<?> applyToJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // 1. Fetch active candidate object context
        User candidate = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 2. Gatekeep: Ensure recruiters cannot apply to jobs!
        if (candidate.getRole() != Role.JOB_SEEKER) {
            return ResponseEntity.badRequest().body("Error: Only Candidates can apply for job listings.");
        }

        // 3. Fetch target job position listing
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job post variant not found"));

        // 4. Validate duplicate restrictions
        if (applicationRepository.existsByJobIdAndCandidateId(jobId, candidate.getId())) {
            return ResponseEntity.badRequest().body("Warning: You have already submitted an application for this position.");
        }

        // 5. Construct and write the entry
        JobApplication application = JobApplication.builder()
                .job(job)
                .candidate(candidate)
                .status(ApplicationStatus.APPLIED)
                .build();

        applicationRepository.save(application);
        return ResponseEntity.ok("Success: Application submitted successfully!");
    }

    @GetMapping("/my-applications")
    public ResponseEntity<?> getCandidateApplications(@AuthenticationPrincipal UserDetails userDetails) {
        // Fetch active candidate object context based on token session
        User candidate = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"));

        if (candidate.getRole() != Role.JOB_SEEKER) {
            return ResponseEntity.badRequest().body("Error: Only Candidates can fetch application logs.");
        }

        // Retrieve all applications mapped to this candidate
        java.util.List<JobApplication> applications = applicationRepository.findByCandidateIdOrderByAppliedAtDesc(candidate.getId());
        return ResponseEntity.ok(applications);
    }

    // 1. Fetch all applications submitted for a specific job posting
    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getApplicationsByJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("Recruiter not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job posting not found"));

        // Security Check: Verify this recruiter actually owns the job listing
        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            return ResponseEntity.status(430).body("Error: Unauthorized. You do not own this job listing.");
        }

        java.util.List<JobApplication> apps = applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId);
        return ResponseEntity.ok(apps);
    }

    // 2. Update the status of a specific candidate application record
    @PutMapping("/{applicationId}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam com.jobportal.backend.model.ApplicationStatus status,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("Recruiter not found"));

        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application record not found"));

        // Security Check: Verify this recruiter owns the job related to the application
        if (!app.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            return ResponseEntity.status(430).body("Error: Unauthorized actions.");
        }

        app.setStatus(status);
        applicationRepository.save(app);
        return ResponseEntity.ok("Success: Application status updated to " + status);
    }
}
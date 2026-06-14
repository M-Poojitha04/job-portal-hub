package com.jobportal.backend.controller;

import com.jobportal.backend.dto.ApplicantResponseDTO; // Import your new DTO
import com.jobportal.backend.model.ApplicationStatus;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.JobApplication;
import com.jobportal.backend.model.Role;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.JobApplicationRepository;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.NotificationRepository; // Import NotificationRepository
import com.jobportal.backend.repository.ProfileRepository; // Import ProfileRepository
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
    private final ProfileRepository profileRepository;
    private final NotificationRepository notificationRepository; // Added notification field context

    // Updated constructor to cleanly inject the notification repository dependency
    public JobApplicationController(JobApplicationRepository applicationRepository,
                                    JobRepository jobRepository,
                                    UserRepository userRepository,
                                    ProfileRepository profileRepository,
                                    NotificationRepository notificationRepository) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.notificationRepository = notificationRepository;
    }

    @PostMapping("/apply/{jobId}")
    public ResponseEntity<?> applyToJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User candidate = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (candidate.getRole() != Role.JOB_SEEKER) {
            return ResponseEntity.badRequest().body("Error: Only Candidates can apply for job listings.");
        }

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job post variant not found"));

        if (applicationRepository.existsByJobIdAndCandidateId(jobId, candidate.getId())) {
            return ResponseEntity.badRequest().body("Warning: You have already submitted an application for this position.");
        }

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
        User candidate = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"));

        if (candidate.getRole() != Role.JOB_SEEKER) {
            return ResponseEntity.badRequest().body("Error: Only Candidates can fetch application logs.");
        }

        java.util.List<JobApplication> applications = applicationRepository.findByCandidateIdOrderByAppliedAtDesc(candidate.getId());
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getApplicationsByJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails
    ) {
        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("Recruiter not found"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job posting not found"));

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            return ResponseEntity.status(430).body("Error: Unauthorized. You do not own this job listing.");
        }

        java.util.List<JobApplication> apps = applicationRepository.findByJobIdOrderByAppliedAtDesc(jobId);

        java.util.List<ApplicantResponseDTO> responseList = apps.stream().map(app -> {
            User candidateUser = userRepository.findById(app.getCandidate().getId())
                    .orElseThrow(() -> new RuntimeException("Candidate record missing"));

            com.jobportal.backend.model.Profile profile = profileRepository.findByUserId(candidateUser.getId()).orElse(null);

            return ApplicantResponseDTO.builder()
                    .applicationId(app.getId())
                    .status(app.getStatus())
                    .appliedAt(app.getAppliedAt())
                    .email(candidateUser.getEmail())
                    .firstName(profile != null ? profile.getFirstName() : "First Name Missing")
                    .lastName(profile != null ? profile.getLastName() : "Last Name Missing")
                    .headline(profile != null ? profile.getHeadline() : "No professional headline set yet.")
                    .phone(profile != null ? profile.getPhone() : "N/A")
                    .resumeUrl(profile != null ? profile.getResumeUrl() : null)
                    .build();
        }).toList();

        return ResponseEntity.ok(responseList);
    }

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

        if (!app.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            return ResponseEntity.status(430).body("Error: Unauthorized actions.");
        }

        app.setStatus(status);
        applicationRepository.save(app);

        // --- PART 3: Trigger Live Application Notification System Entry ---
        String notificationMessage = String.format(
                "Your application for '%s' at '%s' has been updated to stage: %s.",
                app.getJob().getTitle(),
                app.getJob().getCompanyName(),
                status
        );

        com.jobportal.backend.model.Notification alert = com.jobportal.backend.model.Notification.builder()
                .recipient(app.getCandidate())
                .message(notificationMessage)
                .read(false)
                .build();

        notificationRepository.save(alert);
        // --- End Notification Trigger Block ---

        return ResponseEntity.ok("Success: Application status updated to " + status);
    }

    @PutMapping("/{applicationId}/withdraw")
    public ResponseEntity<?> withdrawApplication(
            @PathVariable Long applicationId,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails
    ) {
        User candidate = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"));

        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application record not found"));

        // Security Guardrail: Verify that this candidate actually owns this application!
        if (!app.getCandidate().getId().equals(candidate.getId())) {
            return ResponseEntity.status(430).body("Error: Unauthorized action. You cannot withdraw this application.");
        }

        // Apply state transition
        app.setStatus(com.jobportal.backend.model.ApplicationStatus.WITHDRAWN);
        applicationRepository.save(app);

        return ResponseEntity.ok("Success: Your application has been cleanly withdrawn.");
    }
}
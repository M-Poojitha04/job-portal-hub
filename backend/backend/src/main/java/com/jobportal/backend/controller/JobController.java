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

    public JobController(JobRepository jobRepository, UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

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
}
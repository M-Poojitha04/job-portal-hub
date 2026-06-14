package com.jobportal.backend.controller;

import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.JobApplication;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.JobApplicationRepository;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public AnalyticsController(JobRepository jobRepository,
                               JobApplicationRepository applicationRepository,
                               UserRepository userRepository) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/recruiter-summary")
    public ResponseEntity<?> getRecruiterMetrics(@AuthenticationPrincipal UserDetails userDetails) {
        User recruiter = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("Recruiter session matching failed"));

        // 1. Fetch all listings owned by this recruiter
        List<Job> recruiterJobs = jobRepository.findByRecruiterIdOrderByCreatedAtDesc(recruiter.getId());
        long totalPostings = recruiterJobs.size();

        long totalApplicationsCount = 0;
        long acceptedCount = 0;
        long reviewingCount = 0;

        String topJobTitle = "None";
        long maxApplicationsForJob = -1;

        // 2. Compute funnel conversion matrix over listings
        for (Job job : recruiterJobs) {
            List<JobApplication> apps = applicationRepository.findByJobIdOrderByAppliedAtDesc(job.getId());
            long currentJobAppsSize = apps.size();
            totalApplicationsCount += currentJobAppsSize;

            // Track top-performing job listing title
            if (currentJobAppsSize > maxApplicationsForJob) {
                maxApplicationsForJob = currentJobAppsSize;
                topJobTitle = job.getTitle();
            }

            // Count lifecycle statuses
            for (JobApplication app : apps) {
                if (app.getStatus() == com.jobportal.backend.model.ApplicationStatus.ACCEPTED) {
                    acceptedCount++;
                } else if (app.getStatus() == com.jobportal.backend.model.ApplicationStatus.REVIEWING) {
                    reviewingCount++;
                }
            }
        }

        // Calculate a neat selection conversion rate percentage
        double placementRate = totalApplicationsCount > 0
                ? Math.round(((double) acceptedCount / totalApplicationsCount) * 100.0)
                : 0.0;

        // 3. Construct response packet map
        Map<String, Object> summaryMetrics = new HashMap<>();
        summaryMetrics.put("totalJobsPosted", totalPostings);
        summaryMetrics.put("totalApplicationsReceived", totalApplicationsCount);
        summaryMetrics.put("pendingReviewsCount", reviewingCount);
        summaryMetrics.put("placementRatePercentage", placementRate);
        summaryMetrics.put("topPerformingListing", topJobTitle);

        return ResponseEntity.ok(summaryMetrics);
    }
}
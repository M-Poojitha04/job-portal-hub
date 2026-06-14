package com.jobportal.backend.controller;

import com.jobportal.backend.model.Interview;
import com.jobportal.backend.model.JobApplication;
import com.jobportal.backend.model.Notification;
import com.jobportal.backend.repository.InterviewRepository;
import com.jobportal.backend.repository.JobApplicationRepository;
import com.jobportal.backend.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/interviews")
public class InterviewController {

    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository applicationRepository;
    private final NotificationRepository notificationRepository;

    public InterviewController(InterviewRepository interviewRepository,
                               JobApplicationRepository applicationRepository,
                               NotificationRepository notificationRepository) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.notificationRepository = notificationRepository;
    }

    // Post or Update an Interview schedule slot
    @PostMapping("/{applicationId}")
    public ResponseEntity<?> scheduleInterview(
            @PathVariable Long applicationId,
            @RequestBody Map<String, String> requestData
    ) {
        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        LocalDateTime date = LocalDateTime.parse(requestData.get("interviewDate"));
        String link = requestData.get("meetingLink");
        String notes = requestData.getOrDefault("notes", "");

        // Save or update schedule details
        Interview interview = interviewRepository.findByApplicationId(applicationId)
                .orElse(Interview.builder().application(app).build());

        interview.setInterviewDate(date);
        interview.setMeetingLink(link);
        interview.setNotes(notes);
        interviewRepository.save(interview);

        // Auto-generate notification for the candidate
        String alertMessage = String.format(
                "An interview has been scheduled for your '%s' application on %s. Link: %s",
                app.getJob().getTitle(),
                date.toLocalDate().toString(),
                link
        );

        notificationRepository.save(Notification.builder()
                .recipient(app.getCandidate())
                .message(alertMessage)
                .read(false)
                .build());

        return ResponseEntity.ok("Success: Interview scheduled and candidate notified.");
    }

    // Get interview details by application ID
    @GetMapping("/{applicationId}")
    public ResponseEntity<?> getInterviewDetails(@PathVariable Long applicationId) {
        return interviewRepository.findByApplicationId(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
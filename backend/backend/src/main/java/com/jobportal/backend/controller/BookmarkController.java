package com.jobportal.backend.controller;

import com.jobportal.backend.model.BookmarkedJob;
import com.jobportal.backend.model.Job;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.BookmarkedJobRepository;
import com.jobportal.backend.repository.JobRepository;
import com.jobportal.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bookmarks")
public class BookmarkController {

    private final BookmarkedJobRepository bookmarkRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public BookmarkController(BookmarkedJobRepository bookmarkRepository,
                              JobRepository jobRepository,
                              UserRepository userRepository) {
        this.bookmarkRepository = bookmarkRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    // Toggle Bookmark: Save or Unsave a job posting link
    @PostMapping("/toggle/{jobId}")
    public ResponseEntity<?> toggleJobBookmark(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        // 🔍 DEBUG TRACE PRINT: See if frontend click hits backend
        System.out.println("⭐ [BOOKMARK TOGGLE REQUEST] Received request for Job ID: " + jobId + " from user: " + userDetails.getUsername());

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User session invalid"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job profile not found"));

        return bookmarkRepository.findByUserIdAndJobId(user.getId(), jobId)
                .map(bookmark -> {
                    bookmarkRepository.delete(bookmark);
                    System.out.println("❌ [BOOKMARK DELETED] Removed Job ID " + jobId + " from user database record.");
                    return ResponseEntity.ok(Map.of("bookmarked", false, "message", "Bookmark removed cleanly"));
                })
                .orElseGet(() -> {
                    bookmarkRepository.save(BookmarkedJob.builder().user(user).job(job).build());
                    System.out.println("📝 [BOOKMARK SAVED] Persisted Job ID " + jobId + " to user database record.");
                    return ResponseEntity.ok(Map.of("bookmarked", true, "message", "Job position bookmarked successfully"));
                });
    }

    // Get list of all saved jobs for active candidate session
    @GetMapping("/my-bookmarks")
    public ResponseEntity<?> getMyBookmarks(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }

        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }

        // 1. Fetch raw bookmarks from database
        List<BookmarkedJob> rawBookmarks = bookmarkRepository.findByUserId(user.getId());

        // 2. Extract only clean, flat data structures to avoid any lazy-loading proxy loop or CORS crashes
        List<Map<String, Object>> serializedPayload = rawBookmarks.stream()
                .filter(b -> b != null && b.getJob() != null)
                .map(b -> {
                    Map<String, Object> bookmarkMap = new java.util.HashMap<>();
                    bookmarkMap.put("id", b.getId());

                    // Nest clean job fields manually
                    Map<String, Object> jobMap = new java.util.HashMap<>();
                    jobMap.put("id", b.getJob().getId());
                    jobMap.put("title", b.getJob().getTitle());
                    jobMap.put("companyName", b.getJob().getCompanyName());
                    jobMap.put("location", b.getJob().getLocation());
                    jobMap.put("jobType", b.getJob().getJobType() != null ? b.getJob().getJobType().toString() : "FULL_TIME");
                    jobMap.put("salaryRange", b.getJob().getSalaryRange());
                    jobMap.put("experienceRequired", b.getJob().getExperienceRequired());

                    bookmarkMap.put("job", jobMap);
                    return bookmarkMap;
                })
                .collect(java.util.stream.Collectors.toList());

        // 3. Return the completely decoupled, pure data payload
        return ResponseEntity.ok(serializedPayload);
    }

    // Check check mark baseline state map for frontend listing views
    @GetMapping("/check/{jobId}")
    public ResponseEntity<?> checkBookmarkState(@PathVariable Long jobId, @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.ok(Map.of("bookmarked", false));
        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) return ResponseEntity.ok(Map.of("bookmarked", false));

        boolean exists = bookmarkRepository.existsByUserIdAndJobId(user.getId(), jobId);
        return ResponseEntity.ok(Map.of("bookmarked", exists));
    }
}
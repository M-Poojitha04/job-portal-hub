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
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User session invalid"));

        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job profile not found"));

        return bookmarkRepository.findByUserIdAndJobId(user.getId(), jobId)
                .map(bookmark -> {
                    bookmarkRepository.delete(bookmark);
                    return ResponseEntity.ok(Map.of("bookmarked", false, "message", "Bookmark removed cleanly"));
                })
                .orElseGet(() -> {
                    bookmarkRepository.save(BookmarkedJob.builder().user(user).job(job).build());
                    return ResponseEntity.ok(Map.of("bookmarked", true, "message", "Job position bookmarked successfully"));
                });
    }

    // Get list of all saved jobs for active candidate session
    @GetMapping("/my-bookmarks")
    public ResponseEntity<List<BookmarkedJob>> getMyBookmarks(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User session invalid"));
        return ResponseEntity.ok(bookmarkRepository.findByUserId(user.getId()));
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
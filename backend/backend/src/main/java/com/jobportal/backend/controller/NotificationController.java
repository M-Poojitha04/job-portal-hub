package com.jobportal.backend.controller;

import com.jobportal.backend.model.Notification;
import com.jobportal.backend.model.User;
import com.jobportal.backend.repository.NotificationRepository;
import com.jobportal.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationController(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // Get all notifications for logged-in user
    @GetMapping
    public ResponseEntity<?> getMyNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User scope target not found"));

        List<Notification> notes = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());
        long unreadCount = notificationRepository.countByRecipientIdAndReadFalse(user.getId());

        return ResponseEntity.ok(Map.of("notifications", notes, "unreadCount", unreadCount));
    }

    // Mark all notifications as read
    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User scope target not found"));

        List<Notification> unreadNotes = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream().filter(n -> !n.isRead()).toList();

        unreadNotes.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unreadNotes);

        return ResponseEntity.ok("Success: Cleared notifications context ledger.");
    }
}
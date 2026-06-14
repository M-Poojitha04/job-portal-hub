package com.jobportal.backend.repository;

import com.jobportal.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Fetch notifications sorted newest first for a specific user
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    // Quick count for unread items badge displays
    long countByRecipientIdAndReadFalse(Long recipientId);
}
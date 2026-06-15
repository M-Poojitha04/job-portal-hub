package com.jobportal.backend.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationPushService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationPushService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // Push real-time event alerts directly to all active topic sub-channels
// Push real-time event alerts directly to all active topic sub-channels
    public void sendGlobalAlert(String subTopic, String title, String summary) {
        // Create an explicit, strongly-typed map payload statement to eliminate generic ambiguity
        Map<String, String> payload = new HashMap<>();
        payload.put("title", title);
        payload.put("summary", summary);
        payload.put("timestamp", java.time.LocalDateTime.now().toString());

        messagingTemplate.convertAndSend("/topic/" + subTopic, payload);
    }
}

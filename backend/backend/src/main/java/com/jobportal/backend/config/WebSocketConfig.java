package com.jobportal.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Fixed: The correct native Spring method name is singular 'addEndpoint'
        registry.addEndpoint("/ws-portal")
                .setAllowedOrigins("http://localhost:5173")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable a simple in-memory broker prefix for client destination subscriptions
        registry.enableSimpleBroker("/topic");

        // Prefix for incoming messages routed to @MessageMapping controller actions
        registry.setApplicationDestinationPrefixes("/app");
    }
}
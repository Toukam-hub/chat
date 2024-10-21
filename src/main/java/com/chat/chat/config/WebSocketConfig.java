package com.chat.chat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // Enregistre les points de terminaison STOMP
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Ajoute un endpoint pour les connexions WebSocket et active SockJS comme fallback
        registry.addEndpoint("/ws").withSockJS();
    }

    // Configure le broker de messages
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Définit le préfixe pour les destinations des applications
        registry.setApplicationDestinationPrefixes("/app");
        // Active un broker simple en mémoire avec le préfixe "/topic"
        registry.enableSimpleBroker("/topic");
    }
}

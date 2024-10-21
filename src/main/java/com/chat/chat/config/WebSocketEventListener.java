package com.chat.chat.config;

import com.chat.chat.model.ChatMessage;
import com.chat.chat.model.MessageType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    // Template pour envoyer des messages via WebSocket
    private final SimpMessageSendingOperations messageTemplate;

    // Listener pour les événements de déconnexion de session WebSocket
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        // Accesseur pour les en-têtes STOMP
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());

        // Récupère le nom d'utilisateur à partir des attributs de session
        String username = (String) headerAccessor.getSessionAttributes().get("username");

        if (username != null) {
            // Log une information de déconnexion d'utilisateur
            log.info("User disconnected: {}", username);

            // Crée un message de type LEAVE pour notifier les autres utilisateurs
            var chatMessage = ChatMessage.builder()
                    .type(MessageType.LEAVE)
                    .sender(username)
                    .build();

            // Envoie le message de déconnexion à tous les abonnés du sujet public
            messageTemplate.convertAndSend("/topic/public", chatMessage);
        }
    }
}

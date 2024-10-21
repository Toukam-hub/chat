package com.chat.chat.controller;

import com.chat.chat.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    // Gère les messages envoyés à /chat.sendMessage et les diffuse à /topic/public
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        // Retourne le message reçu pour le diffuser aux abonnés du sujet public
        return chatMessage;
    }

    // Gère l'ajout d'un utilisateur à /chat.addUser et le notifie à /topic/public
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Ajoute le nom d'utilisateur dans les attributs de la session WebSocket
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        // Retourne le message de l'utilisateur ajouté pour le notifier aux abonnés du sujet public
        return chatMessage;
    }
}

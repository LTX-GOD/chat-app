package com.example.chatapp.controller;

import com.example.chatapp.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.util.StringUtils;
import lombok.RequiredArgsConstructor;

@Controller
@CrossOrigin
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage) {
        return chatMessage;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;
    }

    @MessageMapping("/chat.sendFile")
    @SendTo("/topic/public")
    public ChatMessage sendFile(@Payload ChatMessage chatMessage) {
        // Validate file size and type if needed
        if (chatMessage.getFileContent() != null && chatMessage.getFileContent().length > 0) {
            String fileExtension = StringUtils.getFilenameExtension(chatMessage.getFileName());
            if (fileExtension != null) {
                if (isImageFile(fileExtension)) {
                    chatMessage.setType(ChatMessage.MessageType.IMAGE);
                } else {
                    chatMessage.setType(ChatMessage.MessageType.FILE);
                }
            }
        }
        return chatMessage;
    }

    private boolean isImageFile(String fileExtension) {
        return fileExtension.toLowerCase().matches("png|jpg|jpeg|gif|bmp");
    }
}

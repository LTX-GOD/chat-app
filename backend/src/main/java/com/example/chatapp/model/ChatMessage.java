package com.example.chatapp.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatMessage {
    private MessageType type;
    private String content;
    private String sender;
    private String fileName;
    private String fileType;
    private byte[] fileContent;
    private LocalDateTime timestamp;

    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE,
        FILE,
        IMAGE
    }

    // Constructor for text messages
    public static ChatMessage createTextMessage(String sender, String content) {
        ChatMessage message = new ChatMessage();
        message.setType(MessageType.CHAT);
        message.setSender(sender);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        return message;
    }

    // Constructor for file/image messages
    public static ChatMessage createFileMessage(String sender, String fileName, String fileType, byte[] fileContent, MessageType type) {
        ChatMessage message = new ChatMessage();
        message.setType(type);
        message.setSender(sender);
        message.setFileName(fileName);
        message.setFileType(fileType);
        message.setFileContent(fileContent);
        message.setTimestamp(LocalDateTime.now());
        return message;
    }

    // Constructor for join/leave messages
    public static ChatMessage createEventMessage(String sender, MessageType type) {
        ChatMessage message = new ChatMessage();
        message.setType(type);
        message.setSender(sender);
        message.setTimestamp(LocalDateTime.now());
        return message;
    }
}

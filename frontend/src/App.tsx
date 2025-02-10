import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, MessageType } from './types/ChatMessage';
import './App.css';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const serverUrl = `http://${window.location.hostname}:8080/ws`;
  useEffect(() => {
    if (isLoggedIn) {
      const client = new Client({
        webSocketFactory: () => new SockJS(serverUrl),
        onConnect: () => {
          console.log('Connected to WebSocket');
          client.subscribe('/topic/public', (message) => {
            const newMessage: ChatMessage = JSON.parse(message.body);
            setMessages((prev) => [...prev, newMessage]);
          });

          // Send join message
          client.publish({
            destination: '/app/chat.addUser',
            body: JSON.stringify({
              type: MessageType.JOIN,
              sender: username,
              timestamp: new Date().toISOString()
            })
          });
        },
        onDisconnect: () => {
          console.log('Disconnected from WebSocket');
        }
      });

      client.activate();
      setStompClient(client);

      return () => {
        client.deactivate();
      };
    }
  }, [isLoggedIn, username]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && stompClient) {
      const chatMessage: ChatMessage = {
        type: MessageType.CHAT,
        content: messageInput,
        sender: username,
        timestamp: new Date().toISOString()
      };

      stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(chatMessage)
      });

      setMessageInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && stompClient) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Content = event.target?.result?.toString().split(',')[1];
        const chatMessage: ChatMessage = {
          type: file.type.startsWith('image/') ? MessageType.IMAGE : MessageType.FILE,
          sender: username,
          fileName: file.name,
          fileType: file.type,
          fileContent: base64Content,
          timestamp: new Date().toISOString()
        };

        stompClient.publish({
          destination: '/app/chat.sendFile',
          body: JSON.stringify(chatMessage)
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Enter Chat Room</h2>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit">Join Chat</button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat Room</h2>
        <p>Welcome, {username}!</p>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === username ? 'own-message' : ''}`}
          >
            <div className="message-header">
              <span className="sender">{msg.sender}</span>
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
            {msg.type === MessageType.CHAT && (
              <div className="message-content">{msg.content}</div>
            )}
            {msg.type === MessageType.IMAGE && (
              <img
                src={`data:${msg.fileType};base64,${msg.fileContent}`}
                alt={msg.fileName}
                className="message-image"
              />
            )}
            {msg.type === MessageType.FILE && (
              <div className="message-file">
                <a
                  href={`data:${msg.fileType};base64,${msg.fileContent}`}
                  download={msg.fileName}
                >
                  📎 {msg.fileName}
                </a>
              </div>
            )}
            {(msg.type === MessageType.JOIN || msg.type === MessageType.LEAVE) && (
              <div className="system-message">
                {msg.sender} has {msg.type.toLowerCase()}ed the chat
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="upload-button"
        >
          📎
        </button>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default App;

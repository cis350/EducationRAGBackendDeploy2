import React, { useState, useEffect } from 'react';
import { useTheme } from '../api/ThemeContext';  // Import the useTheme hook
import './MessageDisplay.css';

const MessageDisplay = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const { theme } = useTheme();  // Use the theme from the context
  
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;

      try {
        const response = await fetch(`http://localhost:3001/fetch-messages/${chatId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        if (response.ok) {
          setMessages(data.messages);
        } else {
          throw new Error(data.message || "Failed to load messages");
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
  
    try {
      const response = await fetch(`http://localhost:3001/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          chatId: chatId,
          message: newMessageText,
          isUserMessage: true
        })
      });
      const data = await response.json();
      if (response.ok) {
        // Combine the user's message and the bot's response
        const updatedMessages = [...messages, data.chat[data.chat.length - 2], data.chat[data.chat.length - 1]];
        setMessages(updatedMessages);
        setNewMessageText('');
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Optional: Notify the user that an error occurred
    }
  };

  return (
    <div className={`message-display ${theme}-theme`}>
      <div className="messages-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isUserMessage ? 'user-message' : 'bot-message'}`}>
            <div className="message-content">
              {msg.message}
            </div>
            <div className="message-time">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          className="message-input"
          value={newMessageText}
          onChange={(e) => setNewMessageText(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
};

export default MessageDisplay;
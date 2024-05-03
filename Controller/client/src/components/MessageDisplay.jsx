import React, { useState, useEffect } from 'react';
import { useTheme } from '../api/ThemeContext';  // Import the useTheme hook
import './MessageDisplay.css';
import { rootURL } from "./utils";

/**
 * Component to display chat messages and allow users to send new messages.
 * It fetches messages for a specific chat and handles the sending of new messages.
 *
 * @param {Object} props - Component props.
 * @param {string} props.chatId - The ID of the current chat session.
 * @returns {JSX.Element} The rendered message display component.
 */
const MessageDisplay = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const { theme } = useTheme();  // Use the theme from the context
  
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) return;

      try {
        const response = await fetch(`${rootURL}/fetch-messages/${chatId}`, {
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
  
    // Display the user's message immediately in the UI
    const userMessage = {
      message: newMessageText,
      isUserMessage: true,
      createdAt: new Date().toISOString(), // Capture the current timestamp
    };
  
    // Optimistically update the UI with the user's message
    setMessages([...messages, userMessage]);
    setNewMessageText('');
  
    try {
      const response = await fetch(`${rootURL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          chatId: chatId,
          message: userMessage.message,
          isUserMessage: true
        })
      });
      const data = await response.json();
      if (response.ok) {
        // Assume the last message in the response array is the bot's response
        // and update messages to include the bot's response
        const botResponse = data.chat[data.chat.length - 1];
        setMessages(prevMessages => [...prevMessages, botResponse]);
      } else {
        throw new Error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally handle state rollback or alert the user
      setMessages(messages.filter(msg => msg !== userMessage)); // Remove optimistic message on failure
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
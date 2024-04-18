import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatHistorySidebar from './ChatHistorySidebar'; // Assuming this component exists
import './Chat.css';
import axios from 'axios'
import UserSettings from './UserSettings';
import { useTheme } from './ThemeContext';

export default function Chat() {
  const [newMessageText, setNewMessageText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme(); // Correctly using theme from context

  const sendMessage = (e) => {
    e.preventDefault();
    console.log(newMessageText);
    setNewMessageText('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login');
        return;
    }

    // Manually parse the JWT to extract its expiration time
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = new Date();
    if (payload.exp * 1000 <= now.getTime()) {
        localStorage.removeItem('token');
        navigate('/login');
    }

    // Optional: set a timeout to kick user out at token expiration
    const timeout = payload.exp * 1000 - now.getTime();
    const timer = setTimeout(() => {
        localStorage.removeItem('token');
        navigate('/login');
    }, timeout);

    return () => clearTimeout(timer);
}, [navigate]);

return (
  <div className={`chat-page-container ${theme}-theme`}>
    <ChatHistorySidebar />
    <div className="chat-content">
      <header className="chat-header">
        <div className="header-spacer"></div> {/* This div acts as a spacer */}
        <div className="header-spacer"></div> {/* This div acts as a spacer */}
        <div className="header-spacer"></div> {/* This div acts as a spacer */}
        <div className="header-spacer"></div> {/* This div acts as a spacer */}
        <button onClick={() => navigate('/faq')} className="faq-button">Go to FAQ</button>
        <button onClick={() => setShowSettings(true)} className="settings-button">Settings</button>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>
      <div className="messages-container">
        {/* Messages will dynamically be inserted here */}
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
    {showSettings && <UserSettings onClose={() => setShowSettings(false)} />}
  </div>
);
}
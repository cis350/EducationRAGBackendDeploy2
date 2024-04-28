import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatHistorySidebar from './ChatHistorySidebar'; // Assuming this component exists
import './Chat.css';
import UserSettings from '../api/UserSettings';
import { useTheme } from '../api/ThemeContext';
import MessageDisplay from './MessageDisplay'; // Ensure this is imported


/**
 * Main chat component that includes chat history, message display, and user settings.
 * Manages user authentication and token expiration.
 * 
 * @returns {JSX.Element} The chat interface with dynamic theme support.
 */
export default function Chat() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme(); // Correctly using theme from context

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
    <ChatHistorySidebar onSelectChat={setSelectedChatId} selectedChatId={selectedChatId}/>
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
      {selectedChatId && <MessageDisplay chatId={selectedChatId} />}
    </div>
    {showSettings && <UserSettings onClose={() => setShowSettings(false)} />}
  </div>
);
}
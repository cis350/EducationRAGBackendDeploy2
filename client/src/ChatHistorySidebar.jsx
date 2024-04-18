import React, { useState } from 'react';
import './ChatHistorySidebar.css'; // Ensure your CSS file path is correct
import { useTheme } from './ThemeContext'; // Adjust the path as necessary

const ChatHistorySidebar = () => {
  const { theme } = useTheme(); // Access the current theme
  const [chats, setChats] = useState([]); // State to keep track of chat names
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [newChatName, setNewChatName] = useState(''); // State to hold the new chat name

  const handleNewChat = () => {
    setShowModal(true); // Show the modal
  };

  const handleModalClose = () => {
    setShowModal(false);
    setNewChatName(''); // Reset input field
  };

  const handleModalConfirm = () => {
    if (newChatName.trim()) {
      setChats([...chats, newChatName.trim()]);
      handleModalClose(); // Close modal and reset state
    }
  };

  return (
    <div className={`chat-history-sidebar ${theme}-theme`}>
      <div className="header">
        <h3>EduRAG</h3>
        <button className="new-chat-button" onClick={handleNewChat}>New Chat</button>
      </div>
      <ul>
        {chats.map((chat, index) => (
          <li key={index}>
            <button className="chat-select-button" onClick={() => console.log(`Chat selected: ${chat}`)}>
              {chat}
            </button>
          </li>
        ))}
      </ul>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h4>Enter new chat name</h4>
            <input
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              placeholder="Chat name"
            />
            <button onClick={handleModalConfirm}>Confirm</button>
            <button onClick={handleModalClose}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistorySidebar;
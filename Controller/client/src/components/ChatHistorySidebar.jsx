import React, { useState, useEffect } from 'react';
import './ChatHistorySidebar.css'; // Ensure your CSS file path is correct
import { useTheme } from '../api/ThemeContext'; // Adjust the path as necessary


/**
 * A sidebar component that displays a list of chat sessions and allows users to manage them.
 * Users can select, create new, or delete existing chats.
 * 
 * @param {object} props - The component props.
 * @param {function} props.onSelectChat - Handler to set the selected chat ID in parent component.
 * @param {string|null} props.selectedChatId - The ID of the currently selected chat.
 * @returns {JSX.Element} The rendered chat history sidebar.
 */
const ChatHistorySidebar = ({ onSelectChat, selectedChatId}) => {
  const { theme } = useTheme();
  const [chats, setChats] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newChatName, setNewChatName] = useState('');

  // Fetch existing chats
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/chats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming the token is stored in localStorage
          },
        });
        const data = await response.json();
        if (response.ok) {
          setChats(data.chats);
        } else {
          throw new Error(data.message || "Failed to fetch chats");
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
      }
    };

    fetchChats();
  }, []);

  // Handle creating a new chat
  const handleModalConfirm = async () => {
    if (newChatName.trim()) {
      try {
        const response = await fetch('http://localhost:3001/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,  // Using token for authorization
          },
          body: JSON.stringify({ chatName: newChatName.trim() }),
        });
        const data = await response.json();
        if (response.ok) {
          setChats([...chats, data]);
          handleModalClose();
        } else {
          throw new Error(data.message || "Failed to create chat");
        }
      } catch (error) {
        console.error('Failed to create chat:', error);
      }
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setChats(chats.filter(chat => chat.chatId !== chatId));
      } else {
        throw new Error(data.message || "Failed to delete chat");
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };


  // Modal close handling
  const handleModalClose = () => {
    setShowModal(false);
    setNewChatName('');
  };

  // New chat button handling
  const handleNewChat = () => {
    setShowModal(true);
  };

  const handleChatSelect = (chatId) => {
    if (chatId === selectedChatId) {
      onSelectChat(null);  // Deselect if the same chat is clicked
    } else {
      onSelectChat(chatId);
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
          <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <button
              className="chat-select-button"
              onClick={() => handleChatSelect(chat.chatId)}
              style={{
                flexGrow: 9,
                marginRight: '10px',
                width: '0px',
                backgroundColor: chat.chatId === selectedChatId ? '#007bff' : '#f0f0f0'
              }}
            >
              {chat.chatName}
            </button>
            <button
              onClick={() => handleDeleteChat(chat.chatId)}
              style={{
                backgroundColor: 'red',
                color: 'white',
                flexGrow: 1,
                width: '0px'
              }}
            >
              X
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
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import '../components/UserSettings.css'; // This line imports the CSS styles
import { useTheme } from './ThemeContext';
import { rootURL } from "./utils";

/**
 * Component to manage and update user settings such as expertise level and theme preference.
 * Fetches the current settings from the server on component mount and provides UI for updating them.
 * 
 * @param {object} props - The component props.
 * @param {Function} props.onClose - A function to call when closing the settings dialog.
 * @returns {JSX.Element} The rendered component for user settings management.
 */
function UserSettings({ onClose }) {
  const [expertiseLevel, setExpertiseLevel] = useState('beginner');
  const [darkMode, setDarkMode] = useState(false);
  const { setTheme } = useTheme(); // Use setTheme from context

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${rootURL}/get-user-settings`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data && response.data.settings) {
          setExpertiseLevel(response.data.settings.expertiseLevel);
          setDarkMode(response.data.settings.colorTheme === 'dark');
        }
      } catch (error) {
        console.error("Error fetching user settings:", error.response ? error.response.data.message : "An error occurred");
      }
    };

    fetchSettings();
  }, []); // Empty dependency array means this effect runs once on mount

  const getUserId = async () => {
    try {
      const response = await axios.get(`${rootURL}/get-user-id`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming the token is stored in localStorage
        },
      });
  
      if (response.data && response.data.userId) {
        return response.data.userId;
      } else {
        console.error("User ID not found.");
        return null; // Handle as you see fit
      }
    } catch (error) {
      console.error("Error fetching user ID:", error.response ? error.response.data.message : "An error occurred");
      return null; // Handle error appropriately
    }
  };

  const handleSave = async () => {
    const userId = await getUserId(); // Implement this function based on your auth system
    const settings = { expertiseLevel, colorTheme: darkMode ? 'dark' : 'light' };
    
    console.log(settings)

    try {
      const response = await fetch(`${rootURL}/update-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming the token is stored in localStorage
        },
        body: JSON.stringify({ userId, settings }),
      });
  
      const data = await response.json();
      console.log(data.message);
      onClose();
    } catch (error) {
      console.error('Error updating settings:', error);
    }

    setTheme(darkMode ? 'dark' : 'light'); // This updates the theme globally via context
    onClose(); // Close the settings modal or component
  };

  return (
    <div className="settings-container">
      <h2>User Settings</h2>
      <label>Expertise Level:
        <select value={expertiseLevel} onChange={(e) => setExpertiseLevel(e.target.value)}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          checked={darkMode}
          onChange={(e) => setDarkMode(e.target.checked)}
        />
        Dark Mode
      </label>
      <br />
      <button onClick={handleSave}>Save Settings</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}

export default UserSettings;
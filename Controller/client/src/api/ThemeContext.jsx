import axios from 'axios'; // Ensure this import statement is complete
import React, { createContext, useContext, useState, useEffect } from 'react';
const ThemeContext = createContext();



export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light'); // Default to light

    useEffect(() => {
      // Optional: If you want to fetch the theme from a server when the app loads
      const fetchAndSetUserTheme = async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await axios.get('http://localhost:3000/get-user-settings', {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            if (response.data && response.data.settings) {
              setTheme(response.data.settings.colorTheme); // Set fetched theme
            }
          } catch (error) {
            console.error("Error fetching user settings:", error);
          }
        }
      };

      fetchAndSetUserTheme();
    }, []);

    return (
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    );
};

export function useTheme() {
    return useContext(ThemeContext);
}
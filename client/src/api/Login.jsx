import axios from 'axios';
import React, { useState } from 'react';
import '../components/Login.css'; // Ensure it contains .error-message styles
import { useNavigate } from "react-router-dom";
import { useTheme } from './ThemeContext'; 

/**
 * Functional component for handling user login.
 * Manages user input for email and password, submits these credentials to the server,
 * and handles the server response by setting user-specific settings and navigating to the chat page.
 * 
 * @returns {JSX.Element} A login form with email and password fields.
 */
function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // New state for error messages
    const navigate = useNavigate();
    const { setTheme } = useTheme();

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage(''); // Clear previous error messages
    
        axios.post('http://localhost:3001/login', { email, password })
            .then(result => {
                if (result.data.message === "Success") {
                    const { token } = result.data;
                    localStorage.setItem('token', token); // Store the token
    
                    // Fetch user settings after successful login
                    axios.get('http://localhost:3001/get-user-settings', {
                      headers: { 'Authorization': `Bearer ${token}` }
                    })
                    .then(settingsResult => {
                      const { colorTheme } = settingsResult.data.settings;
                      setTheme(colorTheme); // Update the theme globally
                      navigate('/chat'); // Navigate to chat after setting the theme
                    })
                    .catch(settingsError => {
                      console.error("Error fetching user settings:", settingsError);
                      navigate('/chat'); // Optional: Navigate to chat even if fetching settings fails
                    });
                } else {
                    // Set error message from server response
                    setErrorMessage(result.data.message);
                }
            })
            .catch(error => {
                // Fallback error message
                setErrorMessage(error.response ? error.response.data.message : "Login error");
            });
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Log In</button>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <p className="signup-link">
                    Don't have an account? <a href="/signup">Sign up</a>
                </p>
            </form>
        </div>
    );
}

export default Login;
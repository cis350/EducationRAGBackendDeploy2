import axios from 'axios';
import React, { useState } from 'react';
import '../components/Signup.css'; // Ensure this CSS file includes styles for .error-message
import { rootURL } from "./utils";

/**
 * Functional component for handling user registration.
 * Manages user inputs for email, username, and password, and submits these to the server.
 * Displays messages based on the success or failure of the registration process.
 * 
 * @returns {JSX.Element} A sign-up form with fields for email, username, and password.
 */
function Signup() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // State to store error message
    const [successMessage, setSuccessMessage] = useState('');

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(''); // Reset error message on new submission

        // Basic frontend password validation
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        axios.post(`${rootURL}/signup`, { username, email, password })
            .then(result => {
                console.log(result);
                if(result.data.message === 'User created successfully.') {
                    setSuccessMessage('Registration successful. Redirecting to login...');
                    setTimeout(() => {
                    window.location.href = '/login'; // Use navigate('/login') if you are using react-router-dom v6
                    }, 3000); // Redirect after 3 seconds
                } else {
                    setError('Failed to register account.');
                }
                
            })
            .catch(err => {
              console.log(err);
              const errorMessage = err.response && err.response.data ? err.response.data.message : 'An error occurred. Please try again.';
              setError(errorMessage);
            })
    };

    return (
        <div className="signup-container">
            <form className="signup-form" onSubmit={handleSubmit}>
                <h2>Sign Up</h2>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" id="signup">Sign Up</button>
                {error && <div className="error-message">{error}</div>}
                {successMessage && <div className="success-message">{successMessage}</div>}
                <p className="login-link">
                    Already have an account? <a href="/login">Log in</a>
                </p>
            </form>
        </div>
    );
}

export default Signup;
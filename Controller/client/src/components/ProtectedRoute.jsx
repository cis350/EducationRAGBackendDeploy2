import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * A higher-order component that wraps around protected routes to enforce authentication.
 * If the user is not authenticated (i.e., no token is found in localStorage), it redirects them to the login page.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The components that are children of this protected route.
 * @returns {React.ReactNode} - Either renders the children components if the user is authenticated,
 *                              or redirects to the login page if not authenticated.
 */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // You'll need to install this: npm install jwt-decode

const AuthContext = createContext(null);

// Placeholder function to decode token and get user data
const getAuthData = (token) => {
    if (!token) return { user: null, role: null };
    try {
        const decodedToken = jwtDecode(token);
        
        // Ensure you return the payload data needed for the user object
        // Assuming your token payload includes 'user_id', 'email', 'role', and 'department'
        return {
            user: {
                id: decodedToken.user_id,
                email: decodedToken.email,
                role: decodedToken.role,
                department: decodedToken.department,
            },
            role: decodedToken.role,
            isAuthReady: true,
        };
    } catch (e) {
        console.error("Failed to decode token:", e);
        return { user: null, role: null, isAuthReady: true };
    }
};

export const AuthProvider = ({ children }) => {
    // Store the full token object from localStorage
    const [authTokens, setAuthTokens] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial setup on mount
    useEffect(() => {
        const storedTokens = localStorage.getItem('authTokens');
        if (storedTokens) {
            try {
                const parsedTokens = JSON.parse(storedTokens);
                setAuthTokens(parsedTokens);
                const { user: initialUser } = getAuthData(parsedTokens.access);
                setUser(initialUser);
            } catch (error) {
                console.error("Failed to parse tokens from localStorage", error);
                // Clear corrupted tokens
                localStorage.removeItem('authTokens');
            }
        }
        setLoading(false);
    }, []);

    const login = (tokens) => {
        // Store the entire token object
        localStorage.setItem('authTokens', JSON.stringify(tokens));
        const { user: loggedInUser } = getAuthData(tokens.access);
        setUser(loggedInUser);
        setAuthTokens(tokens);
    };

    const logout = () => {
        localStorage.removeItem('authTokens');
        setUser(null);
        setAuthTokens(null);
        // Optional: redirect to login page here if needed, but often handled by the component
    };

    const contextData = {
        user,
        // Expose the whole token object for refresh logic later
        authTokens,
        login,
        logout,
        loading,
        // Helper property to check if user has a specific role
        hasRole: (requiredRole) => user?.role === requiredRole,
        // Helper property to check if user has any of the required roles
        hasAnyRole: (requiredRoles) => requiredRoles.includes(user?.role)
    };

    return (
        <AuthContext.Provider value={contextData}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

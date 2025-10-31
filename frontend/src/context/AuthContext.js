import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Store the full token object in state and localStorage
    const [authTokens, setAuthTokens] = useState(() => {
        const storedTokens = localStorage.getItem('authTokens');
        try {
            return storedTokens ? JSON.parse(storedTokens) : null;
        } catch (error) {
            console.error("Failed to parse tokens from localStorage", error);
            return null;
        }
    });

    // User object is derived from the decoded token
    const [user, setUser] = useState(() => 
        authTokens ? jwtDecode(authTokens.access) : null
    );

    const login = (tokens) => {
        localStorage.setItem('authTokens', JSON.stringify(tokens));
        setAuthTokens(tokens);
        setUser(jwtDecode(tokens.access));
    };

    const logout = () => {
        localStorage.removeItem('authTokens');
        setAuthTokens(null);
        setUser(null);
    };

    // NOTE: In a full production app, you would also add logic here
    // to handle token refreshing using the `refresh` token.

    const value = { user, authTokens, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
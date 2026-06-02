import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const register = async (userData) => {
        const result = await authService.register(userData);
        if (result.success) {
            setUser(result.data.user);
        }
        return result;
    };

    const login = async (credentials) => {
        const result = await authService.login(credentials);
        if (result.success) {
            setUser(result.data.user);
        }
        return result;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        isApplicant: user?.role === 'applicant',
        isAuditor: user?.role === 'auditor',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
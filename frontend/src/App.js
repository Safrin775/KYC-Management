import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/login';
import Register from './components/auth/register';
import ApplicantDashboard from './components/kyc/IndexDashboard';
import { CircularProgress, Box } from '@mui/material';
import IndexKYC from './components/kyc/KycStepper';
import AuditorDashboard from './components/auditor/IndexAuditor';
import ThemeContextProvider from './context/ThemeContext';
// Protected Route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function AppContent() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/applicant/dashboard" element={
                <ProtectedRoute allowedRoles={['applicant']}>
                    <ApplicantDashboard />
                </ProtectedRoute>
            } />

            <Route path="/kyc/form" element={
                <ProtectedRoute allowedRoles={['applicant']}>
                    <IndexKYC />
                </ProtectedRoute>
            } />
            
            <Route path="/auditor/dashboard" element={
                <ProtectedRoute allowedRoles={['auditor']}>
                    <AuditorDashboard />
                </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <ThemeContextProvider>
            <Router>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </Router>
        </ThemeContextProvider>
    );
}

export default App;
import React, { useState } from 'react';
import {Container,Box,TextField,Button,Typography,Paper,Select,MenuItem,FormControl,InputLabel,Alert,CircularProgress} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password2: '',
        role: 'applicant'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.password2) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const result = await register({
            email: formData.email,
            password: formData.password,
            password2: formData.password2,
            role: formData.role
        });

        if (result.success) {
            if (formData.role === 'auditor') {
                navigate('/auditor/dashboard');
            } else {
                navigate('/applicant/dashboard');
            }
        } else {
            if (typeof result.error === 'object') {
                const firstError = Object.values(result.error)[0];
                setError(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                setError(result.error || 'Registration failed');
            }
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Create Account
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        Join KYC System
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                            disabled={loading}
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                            disabled={loading}
                            helperText="Password must be at least 6 characters"
                        />

                        <TextField
                            fullWidth
                            label="Confirm Password"
                            name="password2"
                            type="password"
                            value={formData.password2}
                            onChange={handleChange}
                            margin="normal"
                            required
                            disabled={loading}
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                label="Role"
                                disabled={loading}
                            >
                                <MenuItem value="applicant">Applicant - Submit KYC</MenuItem>
                                <MenuItem value="auditor">Auditor - Review Applications</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Register'}
                        </Button>

                        <Button
                            fullWidth
                            variant="text"
                            onClick={() => navigate('/login')}
                            disabled={loading}
                        >
                            Already have an account? Login
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;
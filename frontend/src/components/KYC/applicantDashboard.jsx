import React from 'react';
import { Container, Box, Paper, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
const ApplicantDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4 }}>
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Welcome, {user?.email}!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Role: Applicant
                    </Typography>
                    <Button variant="outlined" color="error" onClick={logout} sx={{ mt: 2 }}>
                        Logout
                    </Button>
                </Paper>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    Start KYC Application
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Begin your Know Your Customer verification process.
                                </Typography>
                                <Button variant="contained" color="primary" onClick={() => navigate('/kyc/form')}>
                                    Start Now
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" gutterBottom>
                                    Check Status
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    View your KYC application status.
                                </Typography>
                                <Button variant="outlined" color="primary">
                                    View Status
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default ApplicantDashboard;
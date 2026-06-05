import React, { useState } from 'react';
import { 
    Container, Box, Paper, Typography, Button, Card, CardContent, 
    Grid, Alert, Chip, CircularProgress, Divider 
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ApplicantDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [showStatus, setShowStatus] = useState(false);
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchStatus = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/kyc/status/');
            if (res.data.has_application && res.data.data) {
                setApplication(res.data.data);
            } else {
                setApplication(null);
            }
            setShowStatus(true);
        } catch (err) {
            setError('Failed to load status');
        } finally {
            setLoading(false);
        }
    };

    const closeStatus = () => {
        setShowStatus(false);
        setApplication(null);
        setError('');
    };

    const statusColors = {
        approved: 'success',
        rejected: 'error',
        pending: 'warning',
        resubmit: 'warning'
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4 }}>
                {/* Welcome Card */}
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

                {/* Action Cards */}
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
                                <Button 
                                    variant="outlined" 
                                    color="primary"
                                    onClick={fetchStatus}
                                    disabled={loading}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'View Status'}
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {showStatus && (
                    <Box sx={{ mt: 4 }}>
                        <Paper sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Your KYC Status</Typography>
                                <Button size="small" onClick={closeStatus}>Close</Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />

                            {error && <Alert severity="error">{error}</Alert>}

                            {!application && !error && (
                                <Alert severity="info">
                                    No KYC application found. 
                                </Alert>
                            )}

                            {application && (
                                <Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Application ID</Typography>
                                            <Typography variant="body1" fontWeight="bold">#{application.application_id}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography variant="body2" color="text.secondary">Status</Typography>
                                            <Chip 
                                                label={application.status.toUpperCase()} 
                                                color={statusColors[application.status] || 'default'}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2" color="text.secondary">Submitted On</Typography>
                                            <Typography variant="body2">{new Date(application.submitted_at).toLocaleString()}</Typography>
                                        </Grid>
                                        {application.rejection_reason && (
                                            <Grid item xs={12}>
                                                <Alert severity="warning" sx={{ mt: 1 }}>
                                                    <strong>{application.status === 'rejected' ? 'Rejection Reason:' : 'Required Corrections:'}</strong>
                                                    <Box>{application.rejection_reason}</Box>
                                                    {application.status === 'resubmit' && (
                                                        <Button size="small" variant="contained" onClick={() => navigate('/kyc/form')} sx={{ mt: 1 }}>
                                                            Resubmit
                                                        </Button>
                                                    )}
                                                </Alert>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default ApplicantDashboard;
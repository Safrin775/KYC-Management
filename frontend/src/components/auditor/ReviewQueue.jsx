import React, { useState, useEffect } from 'react';
import {
    Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,Button,Chip,TextField,Box,Typography,
    CircularProgress,Alert,IconButton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../../services/api';


const ReviewQueue = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/kyc/auditor/pending/');
            if (response.data.success) {
                setApplications(response.data.applications);
                setFilteredApps(response.data.applications);
            }
        } catch (err) {
            setError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            setFilteredApps(
                applications.filter(app =>
                    app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.status_filter.includes(searchTerm)
                )
            );
        } else {
            setFilteredApps(applications);
        }
    }, [searchTerm, applications]);

    const getScoreBadge = (score) => {
        const percentage = (score * 100).toFixed(1);
        if (score >= 0.7) {
            return <Chip label={`${percentage}%`} color="success" size="small" />;
        } else if (score >= 0.2) {
            return <Chip label={`${percentage}%`} color="warning" size="small" />;
        } else {
            return <Chip label={`${percentage}%`} color="error" size="small" />;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // if (selectedApp) {
    //     return (
    //         <ApplicationDetail
    //             applicationId={selectedApp}
    //             onBack={() => {
    //                 setSelectedApp(null);
    //                 fetchApplications();
    //             }}
    //         />
    //     );
    // }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                    Pending KYC Applications ({filteredApps.length})
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search by name or status"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <IconButton onClick={fetchApplications}>
                        <RefreshIcon />
                    </IconButton>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell><strong>Applicant Name</strong></TableCell>
                            <TableCell><strong>Submitted At</strong></TableCell>
                            <TableCell><strong>Face Match Score</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredApps.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell>{app.full_name}</TableCell>
                                <TableCell>
                                    {new Date(app.submitted_at).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {app.face_match_score ? 
                                        getScoreBadge(app.face_match_score) : 
                                        <Chip label="Skipped" color="warning" size="small" />
                                    }
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => setSelectedApp(app.id)}
                                    >
                                        Review
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {filteredApps.length === 0 && !loading && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No pending KYC applications at this time.
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default ReviewQueue;
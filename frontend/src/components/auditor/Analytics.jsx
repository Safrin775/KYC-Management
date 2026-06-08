import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Grid, Typography, CircularProgress, Alert, Card, CardContent,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Button, LinearProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../../services/api';

const AnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAnalytics = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/kyc/auditor/analytics/');
            if (res.data) setData(res.data);
        } catch (err) {
            setError('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) return <CircularProgress sx={{ m: 4 }} />;
    if (error) return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
    if (!data) return null;

    // Calculate average score
    let totalScoreSum = 0, totalScoreCount = 0;
    data.score_distribution.forEach(bucket => {
        const [low, high] = bucket.range.split('-').map(Number);
        const mid = (low + high) / 2;
        totalScoreSum += mid * bucket.count;
        totalScoreCount += bucket.count;
    });
    const avgMatchScore = totalScoreCount > 0 ? (totalScoreSum / totalScoreCount).toFixed(2) : 'N/A';

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">Analytics Dashboard</Typography>
                <Button startIcon={<RefreshIcon />} onClick={fetchAnalytics} size="small">
                    Refresh
                </Button>
            </Box>

            <Grid container spacing={2}>  {/* reduced spacing from 3 to 2 */}
                {/* Approval Rate Card */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Approval Rate
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">
                                {data.approval_rate}%
                            </Typography>
                            <LinearProgress 
                                variant="determinate" 
                                value={data.approval_rate} 
                                sx={{ mt: 1, height: 6, borderRadius: 3 }}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Total Applications */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Total Applications
                            </Typography>
                            <Typography variant="h5" fontWeight="bold">
                                {data.total_applications}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Approved */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#e8f5e9' }}>
                        <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Approved
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="success.main">
                                {data.approved}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Rejected */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ bgcolor: '#ffebee' }}>
                        <CardContent sx={{ py: 1.5 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Rejected
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="error.main">
                                {data.rejected}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Additional cards if data has pending/resubmit */}
                {data.pending !== undefined && (
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: '#fff3e0' }}>
                            <CardContent sx={{ py: 1.5 }}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Pending
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="warning.main">
                                    {data.pending}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {data.resubmit !== undefined && (
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ bgcolor: '#e3f2fd' }}>
                            <CardContent sx={{ py: 1.5 }}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Resubmit Requested
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="info.main">
                                    {data.resubmit}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Score Distribution Table */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Face Match Score Distribution
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Average Match Score: {avgMatchScore === 'N/A' ? 'N/A' : `${avgMatchScore} / 1.0`}
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell><strong>Score Range</strong></TableCell>
                                            <TableCell align="right"><strong>Applications</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.score_distribution.map((bucket, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{bucket.range}</TableCell>
                                                <TableCell align="right">{bucket.count}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AnalyticsDashboard;
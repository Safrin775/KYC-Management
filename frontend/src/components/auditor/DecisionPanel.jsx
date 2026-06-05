import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import api from '../../services/api';

const DecisionPanel = ({ applicationId, canApprove, onDecisionComplete }) => {
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDecision = async (decision) => {
        if (decision !== 'approve' && !remarks.trim()) {
            setError('Remarks are required for this action');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post(`/kyc/auditor/${decision}/${applicationId}/`, { remarks });
            onDecisionComplete();
        } catch (err) {
            setError(err.response?.data?.error || 'Action failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Final Decision</Typography>
            <TextField
                fullWidth
                label="Remarks (required for Reject and Resubmit)"
                multiline
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter your comments..."
                sx={{ mb: 2 }}
            />
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleDecision('approve')}
                    disabled={loading || !canApprove}
                >
                    {loading ? <CircularProgress size={24} /> : 'Approve'}
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDecision('reject')}
                    disabled={loading}
                >
                    Reject
                </Button>
                <Button
                    variant="contained"
                    color="warning"
                    onClick={() => handleDecision('resubmit')}
                    disabled={loading}
                >
                    Request Resubmission
                </Button>
            </Box>
            {!canApprove && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    Approve is disabled until both applicant details and face verification are marked as verified.
                </Typography>
            )}
        </Paper>
    );
};

export default DecisionPanel;
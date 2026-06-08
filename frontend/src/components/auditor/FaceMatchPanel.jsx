import React, { useState } from 'react';
import {
    Paper, Typography, Grid, Card, CardMedia, Chip,
    LinearProgress, Box, Button, Alert, Stack,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://localhost:8000${path}`;
};

const FaceMatchPanel = ({ application, onManualVerify, manualVerified }) => {
    const [dialogOpen, setDialogOpen] = useState(false);

    const score = application.face_match_score;
    const distance = application.face_match_distance;
    const autoPassed = application.face_match_passed;  
    const isSkipped = application.face_match_skipped;   
    const percent = score ? (score * 100).toFixed(1) : 0;

    let badge = null;
    let message = '';
    let barColor = '#e0e0e0';
    let showScore = false;

    if (isSkipped) {
        badge = { label: 'MANUAL REVIEW', color: 'warning' };
        message = 'Face verification was skipped by applicant. Please manually verify the ID and selfie.';
    } else if (autoPassed) {
        badge = { label: 'PASS', color: 'success' };
        message = 'Automatic verification passed (based on applicant submission). You may still manually confirm below.';
        barColor = '#4caf50';
        showScore = true;
    } else if (score !== null) {
        showScore = true;
        if (score >= 0.7) {
            badge = { label: 'PASS', color: 'success' };
            message = 'Automatic verification passed.';
            barColor = '#4caf50';
        } else if (score >= 0.4) {
            badge = { label: 'BORDERLINE', color: 'warning' };
            message = 'Borderline match. Please manually compare the images.';
            barColor = '#ff9800';
        } else {
            badge = { label: 'FAIL', color: 'error' };
            message = 'Automatic verification failed. Please manually confirm the identity.';
            barColor = '#f44336';
        }
    } else {
        badge = { label: 'NO DATA', color: 'default' };
        message = 'No face verification data available. Please manually verify.';
    }

    const handleConfirmClick = () => {
        setDialogOpen(true);
    };

    const handleConfirm = () => {
        setDialogOpen(false);
        onManualVerify();
    };

    const handleCancel = () => {
        setDialogOpen(false);
    };

    return (
        <Paper sx={{ p: 3, mb: 3, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Identity Verification</Typography>
                {manualVerified && (
                    <Chip
                        icon={<CheckCircleIcon />}
                        label="Face Verified"
                        color="success"
                        variant="outlined"
                    />
                )}
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>ID Document</Typography>
                    <Card>
                        <CardMedia
                            component="img"
                            image={getImageUrl(application.id_document_url)}
                            alt="ID Document"
                            sx={{ height: 250, objectFit: 'contain' }}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}
                        />
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>Selfie</Typography>
                    <Card>
                        <CardMedia
                            component="img"
                            image={getImageUrl(application.selfie_url)}
                            alt="Selfie"
                            sx={{ height: 250, objectFit: 'cover' }}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}
                        />
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                {!isSkipped && (showScore || autoPassed) ? (
                    <>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="body2">Automated Match Score</Typography>
                            <Chip
                                label={`${badge.label}${showScore && score ? ` (${percent}%)` : ''}`}
                                color={badge.color}
                                size="small"
                            />
                        </Stack>
                        {showScore && score && (
                            <>
                                <LinearProgress
                                    variant="determinate"
                                    value={percent}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        mb: 1,
                                        bgcolor: 'background.paper',
                                        '& .MuiLinearProgress-bar': { bgcolor: barColor }
                                    }}
                                />
                                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Euclidean distance: {distance ? distance.toFixed(4) : 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Threshold: 0.6
                                    </Typography>
                                </Stack>
                            </>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                            {message}
                        </Typography>
                    </>
                ) : (
                    <Typography variant="body2" gutterBottom>
                        Face verification was not performed automatically. Please manually verify that the ID and selfie belong to the same person.
                    </Typography>
                )}

                {!manualVerified && (!autoPassed || isSkipped) && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmClick}
                        sx={{ mt: 2 }}
                    >
                        Confirm ID and Selfie Belong to Same Person
                    </Button>
                )}

                {manualVerified && (
                    <Alert icon={<CheckCircleIcon fontSize="inherit" />} severity="success" sx={{ mt: 2 }}>
                        Manual verification confirmed. 
                    </Alert>
                )}
            </Box>

            <Dialog open={dialogOpen} onClose={handleCancel}>
                <DialogTitle>Confirm Manual Verification</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to verify that identity?
                        
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} color="primary" variant="contained" autoFocus>
                        Yes, Verify
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default FaceMatchPanel;
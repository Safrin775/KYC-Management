import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Card,
    CardMedia,
    Grid,
    Dialog,
    DialogTitle,
    DialogActions
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { useKYC } from '../../context/KYCContext';
import api from '../../services/api';

const FaceMatch = ({ onNext, onBack }) => {
    const { kycData, updateKYCData } = useKYC();
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [skipDialogOpen, setSkipDialogOpen] = useState(false);

    const verifyFace = async () => {
        setProcessing(true);
        setError('');
        setResult(null);
        
        try {
            const formData = new FormData();
            formData.append('id_document', kycData.id_document);
            formData.append('selfie', kycData.selfie);
            
            const response = await api.post('/kyc/verify-face/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            if (response.data.success) {
                const passed = response.data.passed;
                const score = response.data.score;
                const message = response.data.message;
                
                updateKYCData('face_match_passed', passed);
                updateKYCData('face_match_score', score);
                updateKYCData('face_match_skipped', false);  
                updateKYCData('face_match_message', message);
                
                setResult({
                    passed: passed,
                    message: message,
                    score: score
                });
                
                if (passed) {
                    setTimeout(() => onNext(), 2000);
                }
            }
        } catch (err) {
            console.error('Face match error:', err);
            setError(err.response?.data?.message || 'Face verification failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleSkip = () => {
       
        updateKYCData('face_match_passed', false);
        updateKYCData('face_match_score', 0);
        updateKYCData('face_match_skipped', true);
        updateKYCData('face_match_message', 'Skipped by user');
        
        setSkipDialogOpen(false);
        onNext();
    };

    const idImageUrl = kycData.id_document_preview;
    const selfieImageUrl = kycData.selfie_preview;

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Step 4: Face Verification
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                We'll compare your ID document face with your selfie to verify your identity.
                <br />
                <Typography component="span" variant="caption" color="warning.main">
                    Note: You can skip this step, but your application will be marked for manual verification.
                </Typography>
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2}}>
                        <Typography variant="subtitle1" gutterBottom align="center">
                            Face from ID Document
                        </Typography>
                        <Card>
                            <CardMedia
                                component="img"
                                image={idImageUrl}
                                alt="ID Document"
                                sx={{ height: 250, objectFit: 'contain' }}
                            />
                        </Card>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2}}>
                        <Typography variant="subtitle1" gutterBottom align="center">
                            Your Selfie
                        </Typography>
                        <Card>
                            <CardMedia
                                component="img"
                                image={selfieImageUrl}
                                alt="Selfie"
                                sx={{ height: 250, objectFit: 'cover' }}
                            />
                        </Card>
                    </Paper>
                </Grid>
            </Grid>

            {/* Action Buttons */}
            {!result && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 4 }}>
                    <Button
                        variant="contained"
                        onClick={verifyFace}
                        disabled={processing}
                        size="large"
                    >
                        {processing ? <CircularProgress size={24} /> : 'Verify My Face'}
                    </Button>
                    
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => setSkipDialogOpen(true)}
                        disabled={processing}
                        size="large"
                        startIcon={<SkipNextIcon />}
                    >
                        Skip for Now
                    </Button>
                </Box>
            )}

            {/* Result Display */}
            {result && (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 3, 
                        mt: 3, 
                        bgcolor: result.passed ? '#e8f5e9' : '#ffebee',
                        textAlign: 'center'
                    }}
                >
                    {result.passed ? (
                        <CheckCircleIcon sx={{ fontSize: 60, color: '#4caf50' }} />
                    ) : (
                        <CancelIcon sx={{ fontSize: 60, color: '#f44336' }} />
                    )}
                    
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        {result.passed ? 'Verification Passed!' : 'Verification Failed!'}
                    </Typography>
                    
                    <Typography variant="body1" sx={{ my: 2 }}>
                        {result.message}
                    </Typography>

                    {result.passed && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            ✓ Face verified! Redirecting to submission...
                        </Alert>
                    )}

                    {!result.passed && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            You can either try again or skip this step. Your application will be marked for manual review.
                            <Box sx={{ mt: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    color="warning"
                                    onClick={() => {
                                        updateKYCData('face_match_passed', false);
                                        updateKYCData('face_match_score', 0);
                                        updateKYCData('face_match_skipped', true);
                                        onNext();
                                    }}
                                >
                                    Skip & Continue
                                </Button>
                            </Box>
                        </Alert>
                    )}
                </Paper>
            )}

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button variant="outlined" onClick={onBack}>
                    ← Back
                </Button>
                {result && !result.passed && (
                    <Button
                        variant="contained"
                        onClick={verifyFace}
                        disabled={processing}
                    >
                        Try Again
                    </Button>
                )}
            </Box>

            <Dialog open={skipDialogOpen} onClose={() => setSkipDialogOpen(false)}>
                <DialogTitle>
                    Skip Face Verification?
                </DialogTitle>
                
                <DialogActions>
                    <Button onClick={() => setSkipDialogOpen(false)} color="primary">
                        Go Back
                    </Button>
                    <Button onClick={handleSkip} color="warning" variant="contained">
                        Yes, Skip Verification
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FaceMatch;
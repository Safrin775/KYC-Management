import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Card,
    CardMedia,
    Grid
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useKYC } from '../../context/KYCContext';
import api from '../../services/api';

const FaceMatch = ({ onNext, onBack }) => {
    const { kycData, updateKYCData, loading } = useKYC();
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    
    const idImageRef = useRef(null);
    const selfieImageRef = useRef(null);

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
                updateKYCData('face_match_message', message);
                
                setResult({
                    passed: passed,
                    message: message,
                    score: score
                });
                
                if (passed) {
                    setTimeout(() => onNext(), 2000);
                }
            } else {
                setError(response.data.message || 'Verification failed');
            }
        } catch (err) {
            console.error('Face match error:', err);
            setError(err.response?.data?.message || 'Face verification failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Step 4: Face Verification
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                We'll compare your ID document face with your selfie to verify your identity.
            </Typography>

            {/* Hidden image references for processing */}
            <img 
                ref={idImageRef}
                src={kycData.id_document_preview}
                alt="ID Document"
                style={{ display: 'none' }}
            />
            <img 
                ref={selfieImageRef}
                src={kycData.selfie_preview}
                alt="Selfie"
                style={{ display: 'none' }}
            />

            {/* Image Display */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="subtitle1" gutterBottom align="center">
                            Face from ID Document
                        </Typography>
                        <Card>
                            <CardMedia
                                component="img"
                                image={kycData.id_document_preview}
                                alt="ID Document"
                                sx={{ height: 250, objectFit: 'contain' }}
                            />
                        </Card>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <Typography variant="subtitle1" gutterBottom align="center">
                            Your Selfie
                        </Typography>
                        <Card>
                            <CardMedia
                                component="img"
                                image={kycData.selfie_preview}
                                alt="Selfie"
                                sx={{ height: 250, objectFit: 'cover' }}
                            />
                        </Card>
                    </Paper>
                </Grid>
            </Grid>

            {/* Verify Button */}
            {!result && (
                <Box sx={{ textAlign: 'center', my: 4 }}>
                    <Button
                        variant="contained"
                        onClick={verifyFace}
                        disabled={processing}
                        size="large"
                    >
                        {processing ? <CircularProgress size={24} /> : 'Verify My Face'}
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

                    {result.score && (
                        <Typography variant="body2" color="text.secondary">
                            Confidence Score: {(result.score * 100).toFixed(1)}%
                        </Typography>
                    )}

                    {result.passed && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                            ✓ Face verified! Redirecting to submission...
                        </Alert>
                    )}

                    {!result.passed && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Please retake your selfie with better lighting and try again.
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
        </Box>
    );
};

export default FaceMatch;
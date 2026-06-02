import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    LinearProgress,
    Alert,
    Card,
    CardMedia,
    Grid,
    Chip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useKYC } from '../../context/KYCContext';
import * as faceapi from 'face-api.js';

const FaceMatch = ({ onNext, onBack }) => {
    const { kycData, updateKYCData, loading } = useKYC();
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [loadingModels, setLoadingModels] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [matchResult, setMatchResult] = useState(null);
    const [error, setError] = useState('');
    
    const idImageRef = useRef();
    const selfieImageRef = useRef();

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models';
                await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
                await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                setModelsLoaded(true);
                setLoadingModels(false);
            }
            catch (err) {
                console.error('Error loading face-api models:', err);
                setError('Failed to load face recognition models. Please try again later.');
                setLoadingModels(false);
            }
        };
        loadModels();
    }, []);

    const performFaceMatch = async () => {
        if (!modelsLoaded) {
            setError('Models not loaded yet. Please wait.');
            return;
        }
        setProcessing(true);
        setError('');
        setMatchResult(null);

        try{
            const idImg = idImageRef.current;
            const selfieImg = selfieImageRef.current;
            if (!idImg || !selfieImg) {
                throw new Error('Images not loaded');
            }
            const idDetection = await faceapi
                .detectSingleFace(idImg)
                .withFaceLandmarks()
                .withFaceDescriptor();
            const selfieDetection = await faceapi
                .detectSingleFace(selfieImg)
                .withFaceLandmarks()
                .withFaceDescriptor();
            if (!idDetection ){
            throw new Error('No face detected in ID document. Please upload a clearer image.');
            }
            if (!selfieDetection) {
            throw new Error('No face detected in selfie. Please capture a clearer image.');
            }
            const distance = faceapi.euclideanDistance(idDetection.descriptor, selfieDetection.descriptor);
            const threshold = 0.6;
            const passed = distance < threshold;
            const confidence = Math.max(0, Math.min(100, ((1 - distance) * 100).toFixed(2)));

            const result = {
                passed: passed,
                score: confidence,
                distance: distance.toFixed(4),
                threshold: threshold,
                message: passed 
                    ? `Face verified! (${confidence}% match)`
                    : `Face mismatch! (${confidence}% match). Please ensure both photos are of the same person.`
            };
            setMatchResult(result);

            updateKYCData('face_match_score', parseFloat(confidence) / 100);
            updateKYCData('face_match_passed', passed);
            updateKYCData('face_match_message', result.message);
        } catch (err) {
            console.error('Face match error:', err);
            setError(err.message || 'Face matching failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };
    const handleProceed = () => {
        if (matchResult && matchResult.passed) {
            onNext();
        }
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
            </Typography>

            {loadingModels && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>
                        Loading face detection models...
                    </Typography>
                </Box>
            )}
            {!loadingModels && (
                <>
                    {/* Hidden image elements for face detection */}
                    <img 
                        ref={idImageRef}
                        src={idImageUrl}
                        crossOrigin="anonymous"
                        style={{ display: 'none' }}
                        onLoad={() => console.log('ID image loaded')}
                    />
                    <img 
                        ref={selfieImageRef}
                        src={selfieImageUrl}
                        crossOrigin="anonymous"
                        style={{ display: 'none' }}
                        onLoad={() => console.log('Selfie image loaded')}
                    />
                    <Grid container spacing={3}>
                        {/* ID Document Face */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
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
                            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                                <Typography variant="subtitle1" gutterBottom align="center">
                                    Live Selfie
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

                    {!matchResult && (
                        <Box sx={{ textAlign: 'center', my: 4 }}>
                            <Button
                                variant="contained"
                                onClick={performFaceMatch}
                                disabled={processing}
                                size="large"
                            >
                                {processing ? <CircularProgress size={24} /> : 'Verify Faces'}
                            </Button>
                        </Box>
                    )}
                    {matchResult && (
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 3, 
                                mt: 3, 
                                bgcolor: matchResult.passed ? '#e8f5e9' : '#ffebee',
                                textAlign: 'center'
                            }}
                        >
                            {matchResult.passed ? (
                                <CheckCircleIcon sx={{ fontSize: 60, color: '#4caf50' }} />
                            ) : (
                                <CancelIcon sx={{ fontSize: 60, color: '#f44336' }} />
                            )}
                            
                            <Typography variant="h6" sx={{ mt: 2 }}>
                                {matchResult.passed ? 'Verification Passed! ✓' : 'Verification Failed! ✗'}
                            </Typography>
                            <Typography variant="body1" sx={{ my: 2 }}>
                                {matchResult.message}
                            </Typography>
                            
                            <Box sx={{ width: '100%', my: 2 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Match Confidence: {matchResult.score}%
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={matchResult.score} 
                                    sx={{ 
                                        height: 10, 
                                        borderRadius: 5,
                                        bgcolor: '#e0e0e0',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: matchResult.passed ? '#4caf50' : '#f44336'
                                        }
                                    }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                    Threshold: {matchResult.threshold * 100}% | 
                                    Distance: {matchResult.distance}
                                </Typography>
                            </Box>

                        </Paper>
                    )}
                     {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button variant="outlined" onClick={onBack}>
                    ← Back
                </Button>
                <Button
                    variant="contained"
                    onClick={handleProceed}
                    disabled={!matchResult || !matchResult.passed || loading}
                >
                    Next →
                </Button>
            </Box>
        </Box>
    );
};

export default FaceMatch;

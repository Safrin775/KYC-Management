import React, { useRef, useState, useCallback } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Card,
    CardMedia,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ReplayIcon from '@mui/icons-material/Replay';
import Webcam from 'react-webcam';
import { useKYC } from '../../context/KYCContext';

const SelfieCapture = ({ onNext, onBack }) => {
    const { kycData, updateKYCData } = useKYC();
    const webcamRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(kycData.selfie_preview || null);
    const [showWebcam, setShowWebcam] = useState(!kycData.selfie_preview);


    const captureSelfie = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
                updateKYCData('selfie', file);
                updateKYCData('selfie_preview', imageSrc);
                setCapturedImage(imageSrc);
                setShowWebcam(false);
            });
    }, [webcamRef, updateKYCData]);

    const retakeSelfie = () => {
        setCapturedImage(null);
        setShowWebcam(true);
        updateKYCData('selfie', null);
        updateKYCData('selfie_preview', null);
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Step 3: Capture Live Selfie
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Take a clear selfie for face verification.
                <br />
                <strong>Instructions:</strong> Look straight at the camera, ensure good lighting.
            </Typography>

            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                {showWebcam ? (
                    <Box sx={{ position: 'relative' }}>
                        <Webcam
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                width: 480,
                                height: 480,
                                facingMode: 'user'
                            }}
                            style={{
                                width: '100%',
                                maxWidth: 480,
                                margin: '0 auto',
                                display: 'block',
                                borderRadius: 8
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 200,
                                height: 200,
                                border: '2px solid #4caf50',
                                borderRadius: '50%',
                                pointerEvents: 'none'
                            }}
                        />
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<CameraAltIcon />}
                                onClick={captureSelfie}
                                size="large"
                            >
                                Capture Selfie
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Card sx={{ maxWidth: 400, mx: 'auto' }}>
                        <CardMedia
                            component="img"
                            height="400"
                            image={capturedImage}
                            alt="Selfie"
                            sx={{ objectFit: 'cover' }}
                        />
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ReplayIcon />}
                                onClick={retakeSelfie}
                            >
                                Retake Selfie
                            </Button>
                        </Box>
                    </Card>
                )}

            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button variant="outlined" onClick={onBack}>
                    ← Back
                </Button>
                <Button
                    variant="contained"
                    onClick={onNext}
                    disabled={!kycData.selfie}
                >
                    Next →
                </Button>
            </Box>
        </Box>
    );
};

export default SelfieCapture;
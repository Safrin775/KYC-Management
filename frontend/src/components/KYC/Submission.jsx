import React, { useState } from 'react';
import { Box,Button,Typography,Paper,Alert,Chip,CircularProgress,Card,CardContent,Grid} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useKYC } from '../../context/KYCContext';
import api from '../../services/api';

const Submission = () => {
    const navigate = useNavigate();
    const { kycData } = useKYC();
    const [submitted, setSubmitted] = useState(false);
    const [applicationId, setApplicationId] = useState(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');

        const formData = new FormData();
        formData.append('full_name', kycData.full_name);
        formData.append('dob', kycData.dob);
        formData.append('mobile', kycData.mobile);
        formData.append('pan_last4', kycData.pan_last4);
        formData.append('id_document', kycData.id_document);
        formData.append('selfie', kycData.selfie);
        formData.append('face_match_passed', kycData.face_match_passed);
        formData.append('face_match_skipped', kycData.face_match_skipped || false);
        formData.append('face_match_score', kycData.face_match_score || 0);
        
        try {
            const response = await api.post('/kyc/submit/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (response.data.success) {
                setSubmitted(true);
                setApplicationId(response.data.application_id);
            } else {
                setError(response.data.error || 'Submission failed');
            }
        } catch (err) {
            console.error('Submit error:', err);
            setError(err.response?.data?.error || 'Submission failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit = () => {
        return kycData.face_match_passed || kycData.face_match_skipped;
    };

    if (!submitted) {
        return (
            <Box>
                <Typography variant="h5" gutterBottom>
                    Step 5: Submit Application
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Review your information before submitting for auditor review.
                </Typography>
                
                <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Application Summary
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Full Name</Typography>
                            <Typography variant="body1">{kycData.full_name}</Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                            <Typography variant="body1">{kycData.dob}</Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Mobile Number</Typography>
                            <Typography variant="body1">{kycData.mobile}</Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">PAN Last 4</Typography>
                            <Typography variant="body1">{kycData.pan_last4}</Typography>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">Face Verification</Typography>
                            {kycData.face_match_skipped ? (
                                <Chip 
                                    label="Skipped - Manual Review Required"
                                    color="warning"
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                />
                            ) : (
                                <Chip 
                                    label={kycData.face_match_passed ? 'Verified' : 'Not Verified'}
                                    color={kycData.face_match_passed ? 'success' : 'error'}
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                />
                            )}
                            {kycData.face_match_score > 0 && !kycData.face_match_skipped && (
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Confidence Score: {(kycData.face_match_score * 100).toFixed(1)}%
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                </Paper>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography variant="subtitle2" gutterBottom>
                                ID Document
                            </Typography>
                            <img 
                                src={kycData.id_document_preview}
                                alt="ID Document"
                                style={{ width: '100%', maxHeight: 150, objectFit: 'contain' }}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Selfie
                            </Typography>
                            <img 
                                src={kycData.selfie_preview}
                                alt="Selfie"
                                style={{ width: '100%', maxHeight: 150, objectFit: 'cover' }}
                            />
                        </Paper>
                    </Grid>
                </Grid>
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Alert severity="info" sx={{ mb: 3 }}>
                    Your application will be reviewed by an auditor. You'll be notified once the review is complete.
                </Alert>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                        variant="outlined" 
                        onClick={() => navigate('/applicant/dashboard')}
                    >Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !canSubmit()}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Submit Application'}
                    </Button>
                </Box>
            </Box>
        );
    }
    return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50' }} />
            
            <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
                Application Submitted!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
                Your KYC application has been successfully submitted.
            </Typography>
            
            <Card sx={{ maxWidth: 400, mx: 'auto', my: 3, bgcolor: '#e8f5e9' }}>
                <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Application ID
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                        #{applicationId}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Submitted on: {new Date().toLocaleString()}
                    </Typography>
                </CardContent>
            </Card>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    onClick={() => navigate('/applicant/dashboard')}
                >Go to Dashboard
                </Button>
            </Box>
        </Box>
    );
};
export default Submission;
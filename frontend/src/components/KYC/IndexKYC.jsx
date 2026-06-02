import React, { useState } from 'react';
import {
    Container,
    Box,
    Stepper,
    Step,
    StepLabel,
    Paper,
    Alert,
    Snackbar
} from '@mui/material';
import { useAuth } from '../../context/authContext';
import { KYCProvider, useKYC } from '../../context/KYCContext';
import PersonalInfo from './PersonalInfo';
import DocumentUpload from './DocumentUpload';
import SelfieCapture from './SelfieCapture';

const steps = [
    'Personal Information',
    'Upload ID',
    'Capture Selfie',
    'Face Verification',
    'Submission'
];


const KYCStepperContent = () => {
    const { currentStep, setCurrentStep, submitKYC, loading } = useKYC();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleNext = () => {
        setCurrentStep(currentStep + 1);
    };
     const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };


    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return <PersonalInfo onNext={handleNext} />;
            case 1:
                return <DocumentUpload onNext={handleNext} onBack={handleBack} />;
            case 2:
                return <SelfieCapture onNext={handleNext} onBack={handleBack} />;
            default:
                return 'Unknown step';
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ my: 4 }}>
                <Paper sx={{ p: 3 }}>
                    <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {getStepContent(currentStep)}
                </Paper>
            </Box>

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            ><Alert severity="error" onClose={() => setError('')}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

const IndexKYC = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <div>Please login to access KYC form</div>;
    }

    return (
        <KYCProvider>
            <KYCStepperContent />
        </KYCProvider>
    );
};
export default IndexKYC;
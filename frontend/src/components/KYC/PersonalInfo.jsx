import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
} from '@mui/material';
import { useKYC } from '../../context/KYCContext';

const PersonalInfo = ({ onNext }) => {
    const { kycData, updateKYCData } = useKYC();
    const [errors, setErrors] = useState({});

    // Validate age (18+)
    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!kycData.full_name) {
            newErrors.full_name = 'Full name is required';
        } else if (kycData.full_name.length < 3) {
            newErrors.full_name = 'Name must be at least 3 characters';
        }
        
        if (!kycData.dob) {
            newErrors.dob = 'Date of birth is required';
        } else {
            const age = calculateAge(kycData.dob);
            if (age < 18) {
                newErrors.dob = 'You must be 18 years or older';
            }
        }
        
        if (!kycData.mobile) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(kycData.mobile)) {
            newErrors.mobile = 'Mobile number must be 10 digits';
        }
        
        if (!kycData.pan_last4) {
            newErrors.pan_last4 = 'PAN last 4 digits are required';
        } else if (!/^\d{4}$/.test(kycData.pan_last4)) {
            newErrors.pan_last4 = 'Must be exactly 4 digits';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateForm()) {
            onNext();
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Step 1: Personal Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Please provide your basic details for KYC verification.
            </Typography>

            <Paper elevation={0} sx={{ p: 3 }}>
                <TextField
                    fullWidth
                    label="Full Name"
                    value={kycData.full_name}
                    onChange={(e) => updateKYCData('full_name', e.target.value)}
                    error={!!errors.full_name}
                    helperText={errors.full_name}
                    margin="normal"
                    required
                />

                <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={kycData.dob}
                    onChange={(e) => updateKYCData('dob', e.target.value)}
                    error={!!errors.dob}
                    helperText={errors.dob || 'YYYY-MM-DD (You must be 18+)'}
                    margin="normal"
                    required
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    fullWidth
                    label="Mobile Number"
                    value={kycData.mobile}
                    onChange={(e) => updateKYCData('mobile', e.target.value)}
                    error={!!errors.mobile}
                    helperText={errors.mobile || '10 digit mobile number'}
                    margin="normal"
                    required
                />

                <TextField
                    fullWidth
                    label="PAN Last 4 Digits"
                    value={kycData.pan_last4}
                    onChange={(e) => updateKYCData('pan_last4', e.target.value)}
                    error={!!errors.pan_last4}
                    helperText={errors.pan_last4 || 'Last 4 digits of your PAN card'}
                    margin="normal"
                    required
                />
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                    variant="contained"
                    onClick={handleNext}
                    size="large"
                >
                    Next → 
                </Button>
            </Box>
        </Box>
    );
};

export default PersonalInfo;
import React from 'react';
import { Paper, Typography, Box, Chip, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const ApplicationInfo = ({ application, onVerify, isVerified }) => {
    return (
        <Paper sx={{ p: 3, mb: 3, width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Applicant Details</Typography>
                {isVerified && (
                    <Chip
                        icon={<CheckCircleIcon />}
                        label="Details Verified"
                        color="success"
                        variant="outlined"
                    />
                )}
            </Box>

            {/* Use flexbox for equal spacing */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1, minWidth: '120px' }}>
                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1">{application.full_name}</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: '120px' }}>
                    <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1">{application.dob}</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: '120px' }}>
                    <Typography variant="body2" color="text.secondary">Mobile Number</Typography>
                    <Typography variant="body1">{application.mobile}</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: '120px' }}>
                    <Typography variant="body2" color="text.secondary">PAN Last 4</Typography>
                    <Typography variant="body1">{application.pan_last4}</Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: '150px' }}>
                    <Typography variant="body2" color="text.secondary">Submitted At</Typography>
                    <Typography variant="body2">{new Date(application.submitted_at).toLocaleString()}</Typography>
                </Box>
            </Box>

            {!isVerified && (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onVerify}
                    sx={{ mt: 2 }}
                >
                    Mark Details as Verified
                </Button>
            )}
        </Paper>
    );
};

export default ApplicationInfo;
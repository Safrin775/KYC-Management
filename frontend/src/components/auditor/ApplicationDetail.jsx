import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../../services/api';
import ApplicationInfo from './ApplicationInfo';
import FaceMatchPanel from './FaceMatchPanel';
import DecisionPanel from './DecisionPanel';

const ApplicationDetail = ({ applicationId, onBack }) => {
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [detailsVerified, setDetailsVerified] = useState(false);
    const [faceManuallyVerified, setFaceManuallyVerified] = useState(false);

    useEffect(() => {
        fetchApplicationDetail();
    }, [applicationId]);

    const fetchApplicationDetail = async () => {
        try {
            const res = await api.get(`/kyc/auditor/application/${applicationId}/`);
            if (res.data.success) {
                setApplication(res.data.application);
            }
        } catch (err) {
            setError('Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !application) {
        return <Alert severity="error" sx={{ m: 2 }}>{error || 'Application not found'}</Alert>;
    }

    const faceMatchAutoPassed = application.face_match_passed === true;
    const faceMatchSkipped = !application.face_match_score && !application.face_match_passed;

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={onBack}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ ml: 1 }}>
                    <strong>Back to Queue</strong>
                </Box>
            </Box>

            <ApplicationInfo
                application={application}
                onVerify={() => setDetailsVerified(true)}
                isVerified={detailsVerified}
            />

            <FaceMatchPanel
                application={application}
                onManualVerify={() => setFaceManuallyVerified(true)}
                manualVerified={faceManuallyVerified}
            />

            <DecisionPanel
                applicationId={applicationId}
                canApprove={detailsVerified && (faceMatchAutoPassed || faceManuallyVerified)}
                onDecisionComplete={onBack}
            />
        </Box>
    );
};

export default ApplicationDetail;
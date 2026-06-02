import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const KYCContext = createContext();

export const useKYC = () => useContext(KYCContext);

export const KYCProvider = ({ children }) => {
    const [kycData, setKycData] = useState({
        full_name: '',
        dob: '',
        mobile: '',
        pan_last4: '',
        
        id_document: null,
        id_document_preview: null,
        
        selfie: null,
        selfie_preview: null,
        
        face_match_score: null,
        face_match_passed: false,
        face_match_message: '',
        
        application_id: null,
        status: 'draft'
    });

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const updateKYCData = (field, value) => {
        setKycData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const submitKYC = async () => {
        setLoading(true);
        
        const formData = new FormData();
        formData.append('full_name', kycData.full_name);
        formData.append('dob', kycData.dob);
        formData.append('mobile', kycData.mobile);
        formData.append('pan_last4', kycData.pan_last4);
        
        if (kycData.id_document) {
            formData.append('id_document', kycData.id_document);
        }
        if (kycData.selfie) {
            formData.append('selfie', kycData.selfie);
        }
        formData.append('face_match_score', kycData.face_match_score);
        formData.append('face_match_passed', kycData.face_match_passed);
        formData.append('face_match_message', kycData.face_match_message);

        try {
            const response = await api.post('/kyc/submit/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            setKycData(prev => ({
                ...prev,
                application_id: response.data.application_id,
                status: response.data.status
            }));
            
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Submit error:', error);
            return { 
                success: false, 
                error: error.response?.data?.errors || 'Submission failed'
            };
        } finally {
            setLoading(false);
        }
    };

    const value = {
        kycData,
        currentStep,
        setCurrentStep,
        updateKYCData,
        submitKYC,
        loading
    };

    return (
        <KYCContext.Provider value={value}>
            {children}
        </KYCContext.Provider>
    );
};
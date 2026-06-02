import React, { useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Card,
    CardMedia,
    IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useKYC } from '../../context/KYCContext';

const DocumentUpload = ({ onNext, onBack }) => {
    const { kycData, updateKYCData } = useKYC();
    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!allowedTypes.includes(file.type)) {
                alert('Please upload JPG or PNG file only');
                return;
            }
            
            
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            
            
            const previewUrl = URL.createObjectURL(file);
            
            updateKYCData('id_document', file);
            updateKYCData('id_document_preview', previewUrl);
        }
    };

    const handleRemoveFile = () => {
        updateKYCData('id_document', null);
        updateKYCData('id_document_preview', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Step 2: Upload ID Document
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Upload a clear image of your government-issued ID.
                <br />
                <strong>Accepted:</strong> Aadhar Card, PAN Card
            </Typography>

            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5' }}>
                {!kycData.id_document_preview ? (
                    <Box
                        sx={{
                            border: '2px dashed #ccc',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="body1" gutterBottom>
                            Click to upload or drag and drop
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Supports: JPG, PNG (Max 5MB)
                        </Typography>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept="image/jpeg,image/png,image/jpg"
                            style={{ display: 'none' }}
                        />
                    </Box>
                ) : (
                    <Card sx={{ maxWidth: 400, mx: 'auto' }}>
                        <CardMedia
                            component="img"
                            height="300"
                            image={kycData.id_document_preview}
                            alt="ID Document"
                            sx={{ objectFit: 'contain' }}
                        />
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                            <IconButton color="error" onClick={handleRemoveFile}>
                                <DeleteIcon />
                            </IconButton>
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
                    disabled={!kycData.id_document}
                >
                    Next →
                </Button>
            </Box>
        </Box>
    );
};

export default DocumentUpload;
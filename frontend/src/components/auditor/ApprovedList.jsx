import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Button, CircularProgress, Alert, Tooltip, Dialog,
    DialogTitle, DialogContent, IconButton, Chip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedIcon from '@mui/icons-material/Verified';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ApprovedList = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApp, setSelectedApp] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);

    useEffect(() => {
        fetchApproved();
    }, []);

    const fetchApproved = async () => {
        try {
            const res = await api.get('/kyc/auditor/approved/');
            if (res.data.success) setApplications(res.data.applications);
        } catch (err) {
            setError('Failed to load approved applications');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (appId) => {
        try {
            const res = await api.get(`/kyc/auditor/application/${appId}/`);
            if (res.data.success) {
                setSelectedApp(res.data.application);
                setOpenDetail(true);
            }
        } catch (err) {
            setError('Failed to load details');
        }
    };

    const downloadPDF = () => {
        if (!selectedApp) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;

        doc.setFontSize(16);
        doc.text(`Application #${selectedApp.id}`, margin, 20);
        doc.setFontSize(12);
        doc.setTextColor(0, 128, 0);
        doc.text('✓ VERIFIED', pageWidth - margin - 20, 20);
        doc.setTextColor(0, 0, 0);

        const tableData = [
            ['Full Name', selectedApp.full_name],
            ['Date of Birth', selectedApp.dob],
            ['Mobile Number', selectedApp.mobile],
            ['PAN Last 4', selectedApp.pan_last4],
            ['Approved By', selectedApp.reviewed_by_email || 'System'],
            ['Approved On', selectedApp.reviewed_at ? new Date(selectedApp.reviewed_at).toLocaleString() : 'Not recorded'],
            ['Face Match Score', selectedApp.face_match_passed ? `${(selectedApp.face_match_score * 100).toFixed(1)}%` : 'Manual Review'],
            ['Status', 'APPROVED']
        ];

        autoTable(doc, {
            body: tableData,
            startY: 35,
            theme: 'striped',
            styles: { fontSize: 11 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
            margin: { left: margin, right: margin }
        });

        const finalY = doc.lastAutoTable.finalY + 8;
        doc.setFontSize(9);
        doc.text('This document is digitally signed by the KYC System.', margin, finalY);
        doc.text(`Generated on ${new Date().toLocaleString()}`, margin, finalY + 6);

        doc.save(`KYC_Details_${selectedApp.id}.pdf`);
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h6" gutterBottom>Approved Applications ({applications.length})</Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: 'background.paper' }}>
                        <TableRow>
                            <TableCell><strong>Application ID</strong></TableCell>
                            <TableCell><strong>Applicant Name</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell>{app.id}</TableCell>
                                <TableCell>{app.full_name}</TableCell>
                                <TableCell>
                                    <Tooltip title="View Details">
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => handleViewDetails(app.id)}
                                        >
                                            View
                                        </Button>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {applications.length === 0 && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No approved applications yet.</Typography>
                </Paper>
            )}

            <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth>
                {selectedApp && (
                    <>
                        <DialogTitle>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Application #{selectedApp.id}</Typography>
                                <Box>
                                    <Button
                                        variant="outlined"
                                        startIcon={<DownloadIcon />}
                                        onClick={downloadPDF}
                                        sx={{ mr: 1 }}
                                    >
                                        PDF
                                    </Button>
                                    <IconButton onClick={() => setOpenDetail(false)}>
                                        <CloseIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Box sx={{ textAlign: 'right', mb: 2 }}>
                                <Chip
                                    icon={<VerifiedIcon />}
                                    label="VERIFIED"
                                    color="success"
                                    sx={{ fontSize: '1rem', p: 1 }}
                                />
                            </Box>

                            <Table size="small" sx={{ mb: 3 }}>
                                <TableBody>
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', border: 'none', width: '40%' }}>Full Name</TableCell>
                                        <TableCell sx={{ border: 'none' }}>{selectedApp.full_name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', border: 'none' }}>Date of Birth</TableCell>
                                        <TableCell sx={{ border: 'none' }}>{selectedApp.dob}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', border: 'none' }}>Mobile Number</TableCell>
                                        <TableCell sx={{ border: 'none' }}>{selectedApp.mobile}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', border: 'none' }}>PAN Last 4</TableCell>
                                        <TableCell sx={{ border: 'none' }}>{selectedApp.pan_last4}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', border: 'none' }}>Approved By</TableCell>
                                        <TableCell sx={{ border: 'none' }}>{selectedApp.reviewed_by_email || 'System'}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', border: 'none' }}>Approved On</TableCell>
                                        <TableCell sx={{ border: 'none' }}>
                                            {selectedApp.reviewed_at ? new Date(selectedApp.reviewed_at).toLocaleString() : 'Not recorded'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', border: 'none' }}>Face Match Score</TableCell>
                                        <TableCell sx={{ border: 'none' }}>
                                            {selectedApp.face_match_passed ? `${(selectedApp.face_match_score * 100).toFixed(1)}%` : 'Manual Review'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', border: 'none' }}>Status</TableCell>
                                        <TableCell sx={{ border: 'none' }}>
                                            <Chip label="APPROVED" color="success" size="small" />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>

                            <Typography variant="caption" display="block" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                                This document is digitally signed by the KYC System.
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                Generated on {new Date().toLocaleString()}
                            </Typography>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default ApprovedList;
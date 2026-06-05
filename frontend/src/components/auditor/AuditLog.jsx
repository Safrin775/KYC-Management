import React, { useState, useEffect } from 'react';
import {
    Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Typography,Chip,Box,
    Button,TextField,MenuItem,CircularProgress,Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../services/api';
import Papa from 'papaparse';

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ action: '', date_from: '', date_to: '' });

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let url = '/kyc/auditor/audit-log/';
            const params = new URLSearchParams();
            if (filter.action) params.append('action', filter.action);
            if (filter.date_from) params.append('date_from', filter.date_from);
            if (filter.date_to) params.append('date_to', filter.date_to);
            if (params.toString()) url += `?${params.toString()}`;
            
            const response = await api.get(url);
            if (response.data.success) {
                setLogs(response.data.logs);
            }
        } catch (err) {
            console.error('Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    const exportCSV = () => {
        const csvData = logs.map(log => ({
            'Application ID': log.application_id,
            'Applicant Name': log.applicant_name,
            'Auditor Email': log.auditor_email,
            'Action': log.action,
            'Remarks': log.remarks,
            'Timestamp': new Date(log.created_at).toLocaleString()
        }));
        
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_log_${new Date().toISOString().slice(0, 19)}.csv`;
        a.click();
    };

    const getActionChip = (action) => {
        const colors = {
            approved: 'success',
            rejected: 'error',
            resubmit: 'warning',
        };
        return <Chip label={action} color={colors[action] || 'default'} size="small" />;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6">
                    Audit Log ({logs.length} records)
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportCSV}
                    disabled={logs.length === 0}
                >
                    Export CSV
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    select
                    label="Action"
                    size="small"
                    value={filter.action}
                    onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                    sx={{ minWidth: 120 }}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="resubmit">Resubmit</MenuItem>
                    
                </TextField>
                
                <TextField
                    type="date"
                    label="From Date"
                    size="small"
                    value={filter.date_from}
                    onChange={(e) => setFilter({ ...filter, date_from: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                    type="date"
                    label="To Date"
                    size="small"
                    value={filter.date_to}
                    onChange={(e) => setFilter({ ...filter, date_to: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell><strong>Application ID</strong></TableCell>
                            <TableCell><strong>Applicant Name</strong></TableCell>
                            <TableCell><strong>Auditor</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                            <TableCell><strong>Remarks</strong></TableCell>
                            <TableCell><strong>Timestamp</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>#{log.application_id}</TableCell>
                                <TableCell>{log.applicant_name}</TableCell>
                                <TableCell>{log.auditor_email}</TableCell>
                                <TableCell>{getActionChip(log.action)}</TableCell>
                                <TableCell>{log.remarks || '-'}</TableCell>
                                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {logs.length === 0 && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">No audit logs found</Typography>
                </Paper>
            )}
        </Box>
    );
};

export default AuditLogViewer;
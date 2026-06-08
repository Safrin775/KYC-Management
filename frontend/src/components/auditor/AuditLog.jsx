import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, TextField, Button, MenuItem, Typography, CircularProgress, IconButton, TablePagination
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../../services/api';

const AuditLogViewer = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);         
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [filters, setFilters] = useState({ action: '', date_from: '', date_to: '' });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page + 1,               
                page_size: rowsPerPage,
                ...(filters.action && { action: filters.action }),
                ...(filters.date_from && { date_from: filters.date_from }),
                ...(filters.date_to && { date_to: filters.date_to }),
            });
            const response = await api.get(`/kyc/auditor/audit-log/?${params.toString()}`);
            if (response.data.success) {
                setLogs(response.data.logs);
                setTotalCount(response.data.count);
            }
        } catch (err) {
            console.error('Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, rowsPerPage, filters]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const exportCSV = () => {
        const headers = ['Application ID', 'Applicant Name', 'Auditor Email', 'Action', 'Remarks', 'Timestamp'];
        const rows = logs.map(log => [
            log.application_id,
            log.applicant_name,
            log.auditor_email,
            log.action,
            log.remarks || '',
            new Date(log.created_at).toLocaleString()
        ]);
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_log_page_${page + 1}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    select
                    label="Action"
                    size="small"
                    value={filters.action}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                    sx={{ minWidth: 120 }}
                >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                    <MenuItem value="resubmit">Resubmit</MenuItem>
                    <MenuItem value="viewed">Viewed</MenuItem>
                </TextField>
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                    From
                </Typography>
                <TextField
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                />
                <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                    To
                </Typography>
                <TextField
                    type="date"
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                />
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCSV}>
                    Export Current Page CSV
                </Button>
                <IconButton onClick={fetchLogs}><RefreshIcon /></IconButton>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'background.paper' }}>
                            <TableCell><strong>Application ID</strong></TableCell>
                            <TableCell><strong>Applicant</strong></TableCell>
                            <TableCell><strong>Action</strong></TableCell>
                            <TableCell><strong>Auditor</strong></TableCell>
                            <TableCell><strong>Remarks</strong></TableCell>
                            <TableCell><strong>Time</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map(log => (
                            <TableRow key={log.id}>
                                <TableCell>#{log.application_id}</TableCell>
                                <TableCell>{log.applicant_name}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={log.action}
                                        size="small"
                                        color={log.action === 'approved' ? 'success' : log.action === 'rejected' ? 'error' : 'warning'}
                                    />
                                </TableCell>
                                <TableCell>{log.auditor_email}</TableCell>
                                <TableCell>{log.remarks || '-'}</TableCell>
                                <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5,10, 20, 50]}
                labelRowsPerPage="Rows per page"
            />
        </Box>
    );
};

export default AuditLogViewer;
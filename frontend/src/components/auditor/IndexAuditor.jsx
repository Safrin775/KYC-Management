import React, { useState } from 'react';
import {
    Container,
    Box,
    Paper,
    Tabs,
    Tab,
    Typography,
    AppBar,
    Toolbar,
    Button,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import QueueIcon from '@mui/icons-material/Queue';
import HistoryIcon from '@mui/icons-material/History';
import { useAuth } from '../../context/AuthContext';
import ReviewQueue from './ReviewQueue';
import AuditLogViewer from './AuditLog';

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const AuditorDashboard = () => {
    const [tabValue, setTabValue] = useState(0);
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <AppBar position="sticky">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Auditor Dashboard
                    </Typography>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                        {user?.email}
                    </Typography>
                    <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl">
                <Paper sx={{ mt: 2 }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                        <Tab icon={<QueueIcon />} label="Review Queue" />
                        <Tab icon={<HistoryIcon />} label="Audit Log" />
                    </Tabs>
                </Paper>

                <TabPanel value={tabValue} index={0}>
                    <ReviewQueue />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <AuditLogViewer />
                </TabPanel>
            </Container>
        </Box>
    );
};

export default AuditorDashboard;
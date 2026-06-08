import React, { useState } from 'react';
import {Container,Box,Paper,Tabs,Tab,Typography,AppBar,Toolbar,Button,} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import QueueIcon from '@mui/icons-material/Queue';
import HistoryIcon from '@mui/icons-material/History';
import { useAuth } from '../../context/AuthContext';
import ReviewQueue from './ReviewQueue';
import AuditLogViewer from './AuditLog';
import ApprovedList from './ApprovedList';
import VerifiedIcon from '@mui/icons-material/Verified';
import { IconButton, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../../context/ThemeContext';
import AnalyticsDashboard from './Analytics';
import BarChartIcon from '@mui/icons-material/BarChart';

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

    const theme = useTheme();
    const { toggleTheme, mode } = useThemeMode();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <Box sx={{ bgcolor:"background.default", minHeight: '100vh' }}>
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
                    <IconButton onClick={toggleTheme} color="inherit">
                        {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl">
                <Paper sx={{ mt: 2 }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                        <Tab icon={<QueueIcon />} label="Review Queue" />
                        <Tab icon={<HistoryIcon />} label="Audit Log" />
                        <Tab icon={<VerifiedIcon />} label="Approved List" />
                        <Tab icon={<BarChartIcon />} label="Analytics" />
                    </Tabs>
                </Paper>

                <TabPanel value={tabValue} index={0}>
                    <ReviewQueue />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <AuditLogViewer />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <ApprovedList />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <AnalyticsDashboard />
                </TabPanel>
            </Container>
        </Box>
    );
};

export default AuditorDashboard;
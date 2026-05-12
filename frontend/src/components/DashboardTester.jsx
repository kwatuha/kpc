import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  useTheme,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Construction as ContractorIcon,
  Assignment as PMIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { tokens } from '../pages/dashboard/theme';
import DatabaseDrivenTabbedDashboard from './DatabaseDrivenTabbedDashboard';
import { testUsers, switchUserRole, testRoleBasedDashboard } from '../utils/roleTestHelper';

const DashboardTester = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [currentUser, setCurrentUser] = useState(testUsers.admin);
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Mock dashboard data
  const mockDashboardData = {
    metrics: {
      totalProjects: 24,
      completedProjects: 18,
      activeProjects: 6,
      totalUsers: 156
    },
    notifications: [
      { id: 1, message: 'New project assigned', type: 'info', timestamp: '2024-02-15T10:30:00Z' },
      { id: 2, message: 'Payment request approved', type: 'success', timestamp: '2024-02-15T09:15:00Z' },
      { id: 3, message: 'Project deadline approaching', type: 'warning', timestamp: '2024-02-15T08:45:00Z' }
    ]
  };

  const handleRoleSwitch = (roleKey) => {
    const user = switchUserRole(roleKey);
    if (user) {
      setCurrentUser(user);
      setTestResults(null);
    }
  };

  const handleTestDashboard = () => {
    setIsTesting(true);
    try {
      const results = testRoleBasedDashboard(currentUser);
      setTestResults(results);
    } catch (error) {
      console.error('Error testing dashboard:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'contractor':
        return <ContractorIcon />;
      case 'project_manager':
        return <PMIcon />;
      default:
        return <AdminIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return colors.redAccent?.[500] || '#f44336';
      case 'contractor':
        return colors.blueAccent?.[500] || '#2196f3';
      case 'project_manager':
        return colors.greenAccent?.[500] || '#4caf50';
      default:
        return colors.grey[400];
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
          Dashboard Role Tester
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleTestDashboard}
          disabled={isTesting}
          sx={{ 
            borderColor: colors.blueAccent?.[500] || '#6870fa',
            color: colors.blueAccent?.[500] || '#6870fa'
          }}
        >
          Test Dashboard
        </Button>
      </Box>

      {/* Role Switcher */}
      <Card sx={{ 
        mb: 3,
        borderRadius: 3, 
        bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
        boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
        border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
      }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={2}>
            Switch User Role
          </Typography>
          
          <Grid container spacing={2}>
            {Object.entries(testUsers).map(([roleKey, user]) => (
              <Grid item xs={12} sm={4} key={roleKey}>
                <Button
                  fullWidth
                  variant={currentUser.role === user.role ? 'contained' : 'outlined'}
                  startIcon={getRoleIcon(user.role)}
                  onClick={() => handleRoleSwitch(roleKey)}
                  sx={{
                    p: 2,
                    height: 'auto',
                    flexDirection: 'column',
                    gap: 1,
                    ...(currentUser.role === user.role ? {
                      bgcolor: getRoleColor(user.role),
                      '&:hover': { bgcolor: getRoleColor(user.role) }
                    } : {
                      borderColor: getRoleColor(user.role),
                      color: getRoleColor(user.role),
                      '&:hover': { 
                        borderColor: getRoleColor(user.role),
                        bgcolor: getRoleColor(user.role) + '10'
                      }
                    })
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user.name}
                  </Typography>
                  <Typography variant="caption">
                    {user.role} • {user.department}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Current User Info */}
      <Card sx={{ 
        mb: 3,
        borderRadius: 3, 
        bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
        boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
        border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
      }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {getRoleIcon(currentUser.role)}
            <Box>
              <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                Current User: {currentUser.name}
              </Typography>
              <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
                Role: {currentUser.role} • Department: {currentUser.department}
              </Typography>
            </Box>
            <Chip 
              label={currentUser.role.toUpperCase()} 
              sx={{ 
                bgcolor: getRoleColor(currentUser.role),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card sx={{ 
          mb: 3,
          borderRadius: 3, 
          bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
          boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
          border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
        }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={2}>
              Test Results
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]} mb={1}>
                  Expected Tabs:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {testResults.tabs.map((tab) => (
                    <Chip 
                      key={tab} 
                      label={tab} 
                      size="small"
                      sx={{ 
                        bgcolor: colors.blueAccent?.[500] || '#6870fa',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]} mb={1}>
                  Expected Components:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {Object.entries(testResults.components).map(([tab, components]) => (
                    <Box key={tab} display="flex" flexDirection="column" gap={0.5}>
                      <Typography variant="caption" fontWeight="bold" color={colors.greenAccent?.[500] || '#4caf50'}>
                        {tab}:
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {components.map((component) => (
                          <Chip 
                            key={component} 
                            label={component} 
                            size="small"
                            sx={{ 
                              bgcolor: colors.greenAccent?.[500] || '#4caf50',
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Database-Driven Dashboard */}
      <Card sx={{ 
        borderRadius: 3, 
        bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
        boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
        border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
      }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={3}>
            Database-Driven Dashboard Preview
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              This dashboard is now driven by database configuration. The tabs and components shown are based on the user's role and database settings.
            </Typography>
          </Alert>
          
          <DatabaseDrivenTabbedDashboard 
            user={currentUser} 
            dashboardData={mockDashboardData} 
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardTester;












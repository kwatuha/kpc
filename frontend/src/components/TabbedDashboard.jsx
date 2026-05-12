import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { tokens } from '../pages/dashboard/theme';
import ActiveUsersCard from './ActiveUsersCard';
import ProjectTasksCard from './ProjectTasksCard';
import ProjectActivityFeed from './ProjectActivityFeed';
import ProjectAlertsCard from './ProjectAlertsCard';
import RoleBasedDashboard from './dashboard/RoleBasedDashboard';
import ChartsDashboard from './dashboard/ChartsDashboard';
import TeamDirectoryCard from './TeamDirectoryCard';
import TeamAnnouncementsCard from './TeamAnnouncementsCard';
import RecentConversationsCard from './RecentConversationsCard';

const TabbedDashboard = ({ user, dashboardData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  const tabProps = (index) => ({
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  });

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tab Navigation */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200],
        bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
        borderRadius: '12px 12px 0 0',
        px: 2,
        py: 1
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[700],
              fontWeight: 'bold',
              fontSize: '0.9rem',
              textTransform: 'none',
              minHeight: 48,
              px: 3,
              '&:hover': {
                color: colors.blueAccent?.[500] || '#6870fa',
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
              },
              '&.Mui-selected': {
                color: colors.blueAccent?.[500] || '#6870fa',
                fontWeight: 'bold',
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                borderRadius: '8px 8px 0 0',
              },
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          <Tab
            icon={<DashboardIcon />}
            iconPosition="start"
            label="Overview"
            {...tabProps(0)}
            sx={{ minWidth: 120 }}
          />
          <Tab
            icon={<AssignmentIcon />}
            iconPosition="start"
            label="Projects"
            {...tabProps(1)}
            sx={{ minWidth: 120 }}
          />
          <Tab
            icon={<PeopleIcon />}
            iconPosition="start"
            label="Collaboration"
            {...tabProps(2)}
            sx={{ minWidth: 120 }}
          />
          <Tab
            icon={<AnalyticsIcon />}
            iconPosition="start"
            label="Analytics"
            {...tabProps(3)}
            sx={{ minWidth: 120 }}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ 
        bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
        borderRadius: '0 0 12px 12px',
        minHeight: '600px'
      }}>
        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {/* Welcome Section */}
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 3, 
                background: theme.palette.mode === 'dark' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: `0 8px 32px ${theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.4)'}`,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                },
              }}>
                <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <DashboardIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold" mb={0.5}>
                        Dashboard Overview
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        Welcome back! Here's your project performance summary
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Key Metrics */}
            <Grid item xs={12}>
              <Typography variant="h5" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={3}>
                Key Performance Indicators
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} sm={6} lg={3}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 3, 
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(102, 126, 234, 0.4)'}`,
                    border: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${theme.palette.mode === 'dark' ? 'rgba(102, 126, 234, 0.4)' : 'rgba(102, 126, 234, 0.5)'}`,
                    },
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <DashboardIcon sx={{ fontSize: 32, opacity: 0.9 }} />
                        <TrendingUpIcon sx={{ fontSize: 20, opacity: 0.7 }} />
                      </Box>
                      <Typography variant="h3" fontWeight="bold" mb={1}>
                        {dashboardData?.metrics?.totalProjects || 24}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, mb: 0.5 }}>
                        Total Projects
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Across all categories
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 3, 
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                      : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    color: 'white',
                    boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(17, 153, 142, 0.3)' : 'rgba(17, 153, 142, 0.4)'}`,
                    border: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${theme.palette.mode === 'dark' ? 'rgba(17, 153, 142, 0.4)' : 'rgba(17, 153, 142, 0.5)'}`,
                    },
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <CheckCircleIcon sx={{ fontSize: 32, opacity: 0.9 }} />
                        <TrendingUpIcon sx={{ fontSize: 20, opacity: 0.7 }} />
                      </Box>
                      <Typography variant="h3" fontWeight="bold" mb={1}>
                        {dashboardData?.metrics?.completedProjects || 18}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, mb: 0.5 }}>
                        Completed
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        This quarter
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 3, 
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(245, 87, 108, 0.3)' : 'rgba(245, 87, 108, 0.4)'}`,
                    border: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${theme.palette.mode === 'dark' ? 'rgba(245, 87, 108, 0.4)' : 'rgba(245, 87, 108, 0.5)'}`,
                    },
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <ScheduleIcon sx={{ fontSize: 32, opacity: 0.9 }} />
                        <TrendingUpIcon sx={{ fontSize: 20, opacity: 0.7 }} />
                      </Box>
                      <Typography variant="h3" fontWeight="bold" mb={1}>
                        {dashboardData?.metrics?.activeProjects || 6}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, mb: 0.5 }}>
                        Active
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        In progress
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 3, 
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                      : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    color: 'white',
                    boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(250, 112, 154, 0.3)' : 'rgba(250, 112, 154, 0.4)'}`,
                    border: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${theme.palette.mode === 'dark' ? 'rgba(250, 112, 154, 0.4)' : 'rgba(250, 112, 154, 0.5)'}`,
                    },
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <WarningIcon sx={{ fontSize: 32, opacity: 0.9 }} />
                        <TrendingUpIcon sx={{ fontSize: 20, opacity: 0.7 }} />
                      </Box>
                      <Typography variant="h3" fontWeight="bold" mb={1}>
                        {dashboardData?.metrics?.overdueProjects || 2}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9, mb: 0.5 }}>
                        Overdue
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Need attention
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Additional Metrics Row */}
            <Grid item xs={12}>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 3, 
                    bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                    boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
                    border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 24px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}25`,
                    },
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <AttachMoneyIcon sx={{ fontSize: 28, color: colors.greenAccent?.[500] || '#4caf50' }} />
                        <Box flex={1}>
                          <Typography variant="h4" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                            ${(dashboardData?.metrics?.totalBudget || 0).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
                            Total Budget
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 3, 
                    bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                    boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
                    border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 24px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}25`,
                    },
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <PeopleIcon sx={{ fontSize: 28, color: colors.blueAccent?.[500] || '#6870fa' }} />
                        <Box flex={1}>
                          <Typography variant="h4" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                            {dashboardData?.metrics?.teamMembers || 45}
                          </Typography>
                          <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
                            Team Members
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 3, 
                    bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                    boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
                    border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 24px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}25`,
                    },
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <AssessmentIcon sx={{ fontSize: 28, color: colors.yellowAccent?.[500] || '#ff9800' }} />
                        <Box flex={1}>
                          <Typography variant="h4" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                            {dashboardData?.metrics?.onTimeProjects || 85}%
                          </Typography>
                          <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
                            On-Time Rate
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: 3, 
                    bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                    boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
                    border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 24px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}25`,
                    },
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <TrendingUpIcon sx={{ fontSize: 28, color: colors.greenAccent?.[500] || '#4caf50' }} />
                        <Box flex={1}>
                          <Typography variant="h4" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                            {dashboardData?.metrics?.budgetUtilization || 68}%
                          </Typography>
                          <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
                            Budget Utilization
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Quick Stats */}
            <Grid item xs={12} lg={6}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3, 
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
                border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={3}>
                    Quick Stats
                  </Typography>
                  {/* Quick Stats Content */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
                          Team Performance
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color={colors.blueAccent?.[500] || '#6870fa'}>
                          85%
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        width: '100%', 
                        height: 8, 
                        bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200], 
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: '85%', 
                          height: '100%', 
                          bgcolor: colors.blueAccent?.[500] || '#6870fa',
                          borderRadius: 4
                        }} />
                      </Box>
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
                          Project Completion
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color={colors.greenAccent?.[500] || '#4caf50'}>
                          72%
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        width: '100%', 
                        height: 8, 
                        bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200], 
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: '72%', 
                          height: '100%', 
                          bgcolor: colors.greenAccent?.[500] || '#4caf50',
                          borderRadius: 4
                        }} />
                      </Box>
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
                          Budget Utilization
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color={colors.yellowAccent?.[500] || '#ff9800'}>
                          68%
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        width: '100%', 
                        height: 8, 
                        bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200], 
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: '68%', 
                          height: '100%', 
                          bgcolor: colors.yellowAccent?.[500] || '#ff9800',
                          borderRadius: 4
                        }} />
                      </Box>
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
                          Quality Score
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color={colors.redAccent?.[500] || '#f44336'}>
                          92%
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        width: '100%', 
                        height: 8, 
                        bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200], 
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}>
                        <Box sx={{ 
                          width: '92%', 
                          height: '100%', 
                          bgcolor: colors.redAccent?.[500] || '#f44336',
                          borderRadius: 4
                        }} />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} lg={6}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3, 
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
                border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={3}>
                    Recent Activity
                  </Typography>
                  {/* Recent Activity Content */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        bgcolor: colors.greenAccent?.[500] || '#4caf50', 
                        borderRadius: '50%' 
                      }} />
                      <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}>
                        Project "Water Management" completed successfully
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        bgcolor: colors.blueAccent?.[500] || '#6870fa', 
                        borderRadius: '50%' 
                      }} />
                      <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}>
                        New task assigned: Site inspection for Healthcare project
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        bgcolor: colors.yellowAccent?.[500] || '#ff9800', 
                        borderRadius: '50%' 
                      }} />
                      <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}>
                        Budget approval pending for Education project
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        bgcolor: colors.redAccent?.[500] || '#f44336', 
                        borderRadius: '50%' 
                      }} />
                      <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}>
                        High risk alert: Road Infrastructure project
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Projects Tab */}
        <TabPanel value={activeTab} index={1}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            <Grid item xs={12} lg={4}>
              <ProjectTasksCard currentUser={user} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <ProjectActivityFeed currentUser={user} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <ProjectAlertsCard currentUser={user} />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Collaboration Tab */}
        <TabPanel value={activeTab} index={2}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            <Grid item xs={12} lg={4}>
              <TeamDirectoryCard currentUser={user} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <TeamAnnouncementsCard currentUser={user} />
            </Grid>
            <Grid item xs={12} lg={4}>
              <RecentConversationsCard currentUser={user} />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={activeTab} index={3}>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            <Grid item xs={12}>
              <ChartsDashboard user={user} dashboardData={dashboardData} />
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default TabbedDashboard;

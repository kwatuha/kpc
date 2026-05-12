import React, { useState, useEffect, useContext } from 'react';
import ProfileModal from '../../components/ProfileModal';
import DatabaseDrivenTabbedDashboard from '../../components/DatabaseDrivenTabbedDashboard';
import { ProfileModalProvider, useProfileModal } from '../../context/ProfileModalContext';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { tokens } from '../dashboard/theme';
import useDashboardData from '../../hooks/useDashboardData';
import ErrorBoundary from '../../components/ErrorBoundary';

const AdminLandingPageContent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isOpen: profileModalOpen, closeModal: closeProfileModal } = useProfileModal();
  
  // Use the custom hook for dashboard data
  const {
    dashboardData,
    refreshing,
    refreshDashboard,
    markNotificationAsRead,
    updateProfile,
    exportData
  } = useDashboardData();

  // Fallback data for when API is not available
  const fallbackData = {
    notifications: [
      { id: 1, type: 'timeline', title: 'New Timeline Notifications', count: 0, priority: 'low', icon: <ScheduleIcon /> },
      { id: 2, type: 'project', title: 'New Project Updates', count: 1, priority: 'medium', icon: <AssignmentIcon /> },
      { id: 3, type: 'task', title: "Today's Pending Tasks", count: 0, priority: 'high', icon: <WarningIcon /> },
      { id: 4, type: 'message', title: 'New Messages & Chats', count: 0, priority: 'low', icon: <NotificationsIcon /> },
    ],
    profile: {
      name: user?.username || 'Admin User',
      role: user?.roleName || 'Administrator',
      email: 'admin@imes.com',
      phone: '0725044721',
      lastOnline: '2 minutes ago',
      profileComplete: 85,
      leaveDays: { taken: 0, remaining: 0 },
      about: 'System Administrator',
      verified: true,
    },
    metrics: {
      totalProjects: 12,
      activeProjects: 8,
      completedProjects: 4,
      pendingApprovals: 3,
      budgetUtilization: 75,
      teamMembers: 24,
    },
    recentActivity: [
      { id: 1, action: 'Project "Water Management" updated', time: '2 hours ago', type: 'project' },
      { id: 2, action: 'New team member added to "Infrastructure"', time: '4 hours ago', type: 'team' },
      { id: 3, action: 'Budget approval required for "Health Initiative"', time: '1 day ago', type: 'approval' },
    ],
  };

  // Use dashboard data or fallback
  const data = dashboardData.loading ? fallbackData : (dashboardData.notifications ? dashboardData : fallbackData);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.redAccent?.[500] || '#db4f4a';
      case 'medium': return colors.blueAccent?.[500] || '#6870fa';
      case 'low': return colors.greenAccent?.[500] || '#4cceac';
      default: return colors.grey?.[500] || '#666666';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'timeline':
      case 'schedule': return <ScheduleIcon />;
      case 'project':
      case 'assignment': return <AssignmentIcon />;
      case 'task':
      case 'warning': return <WarningIcon />;
      case 'message':
      case 'email': return <NotificationsIcon />;
      default: return <InfoIcon />;
    }
  };

  const NotificationCard = ({ notification }) => {
    const priorityColors = {
      'high': {
        primary: '#ff6b6b',
        gradient: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 50%, #ffa8a8 100%)',
        accent: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
        bg: 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)',
        border: '#ff6b6b',
        iconBg: 'rgba(255, 255, 255, 0.25)',
        textColor: 'white'
      },
      'medium': {
        primary: '#4dabf7',
        gradient: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 50%, #64b5f6 100%)',
        accent: 'linear-gradient(135deg, #4dabf7 0%, #339af0 100%)',
        bg: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)',
        border: '#4dabf7',
        iconBg: 'rgba(255, 255, 255, 0.25)',
        textColor: 'white'
      },
      'low': {
        primary: '#51cf66',
        gradient: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 50%, #81c784 100%)',
        accent: 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)',
        bg: 'linear-gradient(135deg, #f8fff9 0%, #ebfbee 100%)',
        border: '#51cf66',
        iconBg: 'rgba(255, 255, 255, 0.25)',
        textColor: 'white'
      }
    };
    
    const colorScheme = priorityColors[notification.priority] || priorityColors['low'];
    
    return (
      <Card sx={{ 
        borderRadius: 3,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: colorScheme.gradient,
        border: `2px solid rgba(255, 255, 255, 0.3)`,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: `0 4px 20px ${colorScheme.primary}30`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '3px 3px 0 0',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -30,
          right: -30,
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          opacity: 0.8,
          transition: 'all 0.3s ease',
        },
        '&:hover': {
          transform: 'translateY(-8px) scale(1.03)',
          boxShadow: `0 16px 40px ${colorScheme.primary}50`,
          border: `2px solid rgba(255, 255, 255, 0.5)`,
          '&::before': {
            height: '8px',
          },
          '&::after': {
            opacity: 1,
            transform: 'scale(1.2)',
          }
        }
      }}>
        <CardContent sx={{ py: 2, px: 2.5, position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" flex={1}>
              <Box sx={{
                backgroundColor: colorScheme.iconBg,
                borderRadius: '50%',
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: `0 4px 12px rgba(0, 0, 0, 0.15)`,
                transition: 'all 0.3s ease',
                position: 'relative',
                backdropFilter: 'blur(10px)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  transform: 'scale(1.15)',
                  boxShadow: `0 8px 20px rgba(0, 0, 0, 0.25)`,
                  '&::before': {
                    opacity: 1,
                  }
                },
                '& svg': {
                  color: 'white',
                  fontSize: '1.3rem'
                }
              }}>
                {typeof notification.icon === 'string' ? getNotificationIcon(notification.icon) : notification.icon}
              </Box>
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'white', mb: 0.5 }}>
                  {notification.title}
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  textTransform: 'capitalize',
                  fontWeight: 600,
                  letterSpacing: '0.5px'
                }}>
                  {notification.priority} priority
                </Typography>
              </Box>
            </Box>
            <Badge 
              badgeContent={notification.count} 
              sx={{ 
                '& .MuiBadge-badge': { 
                  backgroundColor: 'white',
                  color: colorScheme.primary,
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  minWidth: 22,
                  height: 22,
                  borderRadius: '50%',
                  boxShadow: `0 2px 8px rgba(0, 0, 0, 0.2)`,
                  border: `2px solid ${colorScheme.primary}`,
                  animation: notification.count > 0 ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' }
                  }
                } 
              }}
            />
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Show loading state
  if (dashboardData.loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: colors.primary[5]
      }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: colors.blueAccent[500], mb: 2 }} />
          <Typography variant="h6" color={colors.grey[100]}>
            Loading admin dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Show error state
  if (dashboardData.error) {
    return (
      <Box sx={{ p: 3, minHeight: '100vh', bgcolor: colors.primary[5] }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refreshDashboard}>
              Retry
            </Button>
          }
        >
          {dashboardData.error}
        </Alert>
      </Box>
    );
  }

  return (
    <ErrorBoundary>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: colors.primary[5],
        background: `linear-gradient(135deg, ${colors.primary[5]} 0%, ${colors.primary[4]} 100%)`,
        px: { xs: 1, sm: 1.5, md: 2 }, 
        pb: 1.5 
      }}>
        {/* Compact Welcome Header */}
        <Card sx={{ 
          mt: { xs: 1, sm: 1.5, md: 2 },
          mb: { xs: 1, sm: 1.5, md: 2 },
          borderRadius: 4,
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`
            : `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`,
          boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)'}`,
          overflow: 'hidden',
          position: 'relative',
          minHeight: '120px',
          transition: 'all 0.3s ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${colors.blueAccent?.[500] || '#6870fa'} 0%, ${colors.greenAccent?.[500] || '#4cceac'} 50%, ${colors.blueAccent?.[400] || '#8b9cfb'} 100%)`,
            borderRadius: '4px 4px 0 0',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${colors.greenAccent?.[50] || '#f0fdf4'} 0%, transparent 70%)`,
            borderRadius: '50%',
            opacity: 0.3,
            zIndex: 0,
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 30px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
            '&::after': {
              opacity: 0.4,
            },
          }
        }}>
          <CardContent sx={{ p: { xs: 1.25, sm: 1.5 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Box flex={1} minWidth={200}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  color="#000000" 
                  mb={0.5}
                  sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.4rem' } }}
                >
                  Welcome back, {data.profile.name}! 👋
                </Typography>
                <Typography 
                  variant="body2" 
                  color="#333333"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' }, fontWeight: 600 }}
                >
                  Admin Dashboard - System overview and key metrics
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box display="flex" alignItems="center" gap={0.75}>
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      bgcolor: colors.greenAccent?.[500] || '#4cceac',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                        '100%': { opacity: 1 }
                      }
                    }} 
                  />
                  <Typography variant="caption" color="#444444" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
                    System operational
                  </Typography>
                </Box>
                <IconButton 
                  onClick={refreshDashboard} 
                  disabled={refreshing}
                  sx={{ 
                    bgcolor: colors.blueAccent?.[500] || '#6870fa',
                    color: 'white',
                    width: { xs: 26, sm: 30 },
                    height: { xs: 26, sm: 30 },
                    borderRadius: 1.25,
                    '&:hover': { 
                      bgcolor: colors.blueAccent?.[600] || '#535ac8',
                      transform: 'scale(1.05)',
                      boxShadow: `0 6px 20px ${colors.blueAccent?.[500] || '#6870fa'}40`
                    },
                    '&:disabled': {
                      bgcolor: theme.palette.mode === 'dark' ? colors.grey[600] : colors.grey[300],
                    },
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  <RefreshIcon sx={{ 
                    animation: refreshing ? 'spin 1s linear infinite' : 'none',
                    fontSize: '1.1rem',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' }
                    }
                  }} />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Notifications - Full width */}
        <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} mb={{ xs: 1.5, sm: 2, md: 2.5 }}>
            <Grid item xs={12}>
              <Card sx={{ 
                borderRadius: 4, 
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#ffffff',
                boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)'}`,
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                position: 'relative',
                minHeight: '300px',
                background: theme.palette.mode === 'dark' 
                  ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
                  : `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, ${colors.blueAccent?.[500] || '#6870fa'} 0%, ${colors.greenAccent?.[500] || '#4cceac'} 50%, ${colors.blueAccent?.[400] || '#8b9cfb'} 100%)`,
                  borderRadius: '4px 4px 0 0',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: '200px',
                  height: '200px',
                  background: `radial-gradient(circle, ${colors.blueAccent?.[50] || '#f0f9ff'} 0%, transparent 70%)`,
                  borderRadius: '50%',
                  opacity: 0.2,
                  zIndex: 0,
                },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 30px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
                  '&::after': {
                    opacity: 0.3,
                  },
                }
              }}>
        <CardContent sx={{
          p: { xs: 1.5, sm: 2 },
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
                  {/* Header Section */}
                  <Box>
                    <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                      <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === 'dark' 
                          ? `${colors.blueAccent?.[500] || '#6870fa'}20` 
                          : `${colors.blueAccent?.[500] || '#6870fa'}15`,
                        border: `1px solid ${colors.blueAccent?.[200] || '#c7d2fe'}`,
                        boxShadow: `0 4px 12px ${colors.blueAccent?.[200] || '#c7d2fe'}20`,
                      }}>
                        <NotificationsIcon sx={{ 
                          color: colors.blueAccent?.[500] || '#6870fa', 
                          fontSize: 22 
                        }} />
                      </Box>
                      <Box>
                        <Typography variant="h5" fontWeight="bold" color="#000000">
                          Reminders & Notifications
                        </Typography>
                        <Typography variant="body2" color="#333333" sx={{ 
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          mt: 0.5
                        }}>
                          Stay updated with latest alerts and important updates
                        </Typography>
                      </Box>
                    </Box>

                    {/* Notification Summary */}
             <Box sx={{
               mb: 2.5,
                      p: 2.5,
                      borderRadius: 4,
                      background: theme.palette.mode === 'dark' 
                        ? `linear-gradient(135deg, ${colors.primary[300]}20 0%, ${colors.primary[400]}15 100%)` 
                        : `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.8) 100%)`,
                      backdropFilter: 'blur(15px)',
                      border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[200] : 'rgba(255,255,255,0.2)'}`,
                      boxShadow: `0 8px 32px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)'}`,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: `linear-gradient(90deg, ${colors.blueAccent?.[500] || '#6870fa'} 0%, ${colors.greenAccent?.[500] || '#4cceac'} 50%, ${colors.blueAccent?.[400] || '#8b9cfb'} 100%)`,
                        borderRadius: '4px 4px 0 0',
                      },
                    }}>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Card sx={{ 
                            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)', 
                            color: 'white',
                            borderRadius: 3,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
                            }
                          }}>
                            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                              <Box sx={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                mb: 1.5,
                                backdropFilter: 'blur(10px)'
                              }}>
                                <ScheduleIcon sx={{ fontSize: '1.5rem' }} />
                              </Box>
                              <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                                {data.notifications.filter(n => n.priority === 'low').length}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 500,
                                opacity: 0.9
                              }}>
                                Low Priority
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={4}>
                          <Card sx={{ 
                            background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)', 
                            color: 'white',
                            borderRadius: 3,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(33, 150, 243, 0.3)',
                            }
                          }}>
                            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                              <Box sx={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                mb: 1.5,
                                backdropFilter: 'blur(10px)'
                              }}>
                                <AssignmentIcon sx={{ fontSize: '1.5rem' }} />
                              </Box>
                              <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                                {data.notifications.filter(n => n.priority === 'medium').length}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 500,
                                opacity: 0.9
                              }}>
                                Medium Priority
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={4}>
                          <Card sx={{ 
                            background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8a80 100%)', 
                            color: 'white',
                            borderRadius: 3,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)',
                            }
                          }}>
                            <CardContent sx={{ textAlign: 'center', py: 2.5 }}>
                              <Box sx={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                mb: 1.5,
                                backdropFilter: 'blur(10px)'
                              }}>
                                <WarningIcon sx={{ fontSize: '1.5rem' }} />
                              </Box>
                              <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                                {data.notifications.filter(n => n.priority === 'high').length}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 500,
                                opacity: 0.9
                              }}>
                                High Priority
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>

                  {/* Notification cards grid layout */}
                  <Box sx={{ flex: 1 }}>
                    <Grid container spacing={2}>
                      {data.notifications
                        .filter(notification => 
                          !notification.title.toLowerCase().includes('messages') && 
                          !notification.title.toLowerCase().includes('chats')
                        )
                        .map((notification) => (
                          <Grid item xs={12} sm={6} md={4} key={notification.id}>
                            <Box sx={{ 
                              transition: 'transform 0.2s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                              }
                            }}>
                              <NotificationCard notification={notification} />
                            </Box>
                          </Grid>
                        ))}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

        </Grid>

        {/* Database-Driven Comprehensive Dashboard */}
        <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} mb={{ xs: 1.5, sm: 2, md: 2.5 }}>
          <Grid item xs={12}>
            <DatabaseDrivenTabbedDashboard user={user} dashboardData={data} />
          </Grid>
        </Grid>


        {/* Profile Modal */}
        <ProfileModal
          open={profileModalOpen}
          onClose={closeProfileModal}
          user={data.profile}
          onSave={(updatedProfile) => {
            updateProfile(updatedProfile);
            closeProfileModal();
          }}
        />
      </Box>
    </ErrorBoundary>
  );
};

const AdminLandingPage = () => {
  return (
    <ProfileModalProvider>
      <AdminLandingPageContent />
    </ProfileModalProvider>
  );
};

export default AdminLandingPage;


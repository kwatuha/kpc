import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import ProjectAnalyticsChart from '../charts/ProjectAnalyticsChart';
import PerformanceMetricsChart from '../charts/PerformanceMetricsChart';
import RealTimeActivityChart from '../charts/RealTimeActivityChart';
import { tokens } from '../../pages/dashboard/theme';

const ChartsDashboard = ({ user, dashboardData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const chartTabs = [
    { label: 'Project Analytics', icon: <BarChartIcon />, value: 0 },
    { label: 'Performance', icon: <PieChartIcon />, value: 1 },
    { label: 'Activity Feed', icon: <TimelineIcon />, value: 2 },
    { label: 'Trends', icon: <TrendingUpIcon />, value: 3 },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderChartContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <ProjectAnalyticsChart
                title="Project Performance Analytics"
                type="bar"
                height={400}
                data={dashboardData?.projectAnalytics}
              />
            </Grid>
            <Grid item xs={12} lg={4}>
              <ProjectAnalyticsChart
                title="Project Status Distribution"
                type="pie"
                height={400}
                data={dashboardData?.projectStatus}
              />
            </Grid>
            <Grid item xs={12}>
              <ProjectAnalyticsChart
                title="Budget vs Actual Spending"
                type="line"
                height={300}
                data={dashboardData?.budgetAnalysis}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <PerformanceMetricsChart
                title="Team Performance Metrics"
                data={dashboardData?.performanceMetrics}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <RealTimeActivityChart
                title="Real-Time Activity Feed"
                data={dashboardData?.activityFeed}
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <ProjectAnalyticsChart
                title="Monthly Trends"
                type="line"
                height={350}
                data={dashboardData?.monthlyTrends}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <ProjectAnalyticsChart
                title="Quarterly Revenue"
                type="area"
                height={350}
                data={dashboardData?.quarterlyRevenue}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <ProjectAnalyticsChart
                title="Resource Utilization"
                type="bar"
                height={300}
                data={dashboardData?.resourceUtilization}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <ProjectAnalyticsChart
                title="Quality Metrics"
                type="pie"
                height={300}
                data={dashboardData?.qualityMetrics}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ 
      bgcolor: '#ffffff', 
      borderRadius: 3,
      border: `1px solid rgba(0,0,0,0.08)`,
      overflow: 'hidden',
      boxShadow: `0 4px 20px rgba(0,0,0,0.04)`,
      '@keyframes pulse': {
        '0%': {
          opacity: 1,
          transform: 'scale(1)',
        },
        '50%': {
          opacity: 0.7,
          transform: 'scale(1.1)',
        },
        '100%': {
          opacity: 1,
          transform: 'scale(1)',
        },
      },
      ...(isFullscreen && {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        bgcolor: '#ffffff',
        borderRadius: 0,
      })
    }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
        p: 3, 
        borderBottom: `1px solid rgba(0,0,0,0.08)`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #6870fa, #4caf50, #ff9800)',
          borderRadius: '3px 3px 0 0'
        }
      }}>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h4" 
            fontWeight="800" 
            color="#000000"
            sx={{ 
              fontSize: { xs: '1.5rem', md: '1.75rem' },
              mb: 0.5,
              background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Analytics Dashboard
          </Typography>
          <Typography 
            variant="body1" 
            color="#555555" 
            fontWeight="500"
            sx={{ 
              fontSize: { xs: '0.9rem', md: '1rem' },
              opacity: 0.8
            }}
          >
            Comprehensive insights and analytics for {user?.roleName || 'your role'}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            mt: 1.5,
            alignItems: 'center'
          }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: colors.blueAccent?.[500] || '#6870fa',
              animation: 'pulse 2s infinite'
            }} />
            <Typography variant="caption" color="#666666" fontWeight="600">
              Real-time data • Last updated: {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 1,
          alignItems: 'flex-end'
        }}>
          <Typography variant="caption" color="#888888" fontWeight="600" sx={{ mb: 1 }}>
            Quick Actions
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh All Charts">
              <IconButton 
                size="medium" 
                sx={{ 
                  color: colors.blueAccent?.[500] || '#6870fa',
                  bgcolor: 'rgba(104, 112, 250, 0.1)',
                  border: `1px solid rgba(104, 112, 250, 0.2)`,
                  '&:hover': { 
                    bgcolor: 'rgba(104, 112, 250, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px rgba(104, 112, 250, 0.3)`
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Dashboard">
              <IconButton 
                size="medium" 
                sx={{ 
                  color: colors.greenAccent?.[500] || '#4caf50',
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  border: `1px solid rgba(76, 175, 80, 0.2)`,
                  '&:hover': { 
                    bgcolor: 'rgba(76, 175, 80, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px rgba(76, 175, 80, 0.3)`
                  }
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
              <IconButton 
                size="medium" 
                onClick={() => setIsFullscreen(!isFullscreen)}
                sx={{ 
                  color: colors.yellowAccent?.[500] || '#ff9800',
                  bgcolor: 'rgba(255, 152, 0, 0.1)',
                  border: `1px solid rgba(255, 152, 0, 0.2)`,
                  '&:hover': { 
                    bgcolor: 'rgba(255, 152, 0, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px rgba(255, 152, 0, 0.3)`
                  }
                }}
              >
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ 
        bgcolor: '#ffffff', 
        borderBottom: `1px solid rgba(0,0,0,0.08)`,
        px: 3,
        py: 2,
        position: 'relative'
      }}>
        <Typography 
          variant="subtitle2" 
          color="#888888" 
          fontWeight="700" 
          sx={{ 
            mb: 1.5,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontSize: '0.75rem'
          }}
        >
          Chart Categories
        </Typography>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              color: '#666666',
              fontWeight: '600',
              textTransform: 'none',
              minHeight: 52,
              fontSize: '0.9rem',
              borderRadius: '12px',
              mx: 0.5,
              px: 3,
              py: 1.5,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '2px solid transparent',
              position: 'relative',
              '&:hover': {
                bgcolor: 'rgba(104, 112, 250, 0.06)',
                color: colors.blueAccent?.[500] || '#6870fa',
                transform: 'translateY(-2px)',
                border: `2px solid rgba(104, 112, 250, 0.2)`,
                boxShadow: `0 4px 16px rgba(104, 112, 250, 0.15)`,
              },
              '&.Mui-selected': {
                color: '#ffffff',
                bgcolor: `linear-gradient(135deg, ${colors.blueAccent?.[500] || '#6870fa'} 0%, ${colors.blueAccent?.[600] || '#535ac8'} 100%)`,
                fontWeight: '700',
                border: `2px solid ${colors.blueAccent?.[500] || '#6870fa'}`,
                boxShadow: `0 6px 20px ${colors.blueAccent?.[500] || '#6870fa'}40`,
                transform: 'translateY(-2px)',
                '& .MuiSvgIcon-root': {
                  color: '#ffffff !important'
                },
                '&:hover': {
                  bgcolor: `linear-gradient(135deg, ${colors.blueAccent?.[600] || '#535ac8'} 0%, ${colors.blueAccent?.[700] || '#4a4fb8'} 100%)`,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 8px 25px ${colors.blueAccent?.[500] || '#6870fa'}50`,
                  '& .MuiSvgIcon-root': {
                    color: '#ffffff !important'
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: '3px',
                  bgcolor: '#ffffff',
                  borderRadius: '2px 2px 0 0',
                  opacity: 0.8
                }
              },
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          {chartTabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ 
                minWidth: isMobile ? 120 : 160,
                gap: 1
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Chart Content */}
      <Box sx={{ 
        p: 4, 
        maxHeight: isFullscreen ? 'calc(100vh - 140px)' : 'auto', 
        overflowY: 'auto',
        bgcolor: '#fafbfc',
        borderTop: `1px solid rgba(0,0,0,0.04)`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.1) 50%, transparent 100%)'
        }
      }}>
        <Box sx={{ 
          position: 'relative',
          zIndex: 1
        }}>
          {renderChartContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default ChartsDashboard;

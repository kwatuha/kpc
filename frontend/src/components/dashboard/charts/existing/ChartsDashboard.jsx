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
import ProjectAnalyticsChart from '../../../charts/ProjectAnalyticsChart';
import PerformanceMetricsChart from '../../../charts/PerformanceMetricsChart';
import RealTimeActivityChart from '../../../charts/RealTimeActivityChart';
import { tokens } from '../../../../pages/dashboard/theme';

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
      bgcolor: colors.primary[5], 
      borderRadius: 3,
      border: `1px solid ${colors.primary[300]}`,
      overflow: 'hidden',
      ...(isFullscreen && {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        bgcolor: colors.primary[400],
        borderRadius: 0,
      })
    }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: colors.primary[400], 
        p: 2, 
        borderBottom: `1px solid ${colors.primary[300]}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box>
          <Typography variant="h6" fontWeight="bold" color={colors.grey[100]}>
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color={colors.grey[300]}>
            Comprehensive insights and analytics for {user?.roleName || 'your role'}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh All Charts">
            <IconButton 
              size="small" 
              sx={{ 
                color: colors.blueAccent[500],
                '&:hover': { bgcolor: colors.blueAccent[500] + '20' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export Dashboard">
            <IconButton 
              size="small" 
              sx={{ 
                color: colors.greenAccent[500],
                '&:hover': { bgcolor: colors.greenAccent[500] + '20' }
              }}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            <IconButton 
              size="small" 
              onClick={() => setIsFullscreen(!isFullscreen)}
              sx={{ 
                color: colors.yellowAccent[500],
                '&:hover': { bgcolor: colors.yellowAccent[500] + '20' }
              }}
            >
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ 
        bgcolor: colors.primary[400], 
        borderBottom: `1px solid ${colors.primary[300]}`,
        px: 2,
        py: 1
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              color: colors.grey[50],
              fontWeight: 'bold',
              textTransform: 'none',
              minHeight: 48,
              fontSize: '0.95rem',
              bgcolor: colors.primary[600],
              borderRadius: '8px 8px 0 0',
              mx: 0.5,
              px: 2,
              '&:hover': {
                bgcolor: colors.primary[500],
                color: colors.grey[50],
              },
              '&.Mui-selected': {
                color: colors.grey[50],
                bgcolor: colors.blueAccent[500],
                fontWeight: 'bold',
                boxShadow: `0 2px 8px ${colors.blueAccent[500]}40`,
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
      <Box sx={{ p: 3, maxHeight: isFullscreen ? 'calc(100vh - 140px)' : 'auto', overflowY: 'auto' }}>
        {renderChartContent()}
      </Box>
    </Box>
  );
};

export default ChartsDashboard;

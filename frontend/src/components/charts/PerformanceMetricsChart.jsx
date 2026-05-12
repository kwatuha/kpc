import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { tokens } from '../../pages/dashboard/theme';

const PerformanceMetricsChart = ({ title = "Performance Metrics", data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Mock performance data
  const performanceData = data || {
    overallScore: 87,
    productivity: 92,
    efficiency: 85,
    quality: 90,
    timeliness: 88,
    collaboration: 82,
    trends: [
      { metric: 'Productivity', current: 92, previous: 88, trend: 'up' },
      { metric: 'Efficiency', current: 85, previous: 82, trend: 'up' },
      { metric: 'Quality', current: 90, previous: 93, trend: 'down' },
      { metric: 'Timeliness', current: 88, previous: 85, trend: 'up' },
      { metric: 'Collaboration', current: 82, previous: 79, trend: 'up' },
    ],
    topPerformers: [
      { name: 'Sarah Johnson', score: 95, role: 'Project Manager' },
      { name: 'Mike Chen', score: 92, role: 'Developer' },
      { name: 'Emily Davis', score: 89, role: 'Designer' },
    ],
    recentAchievements: [
      { title: 'Completed 5 projects this month', date: '2 days ago', type: 'achievement' },
      { title: 'Met all deadlines for Q2', date: '1 week ago', type: 'milestone' },
      { title: 'Received team recognition', date: '2 weeks ago', type: 'recognition' },
    ]
  };

  const getScoreColor = (score) => {
    if (score >= 90) return colors.greenAccent[500];
    if (score >= 80) return colors.blueAccent[500];
    if (score >= 70) return colors.yellowAccent[500];
    return colors.redAccent[500];
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    return 'Needs Improvement';
  };

  const MetricCard = ({ title, value, subtitle, icon, color, trend }) => (
    <Card sx={{ 
      bgcolor: colors.primary[400], 
      borderRadius: 2,
      border: `1px solid ${colors.primary[300]}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 15px ${color}20`,
      }
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}%
            </Typography>
            <Typography variant="body2" color="#555555" fontWeight="500">
              {title}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
            {icon}
          </Avatar>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={value} 
          sx={{ 
            bgcolor: '#e5e7eb',
            '& .MuiLinearProgress-bar': { bgcolor: color }
          }}
        />
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
          <Typography variant="caption" color="#666666" fontWeight="500">
            {subtitle}
          </Typography>
          {trend && (
            <Box display="flex" alignItems="center" gap={0.5}>
              {trend === 'up' ? 
                <TrendingUpIcon sx={{ fontSize: 16, color: colors.greenAccent?.[500] || '#4caf50' }} /> :
                <TrendingDownIcon sx={{ fontSize: 16, color: colors.redAccent?.[500] || '#f44336' }} />
              }
              <Typography variant="caption" color={trend === 'up' ? colors.greenAccent?.[500] || '#4caf50' : colors.redAccent?.[500] || '#f44336'} fontWeight="600">
                {trend === 'up' ? '+' : '-'}{Math.abs(value - 80)}%
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Card sx={{ 
      bgcolor: '#ffffff', 
      borderRadius: 3,
      border: `1px solid rgba(0,0,0,0.08)`,
      transition: 'all 0.3s ease',
      boxShadow: `0 4px 20px rgba(0,0,0,0.04)`,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 25px rgba(0,0,0,0.08)`,
      }
    }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="#000000" mb={1}>
              {title}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip 
                label={getScoreLabel(performanceData.overallScore)}
                size="small"
                sx={{ 
                  bgcolor: getScoreColor(performanceData.overallScore),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              <Typography variant="body2" color="#555555" fontWeight="500">
                Overall Score: {performanceData.overallScore}%
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh Metrics">
              <IconButton 
                size="small" 
                sx={{ 
                  color: colors.blueAccent?.[500] || '#6870fa',
                  '&:hover': { 
                    bgcolor: 'rgba(104, 112, 250, 0.08)',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download Report">
              <IconButton 
                size="small" 
                sx={{ 
                  color: colors.greenAccent?.[500] || '#4caf50',
                  '&:hover': { 
                    bgcolor: 'rgba(76, 175, 80, 0.08)',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Performance Metrics Grid */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              title="Productivity"
              value={performanceData.productivity}
              subtitle="Task completion rate"
              icon={<SpeedIcon />}
              color={colors.greenAccent?.[500] || '#4caf50'}
              trend="up"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              title="Efficiency"
              value={performanceData.efficiency}
              subtitle="Resource utilization"
              icon={<TimerIcon />}
              color={colors.blueAccent?.[500] || '#6870fa'}
              trend="up"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <MetricCard
              title="Quality"
              value={performanceData.quality}
              subtitle="Output quality score"
              icon={<CheckCircleIcon />}
              color={colors.yellowAccent?.[500] || '#ff9800'}
              trend="down"
            />
          </Grid>
        </Grid>

        {/* Trends Section */}
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight="bold" color="#000000" mb={2}>
            Performance Trends
          </Typography>
          <List sx={{ bgcolor: '#ffffff', borderRadius: 2, p: 1, border: `1px solid rgba(0,0,0,0.08)` }}>
            {performanceData.trends.map((trend, index) => (
              <React.Fragment key={trend.metric}>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <Avatar sx={{ 
                      bgcolor: trend.trend === 'up' ? colors.greenAccent?.[500] || '#4caf50' : colors.redAccent?.[500] || '#f44336',
                      width: 32, 
                      height: 32 
                    }}>
                      {trend.trend === 'up' ? 
                        <TrendingUpIcon sx={{ fontSize: 16 }} /> :
                        <TrendingDownIcon sx={{ fontSize: 16 }} />
                      }
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={trend.metric}
                    secondary={`${trend.current}% (${trend.trend === 'up' ? '+' : '-'}${Math.abs(trend.current - trend.previous)}% from last period)`}
                    primaryTypographyProps={{ color: '#000000', fontWeight: 'medium' }}
                    secondaryTypographyProps={{ color: '#555555', fontWeight: '500' }}
                  />
                  <Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={trend.current} 
                      sx={{ 
                        width: 100,
                        bgcolor: '#e5e7eb',
                        '& .MuiLinearProgress-bar': { 
                          bgcolor: trend.trend === 'up' ? colors.greenAccent?.[500] || '#4caf50' : colors.redAccent?.[500] || '#f44336'
                        }
                      }}
                    />
                  </Box>
                </ListItem>
                {index < performanceData.trends.length - 1 && (
                  <Divider sx={{ bgcolor: 'rgba(0,0,0,0.08)' }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Top Performers */}
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight="bold" color="#000000" mb={2}>
            Top Performers
          </Typography>
          <List sx={{ bgcolor: '#ffffff', borderRadius: 2, p: 1, border: `1px solid rgba(0,0,0,0.08)` }}>
            {performanceData.topPerformers.map((performer, index) => (
              <React.Fragment key={performer.name}>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <Avatar sx={{ 
                      bgcolor: colors.blueAccent?.[500] || '#6870fa',
                      width: 32, 
                      height: 32 
                    }}>
                      {performer.name.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={performer.name}
                    secondary={performer.role}
                    primaryTypographyProps={{ color: '#000000', fontWeight: 'medium' }}
                    secondaryTypographyProps={{ color: '#555555', fontWeight: '500' }}
                  />
                  <Chip 
                    label={`${performer.score}%`}
                    size="small"
                    sx={{ 
                      bgcolor: getScoreColor(performer.score),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </ListItem>
                {index < performanceData.topPerformers.length - 1 && (
                  <Divider sx={{ bgcolor: 'rgba(0,0,0,0.08)' }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Recent Achievements */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="#000000" mb={2}>
            Recent Achievements
          </Typography>
          <List sx={{ bgcolor: '#ffffff', borderRadius: 2, p: 1, border: `1px solid rgba(0,0,0,0.08)` }}>
            {performanceData.recentAchievements.map((achievement, index) => (
              <React.Fragment key={achievement.title}>
                <ListItem sx={{ py: 1 }}>
                  <ListItemIcon>
                    <Avatar sx={{ 
                      bgcolor: colors.greenAccent?.[500] || '#4caf50',
                      width: 32, 
                      height: 32 
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={achievement.title}
                    secondary={achievement.date}
                    primaryTypographyProps={{ color: '#000000', fontWeight: 'medium' }}
                    secondaryTypographyProps={{ color: '#555555', fontWeight: '500' }}
                  />
                  <Chip 
                    label={achievement.type}
                    size="small"
                    sx={{ 
                      bgcolor: colors.blueAccent?.[500] || '#6870fa',
                      color: 'white',
                      textTransform: 'capitalize'
                    }}
                  />
                </ListItem>
                {index < performanceData.recentAchievements.length - 1 && (
                  <Divider sx={{ bgcolor: 'rgba(0,0,0,0.08)' }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricsChart;

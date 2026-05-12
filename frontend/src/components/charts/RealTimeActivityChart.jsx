import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Button,
  useTheme,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { tokens } from '../../pages/dashboard/theme';

const RealTimeActivityChart = ({ title = "Real-Time Activity Feed", data }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activities, setActivities] = useState([]);

  // Mock real-time data
  const mockActivities = data || [
    {
      id: 1,
      type: 'project',
      title: 'Project "Water Management" updated',
      user: 'Sarah Johnson',
      time: '2 minutes ago',
      priority: 'medium',
      status: 'active',
      icon: <AssignmentIcon />,
      color: colors.blueAccent[500]
    },
    {
      id: 2,
      type: 'team',
      title: 'New team member added to "Infrastructure"',
      user: 'Mike Chen',
      time: '5 minutes ago',
      priority: 'low',
      status: 'completed',
      icon: <PeopleIcon />,
      color: colors.greenAccent[500]
    },
    {
      id: 3,
      type: 'approval',
      title: 'Budget approval required for "Health Initiative"',
      user: 'Emily Davis',
      time: '10 minutes ago',
      priority: 'high',
      status: 'pending',
      icon: <WarningIcon />,
      color: colors.redAccent[500]
    },
    {
      id: 4,
      type: 'schedule',
      title: 'Meeting scheduled for tomorrow at 2 PM',
      user: 'David Wilson',
      time: '15 minutes ago',
      priority: 'medium',
      status: 'scheduled',
      icon: <ScheduleIcon />,
      color: colors.yellowAccent[500]
    },
    {
      id: 5,
      type: 'completion',
      title: 'Task "Database Migration" completed',
      user: 'Lisa Brown',
      time: '20 minutes ago',
      priority: 'low',
      status: 'completed',
      icon: <CheckCircleIcon />,
      color: colors.greenAccent[500]
    }
  ];

  useEffect(() => {
    setActivities(mockActivities);
    
    if (isLive) {
      const interval = setInterval(() => {
        // Simulate new activities
        const newActivity = {
          id: Date.now(),
          type: ['project', 'team', 'approval', 'schedule', 'completion'][Math.floor(Math.random() * 5)],
          title: `New ${['project update', 'team change', 'approval request', 'schedule change', 'task completion'][Math.floor(Math.random() * 5)]}`,
          user: ['Sarah Johnson', 'Mike Chen', 'Emily Davis', 'David Wilson', 'Lisa Brown'][Math.floor(Math.random() * 5)],
          time: 'Just now',
          priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          status: ['active', 'pending', 'completed'][Math.floor(Math.random() * 3)],
          icon: <AssignmentIcon />,
          color: colors.blueAccent[500]
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }, 10000); // Add new activity every 10 seconds

      return () => clearInterval(interval);
    }
  }, [isLive, colors.blueAccent]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return colors.redAccent[500];
      case 'medium': return colors.yellowAccent[500];
      case 'low': return colors.greenAccent[500];
      default: return colors.grey[500];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.blueAccent[500];
      case 'pending': return colors.yellowAccent[500];
      case 'completed': return colors.greenAccent[500];
      case 'scheduled': return colors.blueAccent[500];
      default: return colors.grey[500];
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const ActivityItem = ({ activity }) => (
    <ListItem sx={{ 
      py: 2, 
      px: 0,
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: colors.primary[500],
        borderRadius: 2,
        transform: 'translateX(4px)'
      }
    }}>
      <ListItemIcon>
        <Avatar sx={{ 
          bgcolor: activity.color, 
          width: 40, 
          height: 40 
        }}>
          {activity.icon}
        </Avatar>
      </ListItemIcon>
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Typography variant="subtitle2" color="#000000" fontWeight="medium">
              {activity.title}
            </Typography>
            <Chip 
              label={activity.priority}
              size="small"
              sx={{ 
                bgcolor: getPriorityColor(activity.priority),
                color: 'white',
                fontSize: '0.7rem',
                height: 20
              }}
            />
          </Box>
        }
        secondary={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" color="#555555" fontWeight="500">
                by {activity.user} • {activity.time}
              </Typography>
            </Box>
            <Chip 
              label={activity.status}
              size="small"
              sx={{ 
                bgcolor: getStatusColor(activity.status),
                color: 'white',
                fontSize: '0.7rem',
                height: 20,
                textTransform: 'capitalize'
              }}
            />
          </Box>
        }
      />
    </ListItem>
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
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h6" fontWeight="bold" color="#000000">
              {title}
            </Typography>
            <Badge 
              badgeContent={isLive ? "LIVE" : "OFF"} 
              color={isLive ? "success" : "default"}
              sx={{ 
                '& .MuiBadge-badge': { 
                  fontSize: '0.6rem',
                  fontWeight: 'bold'
                }
              }}
            />
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title={isLive ? "Pause Live Updates" : "Start Live Updates"}>
              <IconButton 
                size="small" 
                onClick={() => setIsLive(!isLive)}
                sx={{ 
                  color: isLive ? colors.redAccent?.[500] || '#f44336' : colors.greenAccent?.[500] || '#4caf50',
                  '&:hover': { 
                    bgcolor: isLive ? 'rgba(244, 67, 54, 0.08)' : 'rgba(76, 175, 80, 0.08)',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                {isLive ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Feed">
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
            <Tooltip title="Filter Options">
              <IconButton 
                size="small" 
                sx={{ 
                  color: colors.yellowAccent?.[500] || '#ff9800',
                  '&:hover': { 
                    bgcolor: 'rgba(255, 152, 0, 0.08)',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="More Options">
              <IconButton 
                size="small" 
                sx={{ 
                  color: '#666666',
                  '&:hover': { 
                    bgcolor: 'rgba(102, 102, 102, 0.08)',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Filter Buttons */}
        <Box display="flex" gap={1} mb={3} flexWrap="wrap">
          {['all', 'project', 'team', 'approval', 'schedule', 'completion'].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "contained" : "outlined"}
              size="small"
              onClick={() => setFilter(filterType)}
              sx={{
                textTransform: 'capitalize',
                fontSize: '0.75rem',
                ...(filter === filterType ? {
                  bgcolor: colors.blueAccent[500],
                  '&:hover': { bgcolor: colors.blueAccent[600] }
                } : {
                  borderColor: colors.primary[300],
                  color: colors.grey[300],
                  '&:hover': { 
                    borderColor: colors.blueAccent[500],
                    color: colors.blueAccent[500]
                  }
                })
              }}
            >
              {filterType}
            </Button>
          ))}
        </Box>

        {/* Activity Feed */}
        <Box sx={{ 
          bgcolor: '#ffffff', 
          borderRadius: 2, 
          maxHeight: 400,
          overflowY: 'auto',
          border: `1px solid rgba(0,0,0,0.08)`,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: '#f1f3f4',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: colors.blueAccent?.[500] || '#6870fa',
            borderRadius: '3px',
          },
        }}>
          <List sx={{ p: 1 }}>
            {filteredActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ActivityItem activity={activity} />
                {index < filteredActivities.length - 1 && (
                  <Divider sx={{ bgcolor: colors.primary[300] }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Summary Stats */}
        <Box mt={3} display="flex" justifyContent="space-around">
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold" color={colors.blueAccent[500]}>
              {activities.filter(a => a.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="#555555" fontWeight="500">
              Active
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold" color={colors.yellowAccent[500]}>
              {activities.filter(a => a.status === 'pending').length}
            </Typography>
            <Typography variant="body2" color="#555555" fontWeight="500">
              Pending
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold" color={colors.greenAccent[500]}>
              {activities.filter(a => a.status === 'completed').length}
            </Typography>
            <Typography variant="body2" color="#555555" fontWeight="500">
              Completed
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RealTimeActivityChart;

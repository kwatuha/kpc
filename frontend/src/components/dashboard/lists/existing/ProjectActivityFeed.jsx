import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Comment as CommentIcon,
  Flag as FlagIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Security as RiskIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { tokens } from '../../../../pages/dashboard/theme';

const ProjectActivityFeed = ({ currentUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Mock data for project activities
  const [activities] = useState([
    {
      id: 1,
      type: 'comment',
      user: 'Dr. Aisha Mwangi',
      project: 'Water Management Initiative',
      content: 'Site inspection completed successfully. All safety protocols followed.',
      timestamp: '2 hours ago',
      priority: 'normal',
    },
    {
      id: 2,
      type: 'milestone',
      user: 'John Kiprotich',
      project: 'Healthcare Infrastructure',
      content: 'Phase 1 construction completed ahead of schedule',
      timestamp: '4 hours ago',
      priority: 'high',
    },
    {
      id: 3,
      type: 'risk_change',
      user: 'Grace Akinyi',
      project: 'Education Development',
      content: 'Project marked as HIGH RISK due to budget constraints',
      timestamp: '6 hours ago',
      priority: 'urgent',
    },
    {
      id: 4,
      type: 'comment',
      user: 'Peter Mwangi',
      project: 'Road Infrastructure',
      content: 'Need additional permits for road expansion. Timeline may be affected.',
      timestamp: '8 hours ago',
      priority: 'medium',
    },
    {
      id: 5,
      type: 'milestone',
      user: 'Mary Wanjiku',
      project: 'Housing Development',
      content: 'Foundation work completed. Ready for structural phase.',
      timestamp: '1 day ago',
      priority: 'normal',
    },
    {
      id: 6,
      type: 'risk_change',
      user: 'Dr. Aisha Mwangi',
      project: 'Water Management Initiative',
      content: 'Risk level reduced from HIGH to MEDIUM after successful inspection',
      timestamp: '2 days ago',
      priority: 'high',
    },
    {
      id: 7,
      type: 'comment',
      user: 'John Kiprotich',
      project: 'Healthcare Infrastructure',
      content: 'Budget approval pending. Need to review cost estimates.',
      timestamp: '3 days ago',
      priority: 'medium',
    },
    {
      id: 8,
      type: 'milestone',
      user: 'Grace Akinyi',
      project: 'Education Development',
      content: 'Design phase completed. Moving to construction phase.',
      timestamp: '5 days ago',
      priority: 'normal',
    },
  ]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'comment':
        return <CommentIcon />;
      case 'milestone':
        return <FlagIcon />;
      case 'risk_change':
        return <WarningIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const getActivityColor = (type, priority) => {
    if (type === 'risk_change') {
      return colors.redAccent?.[500] || '#f44336';
    }
    if (type === 'milestone') {
      return colors.greenAccent?.[500] || '#4caf50';
    }
    switch (priority) {
      case 'urgent':
        return colors.redAccent?.[500] || '#f44336';
      case 'high':
        return colors.yellowAccent?.[500] || '#ff9800';
      case 'medium':
        return colors.blueAccent?.[500] || '#2196f3';
      case 'normal':
        return colors.grey[400];
      default:
        return colors.grey[400];
    }
  };

  const getActivityTitle = (type) => {
    switch (type) {
      case 'comment':
        return 'New Comment';
      case 'milestone':
        return 'Milestone Achieved';
      case 'risk_change':
        return 'Risk Status Changed';
      default:
        return 'Activity';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return colors.redAccent?.[500] || '#f44336';
      case 'high':
        return colors.yellowAccent?.[500] || '#ff9800';
      case 'medium':
        return colors.blueAccent?.[500] || '#2196f3';
      case 'normal':
        return colors.grey[400];
      default:
        return colors.grey[400];
    }
  };

  return (
    <Card sx={{ 
      height: '100%',
      borderRadius: 3, 
      bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
      boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
      border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 30px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}25`,
      }
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
            Project Activity Feed
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${activities.length} activities`}
              size="small"
              sx={{ 
                bgcolor: colors.blueAccent?.[500] || '#2196f3',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
            <Chip 
              label={`${activities.filter(activity => activity.priority === 'urgent' || activity.priority === 'high').length} important`}
              size="small"
              sx={{ 
                bgcolor: colors.redAccent?.[500] || '#f44336',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflowY: 'auto' }}>
          {activities.map((activity, index) => (
            <Box key={activity.id}>
              <ListItem sx={{ p: 0, alignItems: 'flex-start' }}>
                <ListItemIcon sx={{ minWidth: 40, mt: 1 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: getActivityColor(activity.type, activity.priority),
                      width: 32,
                      height: 32,
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Typography 
                          variant="subtitle2" 
                          fontWeight="bold" 
                          color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}
                          sx={{ fontSize: '0.9rem' }}
                        >
                          {getActivityTitle(activity.type)}
                        </Typography>
                        <Chip 
                          label={activity.priority.toUpperCase()} 
                          size="small" 
                          sx={{ 
                            bgcolor: getPriorityColor(activity.priority),
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.6rem',
                            height: 18
                          }}
                        />
                        {activity.type === 'milestone' && (
                          <StarIcon sx={{ fontSize: 16, color: colors.yellowAccent?.[500] || '#ff9800' }} />
                        )}
                        {activity.type === 'risk_change' && (
                          <RiskIcon sx={{ fontSize: 16, color: colors.redAccent?.[500] || '#f44336' }} />
                        )}
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}
                        sx={{ fontSize: '0.8rem', mb: 1 }}
                      >
                        {activity.content}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <PersonIcon sx={{ fontSize: 12, color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600] }} />
                          <Typography 
                            variant="caption" 
                            color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                            sx={{ fontSize: '0.7rem' }}
                          >
                            {activity.user}
                          </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <ScheduleIcon sx={{ fontSize: 12, color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600] }} />
                          <Typography 
                            variant="caption" 
                            color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                            sx={{ fontSize: '0.7rem' }}
                          >
                            {activity.timestamp}
                          </Typography>
                        </Box>
                        
                        <Typography 
                          variant="caption" 
                          color={colors.blueAccent?.[500] || '#2196f3'}
                          sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                        >
                          {activity.project}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < activities.length - 1 && (
                <Divider 
                  sx={{ 
                    ml: 5, 
                    borderColor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200] 
                  }} 
                />
              )}
            </Box>
          ))}
        </Box>

        <Box mt={2} pt={2} borderTop={`1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}`}>
          <Typography 
            variant="caption" 
            color={theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600]}
            sx={{ fontSize: '0.7rem' }}
          >
            Real-time updates from all your projects
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectActivityFeed;

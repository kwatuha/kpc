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
  Button,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Warning as OverdueIcon,
  PlayArrow as StartIcon,
  Visibility as ViewIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { tokens } from '../../pages/dashboard/theme';

const AssignedTasksCard = ({ currentUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Mock data for assigned tasks
  const [tasks] = useState([
    {
      id: 1,
      title: 'Foundation Inspection - Water Treatment Plant',
      project: 'Water Treatment Plant Construction',
      type: 'inspection',
      priority: 'high',
      dueDate: '2024-02-15',
      status: 'in_progress',
      progress: 60,
      description: 'Conduct comprehensive foundation inspection and provide detailed report',
      assignedBy: 'Dr. Aisha Mwangi',
      estimatedHours: 8,
      completedHours: 5,
    },
    {
      id: 2,
      title: 'Electrical Installation Review',
      project: 'Healthcare Center Renovation',
      type: 'review',
      priority: 'medium',
      dueDate: '2024-02-20',
      status: 'pending',
      progress: 0,
      description: 'Review electrical installation work and ensure compliance with standards',
      assignedBy: 'John Kiprotich',
      estimatedHours: 6,
      completedHours: 0,
    },
    {
      id: 3,
      title: 'Material Quality Assessment',
      project: 'Road Infrastructure Project',
      type: 'assessment',
      priority: 'urgent',
      dueDate: '2024-02-12',
      status: 'overdue',
      progress: 30,
      description: 'Assess quality of road construction materials and provide certification',
      assignedBy: 'Grace Akinyi',
      estimatedHours: 4,
      completedHours: 1,
    },
    {
      id: 4,
      title: 'Safety Protocol Compliance Check',
      project: 'School Construction',
      type: 'compliance',
      priority: 'high',
      dueDate: '2024-02-18',
      status: 'completed',
      progress: 100,
      description: 'Verify compliance with safety protocols and document findings',
      assignedBy: 'Peter Mwangi',
      estimatedHours: 3,
      completedHours: 3,
    },
  ]);

  const getTaskIcon = (type) => {
    switch (type) {
      case 'inspection':
        return <AssignmentIcon />;
      case 'review':
        return <ViewIcon />;
      case 'assessment':
        return <AssignmentIcon />;
      case 'compliance':
        return <CompletedIcon />;
      default:
        return <AssignmentIcon />;
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
      case 'low':
        return colors.greenAccent?.[500] || '#4caf50';
      default:
        return colors.grey[400];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return colors.greenAccent?.[500] || '#4caf50';
      case 'in_progress':
        return colors.blueAccent?.[500] || '#2196f3';
      case 'pending':
        return colors.yellowAccent?.[500] || '#ff9800';
      case 'overdue':
        return colors.redAccent?.[500] || '#f44336';
      default:
        return colors.grey[400];
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Unknown';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleStartTask = (taskId) => {
    console.log('Starting task:', taskId);
    // TODO: Implement start task functionality
  };

  const handleViewTask = (taskId) => {
    console.log('Viewing task:', taskId);
    // TODO: Implement view task functionality
  };

  const handleAddComment = (taskId) => {
    console.log('Adding comment to task:', taskId);
    // TODO: Implement add comment functionality
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const overdueTasks = tasks.filter(task => task.status === 'overdue').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;

  return (
    <Card sx={{ 
      height: '100%',
      borderRadius: 3, 
      bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
      boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
      border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
            My Assigned Tasks
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${totalTasks} total`}
              size="small"
              sx={{ 
                bgcolor: colors.blueAccent?.[500] || '#6870fa',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
            {overdueTasks > 0 && (
              <Chip 
                label={`${overdueTasks} overdue`}
                size="small"
                sx={{ 
                  bgcolor: colors.redAccent?.[500] || '#f44336',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.7rem'
                }}
              />
            )}
          </Box>
        </Box>

        {/* Summary Stats */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.greenAccent?.[500] || '#4caf50'}30`,
            flex: 1,
            minWidth: 100
          }}>
            <Typography variant="h6" color={colors.greenAccent?.[500] || '#4caf50'} fontWeight="bold">
              {completedTasks}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Completed
            </Typography>
          </Box>
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.blueAccent?.[500] || '#2196f3'}30`,
            flex: 1,
            minWidth: 100
          }}>
            <Typography variant="h6" color={colors.blueAccent?.[500] || '#2196f3'} fontWeight="bold">
              {inProgressTasks}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              In Progress
            </Typography>
          </Box>
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.redAccent?.[500] || '#f44336'}30`,
            flex: 1,
            minWidth: 100
          }}>
            <Typography variant="h6" color={colors.redAccent?.[500] || '#f44336'} fontWeight="bold">
              {overdueTasks}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Overdue
            </Typography>
          </Box>
        </Box>

        {/* Tasks List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
          {tasks.map((task) => (
            <Box 
              key={task.id}
              sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                border: `1px solid ${getStatusColor(task.status)}30`,
                borderLeft: `4px solid ${getStatusColor(task.status)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.primary[200],
                  transform: 'translateX(4px)',
                }
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: getPriorityColor(task.priority),
                    width: 40,
                    height: 40,
                    mt: 0.5
                  }}
                >
                  {getTaskIcon(task.type)}
                </Avatar>
                
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold" 
                      color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}
                    >
                      {task.title}
                    </Typography>
                    <Chip 
                      label={task.priority.toUpperCase()} 
                      size="small" 
                      sx={{ 
                        bgcolor: getPriorityColor(task.priority),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.6rem',
                        height: 18
                      }}
                    />
                    <Chip 
                      label={getStatusText(task.status)} 
                      size="small" 
                      sx={{ 
                        bgcolor: getStatusColor(task.status),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.6rem',
                        height: 18
                      }}
                    />
                    {task.status === 'overdue' && (
                      <Chip 
                        label="OVERDUE" 
                        size="small" 
                        color="error"
                        sx={{ fontSize: '0.6rem', height: 18 }}
                      />
                    )}
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}
                    sx={{ mb: 1 }}
                  >
                    {task.description}
                  </Typography>
                  
                  <Typography 
                    variant="caption" 
                    color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                    sx={{ display: 'block', mb: 1 }}
                  >
                    Project: {task.project} • Assigned by: {task.assignedBy}
                  </Typography>
                  
                  {/* Progress Bar */}
                  {task.progress > 0 && (
                    <Box mb={1}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]} sx={{ fontSize: '0.7rem' }}>
                          Progress: {task.completedHours}/{task.estimatedHours} hours
                        </Typography>
                        <Typography variant="caption" color={colors.blueAccent?.[500] || '#2196f3'} fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
                          {task.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={task.progress}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200],
                          '& .MuiLinearProgress-bar': {
                            bgcolor: colors.blueAccent?.[500] || '#2196f3',
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Box>
                  )}
                  
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography 
                        variant="caption" 
                        color={isOverdue(task.dueDate) ? colors.redAccent?.[500] : theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                        sx={{ fontSize: '0.7rem', fontWeight: isOverdue(task.dueDate) ? 'bold' : 'normal' }}
                      >
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                        {!isOverdue(task.dueDate) && ` (${getDaysUntilDue(task.dueDate)} days left)`}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" gap={1}>
                      {task.status !== 'completed' && (
                        <Button 
                          size="small" 
                          variant="outlined"
                          startIcon={<StartIcon />}
                          onClick={() => handleStartTask(task.id)}
                          sx={{ 
                            borderColor: colors.greenAccent?.[500] || '#4caf50',
                            color: colors.greenAccent?.[500] || '#4caf50',
                            fontSize: '0.6rem',
                            height: 20,
                            minWidth: 50,
                            '&:hover': { 
                              borderColor: colors.greenAccent?.[600] || '#388e3c',
                              bgcolor: colors.greenAccent?.[500] + '10'
                            }
                          }}
                        >
                          Start
                        </Button>
                      )}
                      <Button 
                        size="small" 
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewTask(task.id)}
                        sx={{ 
                          borderColor: colors.blueAccent?.[500] || '#6870fa',
                          color: colors.blueAccent?.[500] || '#6870fa',
                          fontSize: '0.6rem',
                          height: 20,
                          minWidth: 50,
                          '&:hover': { 
                            borderColor: colors.blueAccent?.[600] || '#535ac8',
                            bgcolor: colors.blueAccent?.[500] + '10'
                          }
                        }}
                      >
                        View
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined"
                        startIcon={<CommentIcon />}
                        onClick={() => handleAddComment(task.id)}
                        sx={{ 
                          borderColor: colors.yellowAccent?.[500] || '#ff9800',
                          color: colors.yellowAccent?.[500] || '#ff9800',
                          fontSize: '0.6rem',
                          height: 20,
                          minWidth: 50,
                          '&:hover': { 
                            borderColor: colors.yellowAccent?.[600] || '#f57c00',
                            bgcolor: colors.yellowAccent?.[500] + '10'
                          }
                        }}
                      >
                        Comment
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssignedTasksCard;












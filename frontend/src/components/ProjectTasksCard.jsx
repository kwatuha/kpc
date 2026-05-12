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
  ListItemSecondaryAction,
  IconButton,
  Avatar,
  LinearProgress,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  AttachMoney as AttachMoneyIcon,
  Engineering as EngineeringIcon,
  Approval as ApprovalIcon,
  Comment as CommentIcon,
  PriorityHigh as PriorityHighIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
} from '@mui/icons-material';
import { tokens } from '../pages/dashboard/theme';

const ProjectTasksCard = ({ currentUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Mock data for project tasks
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Site Inspection - Water Treatment Plant',
      project: 'Water Management Initiative',
      type: 'inspection',
      priority: 'high',
      dueDate: '2024-02-15',
      status: 'pending',
      assignedBy: 'Dr. Aisha Mwangi',
      progress: 0,
      description: 'Conduct comprehensive site inspection for water treatment facility',
    },
    {
      id: 2,
      title: 'Budget Approval - Health Center',
      project: 'Healthcare Infrastructure',
      type: 'approval',
      priority: 'urgent',
      dueDate: '2024-02-10',
      status: 'in_progress',
      assignedBy: 'John Kiprotich',
      progress: 60,
      description: 'Review and approve budget allocation for new health center',
    },
    {
      id: 3,
      title: 'Budget Preparation - School Construction',
      project: 'Education Development',
      type: 'budget',
      priority: 'medium',
      dueDate: '2024-02-20',
      status: 'pending',
      assignedBy: 'Grace Akinyi',
      progress: 0,
      description: 'Prepare detailed budget breakdown for school construction project',
    },
    {
      id: 4,
      title: 'Risk Assessment Review',
      project: 'Road Infrastructure',
      type: 'review',
      priority: 'high',
      dueDate: '2024-02-12',
      status: 'in_progress',
      assignedBy: 'Peter Mwangi',
      progress: 40,
      description: 'Review and update risk assessment for road construction project',
    },
    {
      id: 5,
      title: 'Contractor Evaluation',
      project: 'Housing Development',
      type: 'evaluation',
      priority: 'medium',
      dueDate: '2024-02-18',
      status: 'pending',
      assignedBy: 'Mary Wanjiku',
      progress: 0,
      description: 'Evaluate contractor proposals for housing development project',
    },
  ]);

  const getTaskIcon = (type) => {
    switch (type) {
      case 'inspection':
        return <EngineeringIcon />;
      case 'approval':
        return <ApprovalIcon />;
      case 'budget':
        return <AttachMoneyIcon />;
      case 'review':
        return <CommentIcon />;
      case 'evaluation':
        return <AssignmentIcon />;
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

  const handleTaskAction = (taskId, action) => {
    console.log(`Task ${taskId}: ${action}`);
    // TODO: Implement task actions
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

  return (
    <Card sx={{ 
      height: '100%',
      borderRadius: 3, 
      bgcolor: '#ffffff',
      boxShadow: `0 4px 20px rgba(0,0,0,0.04)`,
      border: `1px solid rgba(0,0,0,0.08)`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 30px rgba(0,0,0,0.08)`,
      }
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold" color="#000000">
            My Project Tasks
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${tasks.filter(task => task.status === 'pending' || task.status === 'in_progress').length} active`}
              size="small"
              sx={{ 
                bgcolor: colors.blueAccent?.[500] || '#2196f3',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
            <Chip 
              label={`${tasks.filter(task => isOverdue(task.dueDate)).length} overdue`}
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
          {tasks.map((task) => (
            <Box 
              key={task.id}
              sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: '#ffffff',
                border: `1px solid rgba(0,0,0,0.08)`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#f8fafc',
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
                      color="#000000"
                      sx={{ fontSize: '0.9rem' }}
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
                        height: 20
                      }}
                    />
                    {isOverdue(task.dueDate) && (
                      <Chip 
                        icon={<PriorityHighIcon />}
                        label="OVERDUE" 
                        size="small" 
                        color="error"
                        sx={{ fontSize: '0.6rem', height: 20 }}
                      />
                    )}
                  </Box>
                  
                  <Typography 
                    variant="caption" 
                    color="#444444"
                    fontWeight="600"
                    sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}
                  >
                    {task.project} • Assigned by {task.assignedBy}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="#333333"
                    fontWeight="500"
                    sx={{ fontSize: '0.8rem', mb: 2 }}
                  >
                    {task.description}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ScheduleIcon sx={{ fontSize: 14, color: '#666666' }} />
                      <Typography 
                        variant="caption" 
                        color={isOverdue(task.dueDate) ? colors.redAccent?.[500] : '#555555'}
                        fontWeight="600"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                        {!isOverdue(task.dueDate) && ` (${getDaysUntilDue(task.dueDate)} days left)`}
                      </Typography>
                    </Box>
                    
                    <Chip 
                      label={getStatusText(task.status)} 
                      size="small" 
                      sx={{ 
                        bgcolor: getStatusColor(task.status),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.6rem',
                        height: 20
                      }}
                    />
                  </Box>
                  
                  {task.progress > 0 && (
                    <Box>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" color="#555555" fontWeight="600" sx={{ fontSize: '0.7rem' }}>
                          Progress
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
                          bgcolor: '#e5e7eb',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: colors.blueAccent?.[500] || '#2196f3',
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Box>
                  )}
                </Box>
                
                <Box display="flex" flexDirection="column" gap={1}>
                  <Tooltip title="Start Task">
                    <IconButton 
                      size="small"
                      onClick={() => handleTaskAction(task.id, 'start')}
                      sx={{ 
                        color: colors.greenAccent?.[500] || '#4caf50',
                        '&:hover': { bgcolor: colors.greenAccent?.[500] + '20' }
                      }}
                    >
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Details">
                    <IconButton 
                      size="small"
                      onClick={() => handleTaskAction(task.id, 'view')}
                      sx={{ 
                        color: colors.blueAccent?.[500] || '#2196f3',
                        '&:hover': { bgcolor: colors.blueAccent?.[500] + '20' }
                      }}
                    >
                      <AssignmentIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Box mt={2} pt={2} borderTop={`1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}`}>
          <Typography 
            variant="caption" 
            color="#666666"
            fontWeight="500"
            sx={{ fontSize: '0.7rem' }}
          >
            Click on any task to view details and take action
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectTasksCard;

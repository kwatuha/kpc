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
  Alert,
  AlertTitle,
  useTheme,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';
import { tokens } from '../../../../pages/dashboard/theme';

const ProjectAlertsCard = ({ currentUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Mock data for project alerts
  const [alerts] = useState([
    {
      id: 1,
      type: 'high_risk',
      title: 'High Risk Project Alert',
      project: 'Water Management Initiative',
      description: 'Project marked as HIGH RISK due to budget overruns and timeline delays',
      severity: 'critical',
      timestamp: '2 hours ago',
      assignedTo: 'Dr. Aisha Mwangi',
      actionRequired: 'Immediate budget review and timeline adjustment',
      status: 'active',
    },
    {
      id: 2,
      type: 'budget_exceeded',
      title: 'Budget Exceeded',
      project: 'Healthcare Infrastructure',
      description: 'Project budget exceeded by 15%. Additional funding required.',
      severity: 'high',
      timestamp: '4 hours ago',
      assignedTo: 'John Kiprotich',
      actionRequired: 'Budget approval for additional funding',
      status: 'pending',
    },
    {
      id: 3,
      type: 'timeline_delay',
      title: 'Timeline Delay',
      project: 'Education Development',
      description: 'Project delayed by 2 weeks due to permit issues',
      severity: 'medium',
      timestamp: '6 hours ago',
      assignedTo: 'Grace Akinyi',
      actionRequired: 'Update project timeline and stakeholder communication',
      status: 'active',
    },
    {
      id: 4,
      type: 'quality_issue',
      title: 'Quality Control Issue',
      project: 'Road Infrastructure',
      description: 'Quality standards not met in recent inspection. Re-work required.',
      severity: 'high',
      timestamp: '8 hours ago',
      assignedTo: 'Peter Mwangi',
      actionRequired: 'Immediate re-inspection and corrective measures',
      status: 'active',
    },
    {
      id: 5,
      type: 'resource_shortage',
      title: 'Resource Shortage',
      project: 'Housing Development',
      description: 'Critical materials shortage affecting construction progress',
      severity: 'medium',
      timestamp: '1 day ago',
      assignedTo: 'Mary Wanjiku',
      actionRequired: 'Source alternative suppliers or adjust timeline',
      status: 'pending',
    },
  ]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'high_risk':
        return <ErrorIcon />;
      case 'budget_exceeded':
        return <TrendingUpIcon />;
      case 'timeline_delay':
        return <ScheduleIcon />;
      case 'quality_issue':
        return <WarningIcon />;
      case 'resource_shortage':
        return <AssignmentIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
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

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'critical':
        return 'CRITICAL';
      case 'high':
        return 'HIGH';
      case 'medium':
        return 'MEDIUM';
      case 'low':
        return 'LOW';
      default:
        return 'UNKNOWN';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return colors.redAccent?.[500] || '#f44336';
      case 'pending':
        return colors.yellowAccent?.[500] || '#ff9800';
      case 'resolved':
        return colors.greenAccent?.[500] || '#4caf50';
      default:
        return colors.grey[400];
    }
  };

  const handleAlertAction = (alertId, action) => {
    console.log(`Alert ${alertId}: ${action}`);
    // TODO: Implement alert actions
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high');
  const activeAlerts = alerts.filter(alert => alert.status === 'active');

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
            Project Alerts
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${criticalAlerts.length} critical`}
              size="small"
              sx={{ 
                bgcolor: colors.redAccent?.[500] || '#f44336',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
            <Chip 
              label={`${activeAlerts.length} active`}
              size="small"
              sx={{ 
                bgcolor: colors.yellowAccent?.[500] || '#ff9800',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
          </Box>
        </Box>

        {criticalAlerts.length > 0 && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              bgcolor: theme.palette.mode === 'dark' ? colors.redAccent?.[900] : colors.redAccent?.[50],
              border: `1px solid ${colors.redAccent?.[500] || '#f44336'}`,
            }}
          >
            <AlertTitle sx={{ fontWeight: 'bold' }}>
              {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''} Require Immediate Attention
            </AlertTitle>
            Please review and take action on high-priority alerts.
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
          {alerts.map((alert) => (
            <Box 
              key={alert.id}
              sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                border: `1px solid ${getSeverityColor(alert.severity)}30`,
                borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
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
                    bgcolor: getSeverityColor(alert.severity),
                    width: 40,
                    height: 40,
                    mt: 0.5
                  }}
                >
                  {getAlertIcon(alert.type)}
                </Avatar>
                
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold" 
                      color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}
                      sx={{ fontSize: '0.9rem' }}
                    >
                      {alert.title}
                    </Typography>
                    <Chip 
                      label={getSeverityText(alert.severity)} 
                      size="small" 
                      sx={{ 
                        bgcolor: getSeverityColor(alert.severity),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.6rem',
                        height: 20
                      }}
                    />
                    <Chip 
                      label={alert.status.toUpperCase()} 
                      size="small" 
                      sx={{ 
                        bgcolor: getStatusColor(alert.status),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.6rem',
                        height: 20
                      }}
                    />
                    {alert.severity === 'critical' && (
                      <PriorityHighIcon sx={{ color: colors.redAccent?.[500] || '#f44336', fontSize: 16 }} />
                    )}
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}
                    sx={{ fontSize: '0.8rem', mb: 1 }}
                  >
                    {alert.description}
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 1, 
                      bgcolor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.primary[200],
                      border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[300]}`,
                      mb: 1
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                      sx={{ fontSize: '0.7rem', fontWeight: 'bold', display: 'block', mb: 0.5 }}
                    >
                      Action Required:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[800]}
                      sx={{ fontSize: '0.8rem' }}
                    >
                      {alert.actionRequired}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PersonIcon sx={{ fontSize: 12, color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600] }} />
                        <Typography 
                          variant="caption" 
                          color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                          sx={{ fontSize: '0.7rem' }}
                        >
                          {alert.assignedTo}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <ScheduleIcon sx={{ fontSize: 12, color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600] }} />
                        <Typography 
                          variant="caption" 
                          color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                          sx={{ fontSize: '0.7rem' }}
                        >
                          {alert.timestamp}
                        </Typography>
                      </Box>
                      
                      <Typography 
                        variant="caption" 
                        color={colors.blueAccent?.[500] || '#2196f3'}
                        sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}
                      >
                        {alert.project}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" gap={1}>
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                        sx={{ 
                          bgcolor: colors.blueAccent?.[500] || '#2196f3',
                          fontSize: '0.7rem',
                          height: 24,
                          minWidth: 60,
                          '&:hover': { bgcolor: colors.blueAccent?.[600] || '#1976d2' }
                        }}
                      >
                        Acknowledge
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleAlertAction(alert.id, 'resolve')}
                        sx={{ 
                          borderColor: colors.greenAccent?.[500] || '#4caf50',
                          color: colors.greenAccent?.[500] || '#4caf50',
                          fontSize: '0.7rem',
                          height: 24,
                          minWidth: 60,
                          '&:hover': { 
                            borderColor: colors.greenAccent?.[600] || '#388e3c',
                            bgcolor: colors.greenAccent?.[500] + '10'
                          }
                        }}
                      >
                        Resolve
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        <Box mt={2} pt={2} borderTop={`1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}`}>
          <Typography 
            variant="caption" 
            color={theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600]}
            sx={{ fontSize: '0.7rem' }}
          >
            Monitor project health and take immediate action on critical alerts
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectAlertsCard;

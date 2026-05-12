import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { tokens } from '../../pages/dashboard/theme';

const ContractorMetricsCard = ({ currentUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Mock contractor metrics data
  const metrics = {
    totalProjects: 8,
    activeProjects: 5,
    completedProjects: 3,
    totalTasks: 24,
    completedTasks: 18,
    pendingTasks: 6,
    overdueTasks: 2,
    totalEarnings: 450000,
    pendingPayments: 85000,
    completedPayments: 365000,
    averageRating: 4.7,
    onTimeDelivery: 85,
    clientSatisfaction: 92,
    workQuality: 88,
  };

  const getProgressColor = (value) => {
    if (value >= 90) return colors.greenAccent?.[500] || '#4caf50';
    if (value >= 70) return colors.yellowAccent?.[500] || '#ff9800';
    return colors.redAccent?.[500] || '#f44336';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card sx={{ 
      height: '100%',
      borderRadius: 3, 
      bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
      boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
      border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: colors.blueAccent?.[500] || '#6870fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
              My Performance
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Contractor metrics and achievements
            </Typography>
          </Box>
        </Box>

        {/* Key Stats Grid */}
        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={2} mb={3}>
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.blueAccent?.[500] || '#2196f3'}30`,
            textAlign: 'center'
          }}>
            <Typography variant="h4" color={colors.blueAccent?.[500] || '#2196f3'} fontWeight="bold">
              {metrics.totalProjects}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Total Projects
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.greenAccent?.[500] || '#4caf50'}30`,
            textAlign: 'center'
          }}>
            <Typography variant="h4" color={colors.greenAccent?.[500] || '#4caf50'} fontWeight="bold">
              {metrics.completedTasks}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Tasks Done
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.yellowAccent?.[500] || '#ff9800'}30`,
            textAlign: 'center'
          }}>
            <Typography variant="h4" color={colors.yellowAccent?.[500] || '#ff9800'} fontWeight="bold">
              {metrics.averageRating}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Avg Rating
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.blueAccent?.[500] || '#2196f3'}30`,
            textAlign: 'center'
          }}>
            <Typography variant="h4" color={colors.blueAccent?.[500] || '#2196f3'} fontWeight="bold">
              {formatCurrency(metrics.totalEarnings)}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Total Earned
            </Typography>
          </Box>
        </Box>

        {/* Performance Metrics */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={1}>
            Performance Metrics
          </Typography>
          
          {/* On-Time Delivery */}
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}>
                On-Time Delivery
              </Typography>
              <Typography variant="body2" color={getProgressColor(metrics.onTimeDelivery)} fontWeight="bold">
                {metrics.onTimeDelivery}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metrics.onTimeDelivery}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200],
                '& .MuiLinearProgress-bar': {
                  bgcolor: getProgressColor(metrics.onTimeDelivery),
                  borderRadius: 3,
                }
              }}
            />
          </Box>

          {/* Client Satisfaction */}
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}>
                Client Satisfaction
              </Typography>
              <Typography variant="body2" color={getProgressColor(metrics.clientSatisfaction)} fontWeight="bold">
                {metrics.clientSatisfaction}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metrics.clientSatisfaction}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200],
                '& .MuiLinearProgress-bar': {
                  bgcolor: getProgressColor(metrics.clientSatisfaction),
                  borderRadius: 3,
                }
              }}
            />
          </Box>

          {/* Work Quality */}
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}>
                Work Quality Score
              </Typography>
              <Typography variant="body2" color={getProgressColor(metrics.workQuality)} fontWeight="bold">
                {metrics.workQuality}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={metrics.workQuality}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200],
                '& .MuiLinearProgress-bar': {
                  bgcolor: getProgressColor(metrics.workQuality),
                  borderRadius: 3,
                }
              }}
            />
          </Box>
        </Box>

        {/* Financial Summary */}
        <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={2}>
            Financial Summary
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}>
              Completed Payments
            </Typography>
            <Typography variant="body2" color={colors.greenAccent?.[500] || '#4caf50'} fontWeight="bold">
              {formatCurrency(metrics.completedPayments)}
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}>
              Pending Payments
            </Typography>
            <Typography variant="body2" color={colors.yellowAccent?.[500] || '#ff9800'} fontWeight="bold">
              {formatCurrency(metrics.pendingPayments)}
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}>
              Total Earnings
            </Typography>
            <Typography variant="body2" color={colors.blueAccent?.[500] || '#2196f3'} fontWeight="bold">
              {formatCurrency(metrics.totalEarnings)}
            </Typography>
          </Box>
        </Box>

        {/* Task Status Summary */}
        <Box sx={{ mt: 2, p: 2, bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={2}>
            Task Status
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <CompletedIcon sx={{ fontSize: 16, color: colors.greenAccent?.[500] || '#4caf50' }} />
              <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}>
                Completed
              </Typography>
            </Box>
            <Typography variant="body2" color={colors.greenAccent?.[500] || '#4caf50'} fontWeight="bold">
              {metrics.completedTasks}
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <PendingIcon sx={{ fontSize: 16, color: colors.yellowAccent?.[500] || '#ff9800' }} />
              <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}>
                Pending
              </Typography>
            </Box>
            <Typography variant="body2" color={colors.yellowAccent?.[500] || '#ff9800'} fontWeight="bold">
              {metrics.pendingTasks}
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1}>
              <AssignmentIcon sx={{ fontSize: 16, color: colors.redAccent?.[500] || '#f44336' }} />
              <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}>
                Overdue
              </Typography>
            </Box>
            <Typography variant="body2" color={colors.redAccent?.[500] || '#f44336'} fontWeight="bold">
              {metrics.overdueTasks}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ContractorMetricsCard;












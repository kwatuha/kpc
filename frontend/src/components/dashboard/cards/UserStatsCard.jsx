import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, CircularProgress } from '@mui/material';
import { People as PeopleIcon, TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import dashboardService from '../../../api/dashboardService';

/**
 * User Statistics Card Component
 * 
 * Displays user registration statistics including total users,
 * active users, and growth metrics with visual indicators.
 */
const UserStatsCard = ({ user, showGrowth = true, timeRange = '30d' }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const data = await dashboardService.getStatistics(user.id);
        
        setStats({
          totalUsers: data.users?.totalUsers || 0,
          activeUsers: data.users?.activeUsers || 0,
          newUsers: 0, // This would need to be calculated from a date range
          growthRate: 0 // This would need historical data to calculate
        });
      } catch (error) {
        console.error('Error fetching user statistics:', error);
        // Keep default stats on error
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [user?.id]);

  if (loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="h2" fontWeight="bold">
            User Statistics
          </Typography>
          <PeopleIcon color="primary" />
        </Box>
        
        <Box mb={2}>
          <Typography variant="h4" component="div" color="primary" fontWeight="bold">
            {stats.totalUsers.toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Users
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" mb={2}>
          <Box>
            <Typography variant="h6" color="success.main">
              {stats.activeUsers.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Active Users
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="h6" color="info.main">
              {stats.newUsers}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              New ({timeRange})
            </Typography>
          </Box>
        </Box>

        {showGrowth && (
          <Box display="flex" alignItems="center" gap={1}>
            <TrendingUpIcon fontSize="small" color="success" />
            <Chip 
              label={`+${stats.growthRate}%`} 
              size="small" 
              color="success" 
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              vs last period
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;









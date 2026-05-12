import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip, CircularProgress } from '@mui/material';
import { Assignment as ProjectIcon } from '@mui/icons-material';
import dashboardService from '../../../api/dashboardService';

/**
 * Project Metrics Card Component
 * 
 * Overview of project statistics including total, active, 
 * and completed projects with progress indicators.
 */
const ProjectMetricsCard = ({ user, showDetails = true }) => {
  const [metrics, setMetrics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    completionRate: 0,
    onTrackProjects: 0,
    delayedProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const data = await dashboardService.getStatistics(user.id);
        
        const total = data.projects?.totalProjects || 0;
        const completed = data.projects?.completedProjects || 0;
        const active = data.projects?.activeProjects || 0;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        setMetrics({
          totalProjects: total,
          activeProjects: active,
          completedProjects: completed,
          completionRate: completionRate,
          onTrackProjects: active, // Simplified - would need more logic
          delayedProjects: 0 // Would need milestone/deadline data
        });
      } catch (error) {
        console.error('Error fetching project metrics:', error);
        // Keep default metrics on error
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
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
            Project Metrics
          </Typography>
          <ProjectIcon color="primary" />
        </Box>
        
        <Box mb={2}>
          <Typography variant="h4" component="div" color="primary" fontWeight="bold">
            {metrics.totalProjects}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Projects
          </Typography>
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2">Completion Rate</Typography>
            <Typography variant="body2" fontWeight="bold">
              {metrics.completionRate}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={metrics.completionRate} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {showDetails && (
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Chip 
              label={`${metrics.activeProjects} Active`} 
              size="small" 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              label={`${metrics.completedProjects} Completed`} 
              size="small" 
              color="success" 
              variant="outlined"
            />
            <Chip 
              label={`${metrics.onTrackProjects} On Track`} 
              size="small" 
              color="info" 
              variant="outlined"
            />
            {metrics.delayedProjects > 0 && (
              <Chip 
                label={`${metrics.delayedProjects} Delayed`} 
                size="small" 
                color="warning" 
                variant="outlined"
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectMetricsCard;









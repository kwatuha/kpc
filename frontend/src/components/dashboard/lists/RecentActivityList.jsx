import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Box } from '@mui/material';
import { Person as PersonIcon, Assignment as ProjectIcon, AttachMoney as MoneyIcon } from '@mui/icons-material';

/**
 * Recent Activity List Component
 * 
 * List of recent user activities, project updates, and system events
 * with timestamps and user information.
 */
const RecentActivityList = ({ user, limit = 5, showTimestamp = true }) => {
  // Mock data - in real implementation, this would come from props or API
  const activities = [
    {
      id: 1,
      type: 'user',
      title: 'New user registered',
      description: 'John Doe joined the system',
      timestamp: '2 minutes ago',
      icon: PersonIcon,
      color: 'primary'
    },
    {
      id: 2,
      type: 'project',
      title: 'Project milestone completed',
      description: 'Water Infrastructure Project - Phase 1 completed',
      timestamp: '15 minutes ago',
      icon: ProjectIcon,
      color: 'success'
    },
    {
      id: 3,
      type: 'budget',
      title: 'Budget allocation updated',
      description: 'Health Program budget increased by $50,000',
      timestamp: '1 hour ago',
      icon: MoneyIcon,
      color: 'info'
    },
    {
      id: 4,
      type: 'user',
      title: 'User role updated',
      description: 'Jane Smith promoted to Project Manager',
      timestamp: '2 hours ago',
      icon: PersonIcon,
      color: 'warning'
    },
    {
      id: 5,
      type: 'project',
      title: 'New project created',
      description: 'Education Initiative Project started',
      timestamp: '3 hours ago',
      icon: ProjectIcon,
      color: 'primary'
    }
  ].slice(0, limit);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" mb={2}>
          Recent Activity
        </Typography>
        
        <List sx={{ py: 0 }}>
          {activities.map((activity, index) => (
            <ListItem 
              key={activity.id} 
              sx={{ 
                px: 0, 
                py: 1,
                borderBottom: index < activities.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider'
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: `${activity.color}.main`, width: 32, height: 32 }}>
                  <activity.icon fontSize="small" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight="medium">
                    {activity.title}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {activity.description}
                    </Typography>
                    {showTimestamp && (
                      <Typography variant="caption" color="text.secondary">
                        {activity.timestamp}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivityList;










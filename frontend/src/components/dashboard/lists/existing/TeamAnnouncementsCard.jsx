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
  useTheme,
} from '@mui/material';
import {
  Announcement as AnnouncementIcon,
  Campaign as CampaignIcon,
  Event as EventIcon,
  Policy as PolicyIcon,
  Star as StarIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  PriorityHigh as PriorityHighIcon,
} from '@mui/icons-material';
import { tokens } from '../../../../pages/dashboard/theme';

const TeamAnnouncementsCard = ({ currentUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Mock data for team announcements
  const [announcements] = useState([
    {
      id: 1,
      type: 'company_news',
      title: 'Q1 2024 Company Performance Review',
      content: 'We are pleased to announce that our Q1 performance exceeded expectations with a 15% increase in project completion rates.',
      author: 'CEO Office',
      timestamp: '2 hours ago',
      priority: 'high',
      category: 'Company News',
    },
    {
      id: 2,
      type: 'project_update',
      title: 'Healthcare Infrastructure Project Milestone',
      content: 'The new health center construction has reached 75% completion. Expected delivery date: March 15, 2024.',
      author: 'Project Management',
      timestamp: '4 hours ago',
      priority: 'medium',
      category: 'Project Update',
    },
    {
      id: 3,
      type: 'policy_change',
      title: 'Updated Safety Protocols',
      content: 'New safety protocols for field operations will be implemented starting next week. Please review the attached guidelines.',
      author: 'Safety Department',
      timestamp: '1 day ago',
      priority: 'urgent',
      category: 'Policy Change',
    },
    {
      id: 4,
      type: 'event',
      title: 'Team Building Workshop',
      content: 'Join us for a team building workshop on March 20th. Registration is now open. Limited spots available.',
      author: 'HR Department',
      timestamp: '2 days ago',
      priority: 'medium',
      category: 'Event',
    },
    {
      id: 5,
      type: 'achievement',
      title: 'Employee Recognition - Dr. Aisha Mwangi',
      content: 'Congratulations to Dr. Aisha Mwangi for outstanding leadership in the Water Management project. Well deserved!',
      author: 'Management Team',
      timestamp: '3 days ago',
      priority: 'low',
      category: 'Recognition',
    },
  ]);

  const getAnnouncementIcon = (type) => {
    switch (type) {
      case 'company_news':
        return <CampaignIcon />;
      case 'project_update':
        return <AnnouncementIcon />;
      case 'policy_change':
        return <PolicyIcon />;
      case 'event':
        return <EventIcon />;
      case 'achievement':
        return <StarIcon />;
      default:
        return <AnnouncementIcon />;
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

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'URGENT';
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

  const handleAnnouncementAction = (announcementId, action) => {
    console.log(`Announcement ${announcementId}: ${action}`);
    // TODO: Implement announcement actions
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
            Team Announcements
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${announcements.filter(a => a.priority === 'urgent' || a.priority === 'high').length} important`}
              size="small"
              sx={{ 
                bgcolor: colors.redAccent?.[500] || '#f44336',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
            <Button
              size="small"
              variant="outlined"
              sx={{ 
                borderColor: colors.blueAccent?.[500] || '#6870fa',
                color: colors.blueAccent?.[500] || '#6870fa',
                fontSize: '0.7rem',
                height: 24,
                minWidth: 60,
                '&:hover': { 
                  borderColor: colors.blueAccent?.[600] || '#535ac8',
                  bgcolor: colors.blueAccent?.[500] + '10'
                }
              }}
            >
              View All
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
          {announcements.map((announcement) => (
            <Box 
              key={announcement.id}
              sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                border: `1px solid ${getPriorityColor(announcement.priority)}30`,
                borderLeft: `4px solid ${getPriorityColor(announcement.priority)}`,
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
                    bgcolor: getPriorityColor(announcement.priority),
                    width: 40,
                    height: 40,
                    mt: 0.5
                  }}
                >
                  {getAnnouncementIcon(announcement.type)}
                </Avatar>
                
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold" 
                      color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}
                    >
                      {announcement.title}
                    </Typography>
                    <Chip 
                      label={getPriorityText(announcement.priority)} 
                      size="small" 
                      sx={{ 
                        bgcolor: getPriorityColor(announcement.priority),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.6rem',
                        height: 18
                      }}
                    />
                    {announcement.priority === 'urgent' && (
                      <PriorityHighIcon sx={{ color: colors.redAccent?.[500] || '#f44336', fontSize: 16 }} />
                    )}
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}
                    sx={{ mb: 2 }}
                  >
                    {announcement.content}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <PersonIcon sx={{ fontSize: 12, color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600] }} />
                        <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
                          {announcement.author}
                        </Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <ScheduleIcon sx={{ fontSize: 12, color: theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600] }} />
                        <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
                          {announcement.timestamp}
                        </Typography>
                      </Box>
                      
                      <Chip 
                        label={announcement.category} 
                        size="small" 
                        sx={{ 
                          bgcolor: colors.blueAccent?.[500] || '#6870fa',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.6rem',
                          height: 18
                        }}
                      />
                    </Box>
                    
                    <Box display="flex" gap={1}>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleAnnouncementAction(announcement.id, 'read')}
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
                        Read
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleAnnouncementAction(announcement.id, 'share')}
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
                        Share
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

export default TeamAnnouncementsCard;

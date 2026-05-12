import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Circle as CircleIcon,
  MoreVert as MoreVertIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { tokens } from '../../../../pages/dashboard/theme';

const ActiveUsersCard = ({ currentUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for active users - in real implementation, this would come from an API
  useEffect(() => {
    const mockActiveUsers = [
      {
        id: 1,
        name: 'Dr. Aisha Mwangi',
        role: 'Project Manager',
        department: 'Health',
        avatar: null,
        status: 'online',
        lastSeen: '2 minutes ago',
        isTyping: false,
        unreadMessages: 3,
      },
      {
        id: 2,
        name: 'John Kiprotich',
        role: 'Data Analyst',
        department: 'Analytics',
        avatar: null,
        status: 'online',
        lastSeen: '5 minutes ago',
        isTyping: true,
        unreadMessages: 0,
      },
      {
        id: 3,
        name: 'Grace Akinyi',
        role: 'Field Coordinator',
        department: 'Operations',
        avatar: null,
        status: 'away',
        lastSeen: '15 minutes ago',
        isTyping: false,
        unreadMessages: 1,
      },
      {
        id: 4,
        name: 'Peter Mwangi',
        role: 'Technical Lead',
        department: 'IT',
        avatar: null,
        status: 'online',
        lastSeen: '1 minute ago',
        isTyping: false,
        unreadMessages: 0,
      },
      {
        id: 5,
        name: 'Mary Wanjiku',
        role: 'Research Assistant',
        department: 'Research',
        avatar: null,
        status: 'busy',
        lastSeen: '30 minutes ago',
        isTyping: false,
        unreadMessages: 2,
      },
    ];

    // Simulate API call
    setTimeout(() => {
      setActiveUsers(mockActiveUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return colors.greenAccent?.[500] || '#4caf50';
      case 'away':
        return colors.yellowAccent?.[500] || '#ff9800';
      case 'busy':
        return colors.redAccent?.[500] || '#f44336';
      default:
        return colors.grey[400];
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      default:
        return 'Offline';
    }
  };

  const handleStartChat = (user) => {
    console.log('Starting chat with:', user.name);
    // TODO: Implement chat functionality
  };

  const handleVideoCall = (user) => {
    console.log('Starting video call with:', user.name);
    // TODO: Implement video call functionality
  };

  const handlePhoneCall = (user) => {
    console.log('Starting phone call with:', user.name);
    // TODO: Implement phone call functionality
  };

  if (loading) {
    return (
      <Card sx={{ 
        height: '100%',
        borderRadius: 3, 
        bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
        boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
        border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={3}>
            Active Users
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Loading active users...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

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
            Active Users
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${activeUsers.filter(user => user.status === 'online').length} online`}
              size="small"
              sx={{ 
                bgcolor: colors.greenAccent?.[500] || '#4caf50',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
            <IconButton size="small" sx={{ color: colors.blueAccent?.[500] || '#6870fa' }}>
              <ChatIcon />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflowY: 'auto' }}>
          {activeUsers.map((user) => (
            <ListItem 
              key={user.id}
              sx={{ 
                p: 1,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                }
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <CircleIcon 
                      sx={{ 
                        color: getStatusColor(user.status),
                        fontSize: 12,
                        bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
                        borderRadius: '50%',
                        p: 0.5
                      }} 
                    />
                  }
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: colors.blueAccent?.[500] || '#6870fa',
                      width: 40,
                      height: 40,
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold" 
                      color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}
                      sx={{ fontSize: '0.9rem' }}
                    >
                      {user.name}
                    </Typography>
                    {user.isTyping && (
                      <Chip 
                        label="typing..." 
                        size="small" 
                        sx={{ 
                          bgcolor: colors.blueAccent?.[500] || '#6870fa',
                          color: 'white',
                          fontSize: '0.6rem',
                          height: 20
                        }}
                      />
                    )}
                    {user.unreadMessages > 0 && (
                      <Badge 
                        badgeContent={user.unreadMessages} 
                        color="error"
                        sx={{ 
                          '& .MuiBadge-badge': { 
                            fontSize: '0.6rem',
                            height: 16,
                            minWidth: 16
                          } 
                        }}
                      >
                        <Box />
                      </Badge>
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography 
                      variant="caption" 
                      color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                      sx={{ fontSize: '0.75rem' }}
                    >
                      {user.role} • {user.department}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <CircleIcon 
                        sx={{ 
                          color: getStatusColor(user.status),
                          fontSize: 8
                        }} 
                      />
                      <Typography 
                        variant="caption" 
                        color={getStatusColor(user.status)}
                        sx={{ fontSize: '0.7rem', fontWeight: 'medium' }}
                      >
                        {getStatusText(user.status)} • {user.lastSeen}
                      </Typography>
                    </Box>
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                <Box display="flex" gap={0.5}>
                  <Tooltip title="Start Chat">
                    <IconButton 
                      size="small"
                      onClick={() => handleStartChat(user)}
                      sx={{ 
                        color: colors.blueAccent?.[500] || '#6870fa',
                        '&:hover': { bgcolor: colors.blueAccent?.[500] + '20' }
                      }}
                    >
                      <ChatIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Video Call">
                    <IconButton 
                      size="small"
                      onClick={() => handleVideoCall(user)}
                      sx={{ 
                        color: colors.greenAccent?.[500] || '#4caf50',
                        '&:hover': { bgcolor: colors.greenAccent?.[500] + '20' }
                      }}
                    >
                      <VideoCallIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Phone Call">
                    <IconButton 
                      size="small"
                      onClick={() => handlePhoneCall(user)}
                      sx={{ 
                        color: colors.yellowAccent?.[500] || '#ff9800',
                        '&:hover': { bgcolor: colors.yellowAccent?.[500] + '20' }
                      }}
                    >
                      <PhoneIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </Box>

        <Box mt={2} pt={2} borderTop={`1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}`}>
          <Typography 
            variant="caption" 
            color={theme.palette.mode === 'dark' ? colors.grey[400] : colors.grey[600]}
            sx={{ fontSize: '0.7rem' }}
          >
            Click on any user to start a conversation
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActiveUsersCard;

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
  CircularProgress,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Circle as CircleIcon,
  MoreVert as MoreVertIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { tokens } from '../pages/dashboard/theme';

const ActiveUsersCard = ({ currentUser, compact = false, onUserSelect }) => {
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
    }, 500); // Reduced loading time for better UX
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
    if (onUserSelect) {
      onUserSelect(user);
    }
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
      <Box sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={24} sx={{ color: colors.blueAccent?.[500] || '#6870fa', mb: 1 }} />
          <Typography variant="body2" sx={{ color: '#555555', fontWeight: '500' }}>
            Loading active users...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Show only first 4 users in compact mode
  const displayUsers = compact ? activeUsers.slice(0, 4) : activeUsers;
  
  // Debug logging
  console.log('ActiveUsersCard - compact:', compact, 'activeUsers:', activeUsers.length, 'displayUsers:', displayUsers.length);

  return (
    <Box sx={{ height: '100%' }}>
      {/* Users List - Always render */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1, 
        flex: 1, 
        overflowY: 'auto',
        height: '100%'
      }}>
        {displayUsers.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            p: 2
          }}>
            <Typography variant="body2" sx={{ color: '#555555', fontWeight: '500' }}>
              No active users found
            </Typography>
          </Box>
        ) : (
          displayUsers.map((user) => (
            <ListItem 
              key={user.id}
              onClick={() => handleStartChat(user)}
              sx={{ 
                p: 1,
                borderRadius: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  transform: 'translateX(2px)'
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
                        bgcolor: '#ffffff',
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
                      sx={{ 
                        color: '#000000',
                        fontSize: '0.9rem' 
                      }}
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
                      sx={{ 
                        color: '#555555',
                        fontSize: '0.75rem' 
                      }}
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
          ))
        )}
      </Box>
    </Box>
  );
};

export default ActiveUsersCard;

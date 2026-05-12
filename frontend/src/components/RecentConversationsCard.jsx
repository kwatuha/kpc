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
  Chat as ChatIcon,
  Group as GroupIcon,
  AttachFile as AttachFileIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Circle as CircleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { tokens } from '../pages/dashboard/theme';

const RecentConversationsCard = ({ currentUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Mock data for recent conversations
  const [conversations] = useState([
    {
      id: 1,
      type: 'direct',
      name: 'Dr. Aisha Mwangi',
      lastMessage: 'Thanks for the project update. The budget looks good.',
      timestamp: '2 minutes ago',
      unreadCount: 2,
      isOnline: true,
      avatar: null,
    },
    {
      id: 2,
      type: 'group',
      name: 'Healthcare Project Team',
      lastMessage: 'John: The data analysis is complete. Ready for review.',
      timestamp: '15 minutes ago',
      unreadCount: 0,
      isOnline: false,
      avatar: null,
      participants: 5,
    },
    {
      id: 3,
      type: 'direct',
      name: 'Grace Akinyi',
      lastMessage: 'Field inspection scheduled for tomorrow at 9 AM.',
      timestamp: '1 hour ago',
      unreadCount: 1,
      isOnline: true,
      avatar: null,
    },
    {
      id: 4,
      type: 'group',
      name: 'Infrastructure Updates',
      lastMessage: 'Peter: New safety protocols have been uploaded.',
      timestamp: '2 hours ago',
      unreadCount: 0,
      isOnline: false,
      avatar: null,
      participants: 8,
    },
    {
      id: 5,
      type: 'direct',
      name: 'Mary Wanjiku',
      lastMessage: 'Research findings are ready for presentation.',
      timestamp: '3 hours ago',
      unreadCount: 0,
      isOnline: false,
      avatar: null,
    },
    {
      id: 6,
      type: 'group',
      name: 'Budget Planning',
      lastMessage: 'Aisha: Q2 budget allocation needs review.',
      timestamp: '5 hours ago',
      unreadCount: 1,
      isOnline: false,
      avatar: null,
      participants: 4,
    },
  ]);

  const getConversationIcon = (type) => {
    switch (type) {
      case 'direct':
        return <ChatIcon />;
      case 'group':
        return <GroupIcon />;
      default:
        return <ChatIcon />;
    }
  };

  const getConversationColor = (type) => {
    switch (type) {
      case 'direct':
        return colors.blueAccent?.[500] || '#6870fa';
      case 'group':
        return colors.greenAccent?.[500] || '#4caf50';
      default:
        return colors.grey[400];
    }
  };

  const handleConversationClick = (conversationId) => {
    console.log('Opening conversation:', conversationId);
    // TODO: Implement conversation opening
  };

  const handleSearchConversations = () => {
    console.log('Searching conversations');
    // TODO: Implement conversation search
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
            Recent Conversations
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${conversations.filter(c => c.unreadCount > 0).length} unread`}
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
              startIcon={<SearchIcon />}
              onClick={handleSearchConversations}
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
              Search
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflowY: 'auto' }}>
          {conversations.map((conversation) => (
            <Box 
              key={conversation.id}
              onClick={() => handleConversationClick(conversation.id)}
              sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: '#ffffff',
                border: `1px solid rgba(0,0,0,0.08)`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  transform: 'translateX(4px)',
                }
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Box position="relative">
                  <Avatar 
                    sx={{ 
                      bgcolor: getConversationColor(conversation.type),
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getConversationIcon(conversation.type)}
                  </Avatar>
                  {conversation.isOnline && (
                    <CircleIcon 
                      sx={{ 
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        color: colors.greenAccent?.[500] || '#4caf50',
                        fontSize: 12,
                        bgcolor: '#ffffff',
                        borderRadius: '50%',
                        p: 0.5
                      }} 
                    />
                  )}
                </Box>
                
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold" 
                      color="#000000"
                    >
                      {conversation.name}
                    </Typography>
                    {conversation.type === 'group' && (
                      <Chip 
                        label={`${conversation.participants} members`} 
                        size="small" 
                        sx={{ 
                          bgcolor: colors.greenAccent?.[500] || '#4caf50',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.6rem',
                          height: 18
                        }}
                      />
                    )}
                    {conversation.unreadCount > 0 && (
                      <Chip 
                        label={conversation.unreadCount} 
                        size="small" 
                        sx={{ 
                          bgcolor: colors.redAccent?.[500] || '#f44336',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.6rem',
                          height: 18,
                          minWidth: 20
                        }}
                      />
                    )}
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="#333333"
                    fontWeight="500"
                    sx={{ 
                      mb: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '100%'
                    }}
                  >
                    {conversation.lastMessage}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <ScheduleIcon sx={{ fontSize: 12, color: '#666666' }} />
                      <Typography variant="caption" color="#555555" fontWeight="600">
                        {conversation.timestamp}
                      </Typography>
                    </Box>
                    
                    {conversation.type === 'group' && (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AttachFileIcon sx={{ fontSize: 12, color: '#666666' }} />
                        <Typography variant="caption" color="#555555" fontWeight="600">
                          Files shared
                        </Typography>
                      </Box>
                    )}
                  </Box>
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
            Click on any conversation to continue chatting
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentConversationsCard;

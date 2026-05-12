import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Badge,
  Grid
} from '@mui/material';
import {
  Chat as ChatIcon,
  Group as GroupIcon,
  AttachFile as AttachFileIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Circle as CircleIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Launch as LaunchIcon,
  Work as ProjectIcon,
  Business as DepartmentIcon
} from '@mui/icons-material';
import { tokens } from '../../../../pages/dashboard/theme';
import { useChat } from '../../../../context/ChatContext';
import RoomList from '../../../chat/RoomList';
import ChatWindow from '../../../chat/ChatWindow';

const RecentConversationsCard = ({ user }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { rooms, fetchRooms, unreadCounts, getTotalUnreadCount, isConnected } = useChat();
  
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Fetch rooms when component mounts
  useEffect(() => {
    if (isConnected) {
      fetchRooms();
    }
  }, [isConnected, fetchRooms]);

  // Get recent conversations (limit to 5 for dashboard display)
  const recentConversations = rooms
    .filter(room => room.last_message_time) // Only rooms with messages
    .sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time))
    .slice(0, 5);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setChatDialogOpen(true);
  };

  const handleOpenFullChat = () => {
    setChatDialogOpen(true);
    setSelectedRoom(null);
  };

  const getConversationIcon = (roomType) => {
    switch (roomType) {
      case 'direct':
        return <PersonIcon />;
      case 'group':
        return <GroupIcon />;
      case 'project':
        return <ProjectIcon />;
      case 'department':
        return <DepartmentIcon />;
      default:
        return <ChatIcon />;
    }
  };

  const getConversationColor = (roomType) => {
    switch (roomType) {
      case 'direct':
        return colors.blueAccent?.[500] || '#2196f3';
      case 'group':
        return colors.greenAccent?.[500] || '#4caf50';
      case 'project':
        return colors.redAccent?.[500] || '#f44336';
      case 'department':
        return colors.grey?.[500] || '#9e9e9e';
      default:
        return colors.primary?.[500] || '#1976d2';
    }
  };

  const totalUnreadCount = getTotalUnreadCount();

  return (
    <>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[50],
        border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.grey[200]}`,
      }}>
        <CardContent sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          p: 2,
          '&:last-child': { pb: 2 }
        }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon sx={{ color: colors.greenAccent?.[500] || '#4caf50' }} />
              <Typography variant="h6" fontWeight="bold">
                Recent Conversations
              </Typography>
              {totalUnreadCount > 0 && (
                <Badge
                  badgeContent={totalUnreadCount}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: colors.redAccent?.[500] || '#f44336',
                      color: 'white',
                      fontSize: '0.7rem'
                    }
                  }}
                />
              )}
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<LaunchIcon />}
              onClick={handleOpenFullChat}
              sx={{ 
                borderColor: colors.blueAccent?.[500] || '#2196f3',
                color: colors.blueAccent?.[500] || '#2196f3',
                fontSize: '0.7rem',
                height: 28,
                '&:hover': { 
                  borderColor: colors.blueAccent?.[600] || '#1976d2',
                  bgcolor: (colors.blueAccent?.[500] || '#2196f3') + '10'
                }
              }}
            >
              Open Chat
            </Button>
          </Box>

          {/* Connection Status */}
          {!isConnected && (
            <Box sx={{ mb: 2 }}>
              <Chip
                label="Connecting to chat..."
                size="small"
                sx={{
                  backgroundColor: colors.grey?.[500] || '#9e9e9e',
                  color: 'white'
                }}
              />
            </Box>
          )}

          {/* Conversations List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, overflowY: 'auto' }}>
            {recentConversations.length === 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '200px',
                  gap: 2
                }}
              >
                <ChatIcon sx={{ fontSize: 48, color: colors.grey?.[400] || '#bdbdbd' }} />
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  No recent conversations
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleOpenFullChat}
                  sx={{
                    borderColor: colors.greenAccent?.[500] || '#4caf50',
                    color: colors.greenAccent?.[500] || '#4caf50'
                  }}
                >
                  Start Chatting
                </Button>
              </Box>
            ) : (
              recentConversations.map((room) => {
                const unreadCount = unreadCounts[room.room_id] || 0;
                
                return (
                  <Box 
                    key={room.room_id}
                    onClick={() => handleRoomClick(room)}
                    sx={{ 
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                      border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}`,
                      cursor: 'pointer',
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
                          bgcolor: getConversationColor(room.room_type),
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getConversationIcon(room.room_type)}
                      </Avatar>
                      
                      <Box flex={1}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                          <Typography 
                            variant="subtitle2" 
                            fontWeight="bold" 
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1
                            }}
                          >
                            {room.room_name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" color="textSecondary">
                              {formatTimestamp(room.last_message_time)}
                            </Typography>
                            {unreadCount > 0 && (
                              <Chip 
                                label={unreadCount} 
                                size="small" 
                                sx={{ 
                                  bgcolor: colors.redAccent?.[500] || '#f44336',
                                  color: 'white',
                                  fontSize: '0.6rem',
                                  height: 18,
                                  minWidth: 18
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                        
                        {room.room_type === 'project' && room.project_name && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            Project: {room.project_name}
                          </Typography>
                        )}
                        
                        {room.last_message && (
                          <Typography 
                            variant="body2" 
                            color="textSecondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              mt: 0.5
                            }}
                          >
                            {room.last_message}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Chat Dialog */}
      <Dialog
        open={chatDialogOpen}
        onClose={() => setChatDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '80vh',
            backgroundColor: colors.primary[400]
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'between',
          p: 1,
          backgroundColor: colors.primary[500]
        }}>
          <Typography variant="h6">
            {selectedRoom ? selectedRoom.room_name : 'Chat'}
          </Typography>
          <IconButton onClick={() => setChatDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', height: '100%' }}>
          <Grid container sx={{ height: '100%' }}>
            <Grid item xs={4} sx={{ borderRight: `1px solid ${colors.primary[200]}` }}>
              <RoomList
                onRoomSelect={setSelectedRoom}
                selectedRoom={selectedRoom}
                onCreateRoom={() => {/* TODO: Implement create room */}}
              />
            </Grid>
            <Grid item xs={8}>
              <ChatWindow
                room={selectedRoom}
                onClose={() => setSelectedRoom(null)}
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecentConversationsCard;
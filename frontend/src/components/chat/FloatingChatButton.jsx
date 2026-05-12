// Floating chat button with room management
import React, { useState } from 'react';
import {
  Fab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  useTheme,
  Slide,
  Box,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';
import { tokens } from '../../pages/dashboard/theme';
import RoomList from './RoomList';
import ChatWindow from './ChatWindow';
import CreateRoomModal from './CreateRoomModal';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FloatingChatButton = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Helper function to check if current mode is a dark theme
  const isDarkMode = theme.palette.mode === 'dark';
  const { getTotalUnreadCount, isConnected, fetchRooms, joinRoom, fetchParticipants, leaveRoom } = useChat();
  
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [createRoomOpen, setCreateRoomOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [participantsDialog, setParticipantsDialog] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const totalUnreadCount = getTotalUnreadCount();

  const handleChatToggle = () => {
    setChatOpen(!chatOpen);
  };

  const handleRoomSelect = (room) => {
    console.log('FloatingChatButton - Room selected:', room);
    setSelectedRoom(room);
    // Join the room to fetch messages
    if (room && room.room_id) {
      console.log('FloatingChatButton - Joining room:', room.room_id);
      joinRoom(room.room_id);
    }
  };

  const handleCreateRoom = () => {
    setCreateRoomOpen(true);
  };

  const handleRoomCreated = () => {
    // Refresh the rooms list after creating a new room
    fetchRooms();
  };

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleViewParticipants = async () => {
    setLoadingParticipants(true);
    setParticipantsDialog(true);
    handleMenuClose();
    
    if (selectedRoom?.room_id) {
      const roomParticipants = await fetchParticipants(selectedRoom.room_id);
      console.log('Participants data:', roomParticipants);
      if (roomParticipants && roomParticipants.length > 0) {
        console.log('First participant structure:', roomParticipants[0]);
      }
      setParticipants(roomParticipants);
    }
    setLoadingParticipants(false);
  };

  const handleRoomSettings = () => {
    handleMenuClose();
    // TODO: Implement room settings
    console.log('Room settings clicked');
  };

  const handleLeaveRoom = async () => {
    if (selectedRoom?.room_id) {
      await leaveRoom(selectedRoom.room_id);
      setSelectedRoom(null);
      fetchRooms();
    }
    handleMenuClose();
  };

  // Debug: Show connection status
  console.log('FloatingChatButton - isConnected:', isConnected);
  
  // Temporarily show button for debugging
  // if (!isConnected) {
  //   return null; // Don't show the button if not connected to chat
  // }

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        onClick={handleChatToggle}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          backgroundColor: colors.greenAccent[500],
          '&:hover': {
            backgroundColor: colors.greenAccent[600]
          }
        }}
      >
        <Badge
          badgeContent={totalUnreadCount}
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: colors.redAccent[500],
              color: 'white',
              fontSize: '0.75rem'
            }
          }}
        >
          <ChatIcon />
        </Badge>
      </Fab>

      {/* Chat Dialog */}
      <Dialog
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Transition}
        sx={{
          '& .MuiDialog-paper': {
            height: '80vh',
            backgroundColor: '#ffffff',
            position: 'fixed',
            bottom: 100,
            right: 24,
            top: 'auto',
            left: 'auto',
            margin: 0,
            maxWidth: '800px',
            width: '800px',
            borderRadius: 3,
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
            border: `1px solid rgba(0,0,0,0.08)`,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
            backgroundColor: '#f8fafc',
            borderBottom: `1px solid rgba(0,0,0,0.08)`,
            color: '#000000',
            fontWeight: '700',
            background: `linear-gradient(90deg, #f8fafc 0%, #e2e8f0 100%)`,
            borderRadius: '12px 12px 0 0',
            minHeight: '70px'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <ChatIcon sx={{ color: colors.greenAccent?.[500] || '#4caf50' }} />
            {selectedRoom ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Avatar sx={{ 
                  bgcolor: colors.greenAccent?.[500] || '#4caf50',
                  width: 40,
                  height: 40,
                  fontSize: '1rem'
                }}>
                  {(selectedRoom.room_type === 'group' || selectedRoom.room_type === 'role') ? (
                    <PersonIcon sx={{ fontSize: '1.2rem' }} />
                  ) : (
                    selectedRoom.room_name.charAt(0).toUpperCase()
                  )}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ 
                    color: '#000000', 
                    fontWeight: '700',
                    fontSize: '1.1rem',
                    lineHeight: 1.2
                  }}>
                    {selectedRoom.room_name}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#666666', 
                    fontWeight: '500',
                    fontSize: '0.75rem'
                  }}>
                    {selectedRoom.room_type === 'project' && selectedRoom.project_name && (
                      `Project: ${selectedRoom.project_name}`
                    )}
                    {selectedRoom.room_type === 'group' && `${selectedRoom.participant_count} members`}
                    {selectedRoom.room_type === 'role' && selectedRoom.role_name && (
                      `Role: ${selectedRoom.role_name} • ${selectedRoom.participant_count} members`
                    )}
                  </Typography>
                </Box>
                <IconButton 
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{ 
                    color: '#666666',
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.12)',
                      color: colors.greenAccent?.[500] || '#4caf50'
                    }
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            ) : (
              <span style={{ color: '#000000', fontWeight: '700' }}>Team Chat</span>
            )}
          </Box>
          <IconButton 
            onClick={() => setChatOpen(false)} 
            size="small"
            sx={{ 
              color: '#666666',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                color: colors.redAccent?.[500] || '#f44336'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: 0, 
          display: 'flex', 
          height: 'calc(100% - 80px)',
          overflow: 'hidden'
        }}>
          <Grid container sx={{ 
            height: '100%',
            flexWrap: 'nowrap'
          }}>
            <Grid 
              item 
              xs={4} 
              sx={{ 
                borderRight: `1px solid rgba(0,0,0,0.08)`,
                minHeight: '500px',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <RoomList
                onRoomSelect={handleRoomSelect}
                selectedRoom={selectedRoom}
                onCreateRoom={handleCreateRoom}
              />
            </Grid>
            <Grid item xs={8} sx={{ 
              minHeight: '500px', 
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <ChatWindow
                room={selectedRoom}
                onClose={() => setSelectedRoom(null)}
              />
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      
      {/* Create Room Modal */}
      <CreateRoomModal
        open={createRoomOpen}
        onClose={() => setCreateRoomOpen(false)}
        onRoomCreated={handleRoomCreated}
      />

      {/* Room Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            minWidth: 200,
            mt: 1
          }
        }}
      >
        <MenuItem 
          onClick={handleViewParticipants}
          sx={{ 
            color: '#333333',
            fontWeight: '500',
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(76, 175, 80, 0.08)',
              color: colors.greenAccent?.[500] || '#4caf50'
            }
          }}
        >
          <PeopleIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
          View Participants
        </MenuItem>
        <MenuItem 
          onClick={handleRoomSettings}
          sx={{ 
            color: '#333333',
            fontWeight: '500',
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(33, 150, 243, 0.08)',
              color: colors.blueAccent?.[500] || '#2196f3'
            }
          }}
        >
          <SettingsIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
          Room Settings
        </MenuItem>
        <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />
        <MenuItem 
          onClick={handleLeaveRoom}
          sx={{ 
            color: '#333333',
            fontWeight: '500',
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.08)',
              color: colors.redAccent?.[500] || '#f44336'
            }
          }}
        >
          <ExitToAppIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
          Leave Room
        </MenuItem>
      </Menu>

      {/* Participants Dialog */}
      <Dialog
        open={participantsDialog}
        onClose={() => setParticipantsDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            color: '#000000',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <PeopleIcon sx={{ color: colors.greenAccent?.[500] || '#4caf50' }} />
          <Box sx={{ flex: 1 }}>
            Room Participants
            <Typography variant="caption" display="block" sx={{ 
              color: '#666666', 
              fontWeight: '500',
              mt: 0.5
            }}>
              {participants.length} {participants.length === 1 ? 'member' : 'members'}
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setParticipantsDialog(false)}
            size="small"
            sx={{
              color: '#666666',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                color: colors.redAccent?.[500] || '#f44336'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {loadingParticipants ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress sx={{ color: colors.greenAccent?.[500] || '#4caf50' }} />
            </Box>
          ) : participants.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ 
                color: '#666666',
                fontWeight: '500'
              }}>
                No participants found
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {participants.map((participant, index) => (
                <React.Fragment key={participant.user_id || index}>
                  <ListItem
                    sx={{
                      py: 2,
                      '&:hover': {
                        backgroundColor: '#f8fafc'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: colors.greenAccent?.[500] || '#4caf50',
                        fontWeight: 'bold'
                      }}>
                        {(participant.username || participant.firstName || participant.email)?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ 
                            color: '#000000',
                            fontWeight: '600'
                          }}>
                            {participant.username || 
                             (participant.firstName && participant.lastName 
                               ? `${participant.firstName} ${participant.lastName}` 
                               : participant.firstName || participant.lastName || participant.email?.split('@')[0] || 'Unknown User')}
                          </Typography>
                          {participant.is_admin && (
                            <Chip 
                              label="Admin" 
                              size="small" 
                              sx={{ 
                                height: 20,
                                fontSize: '0.7rem',
                                backgroundColor: colors.greenAccent?.[500] || '#4caf50',
                                color: '#ffffff',
                                fontWeight: 'bold'
                              }} 
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ 
                          color: '#666666',
                          fontWeight: '500'
                        }}>
                          {participant.email || 'No email provided'}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < participants.length - 1 && (
                    <Divider sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingChatButton;


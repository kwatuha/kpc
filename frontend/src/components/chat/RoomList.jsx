import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Divider,
  Button,
  useTheme
} from '@mui/material';
import {
  Group as GroupIcon,
  Person as PersonIcon,
  Work as ProjectIcon,
  Business as DepartmentIcon,
  Security as RoleIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Circle as OnlineIcon
} from '@mui/icons-material';
import { useChat } from '../../context/ChatContext';
import { tokens } from '../../pages/dashboard/theme';
import ActiveUsersCard from '../ActiveUsersCard';

const RoomList = ({ onRoomSelect, selectedRoom, onCreateRoom }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Helper function to check if current mode is a dark theme
  const isDarkMode = theme.palette.mode === 'dark';
  const { rooms, unreadCounts } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, direct, group, project

  const getRoomIcon = (roomType) => {
    switch (roomType) {
      case 'direct':
        return <PersonIcon />;
      case 'group':
        return <GroupIcon />;
      case 'project':
        return <ProjectIcon />;
      case 'department':
        return <DepartmentIcon />;
      case 'role':
        return <RoleIcon />;
      default:
        return <GroupIcon />;
    }
  };

  const getRoomTypeColor = (roomType) => {
    switch (roomType) {
      case 'direct':
        return colors.blueAccent[500];
      case 'group':
        return colors.greenAccent[500];
      case 'project':
        return colors.redAccent[500];
      case 'department':
        return colors.grey[500];
      case 'role':
        return colors.orange[500];
      default:
        return colors.primary[500];
    }
  };

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.project_name && room.project_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filter === 'all' || room.room_type === filter;
    
    return matchesSearch && matchesFilter;
  });

  const sortedRooms = filteredRooms.sort((a, b) => {
    // Sort by last message time, then by unread count, then by name
    const aTime = new Date(a.last_message_time || 0);
    const bTime = new Date(b.last_message_time || 0);
    const aUnread = unreadCounts[a.room_id] || 0;
    const bUnread = unreadCounts[b.room_id] || 0;
    
    if (aUnread > 0 && bUnread === 0) return -1;
    if (bUnread > 0 && aUnread === 0) return 1;
    
    return bTime - aTime;
  });

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${colors.primary[200]}`,
          backgroundColor: colors.primary[50],
          background: `linear-gradient(90deg, ${colors.primary[50]} 0%, ${colors.primary[100]} 100%)`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000000' }}>
            Chat Rooms
          </Typography>
          <IconButton 
            onClick={onCreateRoom} 
            sx={{ 
              color: colors.greenAccent?.[500] || '#4caf50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              '&:hover': {
                backgroundColor: colors.greenAccent[200],
                transform: 'scale(1.05)'
              }
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
        
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#666666' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#ffffff',
              border: `1px solid ${colors.primary[300]}`,
              '&:hover': {
                backgroundColor: '#ffffff',
                border: `1px solid ${colors.primary[400]}`
              },
              '&.Mui-focused': {
                backgroundColor: '#ffffff',
                border: `2px solid ${colors.greenAccent[500]}`
              }
            },
            '& .MuiOutlinedInput-input': {
              color: '#333333'
            }
          }}
        />
        
        {/* Filter Chips */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'direct', label: 'Direct' },
            { key: 'group', label: 'Groups' },
            { key: 'project', label: 'Projects' },
            { key: 'role', label: 'Roles' }
          ].map((filterOption) => (
            <Chip
              key={filterOption.key}
              label={filterOption.label}
              size="small"
              onClick={() => setFilter(filterOption.key)}
              variant={filter === filterOption.key ? 'filled' : 'outlined'}
              sx={{
                backgroundColor: filter === filterOption.key ? colors.greenAccent?.[500] || '#4caf50' : '#ffffff',
                color: filter === filterOption.key ? '#ffffff' : '#555555',
                borderColor: filter === filterOption.key ? colors.greenAccent?.[500] || '#4caf50' : 'rgba(0,0,0,0.08)',
                '&:hover': {
                  backgroundColor: filter === filterOption.key ? colors.greenAccent?.[600] || '#388e3c' : '#f8fafc',
                  borderColor: filter === filterOption.key ? colors.greenAccent?.[600] || '#388e3c' : 'rgba(0,0,0,0.12)'
                }
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Active Users Section - Only show when Direct filter is selected */}
      {filter === 'direct' && (
        <Box
          sx={{
            p: 2,
            borderBottom: `2px solid ${colors.greenAccent?.[500] || '#4caf50'}`,
            backgroundColor: 'rgba(76, 175, 80, 0.05)',
            background: `linear-gradient(90deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.08) 100%)`,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${colors.greenAccent?.[500] || '#4caf50'} 0%, ${colors.greenAccent?.[400] || '#66bb6a'} 100%)`,
              borderRadius: '2px 2px 0 0'
            }
          }}
        >
          <Typography variant="subtitle2" sx={{ 
            fontWeight: '700', 
            color: '#000000',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '0.9rem'
          }}>
            <OnlineIcon sx={{ color: colors.greenAccent?.[500] || '#4caf50', fontSize: 16 }} />
            Start Direct Message
          </Typography>
          <Box sx={{ height: '200px', overflow: 'hidden', borderRadius: 2, border: `1px solid rgba(76, 175, 80, 0.2)`, backgroundColor: '#ffffff' }}>
            <ActiveUsersCard 
              compact={false} 
              onUserSelect={(user) => {
                console.log('User selected for direct message:', user);
                // Create a mock room object for direct message
                const directRoom = {
                  room_id: `direct_${user.id}`,
                  room_name: user.name,
                  room_type: 'direct',
                  participant_count: 2,
                  last_message: null,
                  last_message_time: null
                };
                onRoomSelect(directRoom);
              }}
            />
          </Box>
        </Box>
      )}

      {/* Room List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {sortedRooms.length === 0 ? (
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
            <Typography variant="body1" color="textSecondary">
              {searchTerm ? 'No rooms found' : 'No chat rooms available'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onCreateRoom}
                sx={{
                  borderColor: colors.greenAccent?.[500] || '#4caf50',
                  color: colors.greenAccent?.[500] || '#4caf50'
                }}
              >
                Create Room
              </Button>
            )}
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {sortedRooms.map((room, index) => {
              const unreadCount = unreadCounts[room.room_id] || 0;
              const isSelected = selectedRoom?.room_id === room.room_id;
              
              return (
                <React.Fragment key={room.room_id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => onRoomSelect(room)}
                      selected={isSelected}
                      sx={{
                        py: 1.5,
                        px: 2,
                        backgroundColor: isSelected ? 'rgba(76, 175, 80, 0.12)' : 'transparent',
                        borderRadius: 2,
                        margin: '2px 8px',
                        border: isSelected ? `2px solid ${colors.greenAccent?.[500] || '#4caf50'}` : '2px solid transparent',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: isSelected ? '4px' : '0px',
                          backgroundColor: colors.greenAccent?.[500] || '#4caf50',
                          transition: 'width 0.3s ease'
                        },
                        '&:hover': {
                          backgroundColor: isSelected ? 'rgba(76, 175, 80, 0.18)' : 'rgba(104, 112, 250, 0.08)',
                          transform: 'translateX(4px)',
                          borderColor: isSelected ? colors.greenAccent?.[500] || '#4caf50' : 'rgba(104, 112, 250, 0.3)',
                          boxShadow: isSelected 
                            ? '0 4px 12px rgba(76, 175, 80, 0.2)' 
                            : '0 2px 8px rgba(104, 112, 250, 0.15)',
                          '&::before': {
                            width: '4px'
                          }
                        },
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(76, 175, 80, 0.12)',
                          borderColor: colors.greenAccent?.[500] || '#4caf50',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)',
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.18)',
                            boxShadow: '0 6px 16px rgba(76, 175, 80, 0.25)'
                          }
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: colors.greenAccent?.[500] || '#4caf50',
                            fontSize: '0.875rem',
                            color: '#ffffff'
                          }}
                        >
                          {getRoomIcon(room.room_type)}
                        </Avatar>
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: unreadCount > 0 ? 'bold' : 'normal',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  flex: 1,
                                  color: '#000000'
                                }}
                            >
                              {room.room_name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {room.last_message_time && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: '#555555', fontWeight: '500' }}
                                >
                                  {formatLastMessageTime(room.last_message_time)}
                                </Typography>
                              )}
                              {unreadCount > 0 && (
                                <Badge
                                  badgeContent={unreadCount}
                                  sx={{
                                    '& .MuiBadge-badge': {
                                      backgroundColor: colors.greenAccent?.[500] || '#4caf50',
                                      color: '#ffffff',
                                      fontSize: '0.75rem',
                                      minWidth: '18px',
                                      height: '18px'
                                    }
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box>
                            {room.room_type === 'project' && room.project_name && (
                                  <Box
                                    component="span"
                                    sx={{ 
                                      color: '#555555',
                                      fontSize: '0.75rem',
                                      display: 'block'
                                    }}
                                  >
                                Project: {room.project_name}
                              </Box>
                            )}
                            {room.room_type === 'role' && room.role_name && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <Chip 
                                  label={`Role: ${room.role_name}`} 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: colors.orange?.[500] || '#ff9800', 
                                    color: '#ffffff',
                                    fontSize: '0.65rem',
                                    height: '18px'
                                  }} 
                                />
                                <Box
                                  component="span"
                                  sx={{ 
                                    color: '#555555',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {room.participant_count} members
                                </Box>
                              </Box>
                            )}
                            {room.last_message && (
                              <Box
                                component="span"
                                sx={{
                                  color: '#555555',
                                  fontSize: '0.875rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  mt: 0.5,
                                  display: 'block'
                                }}
                              >
                                {room.last_message}
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                      {index < sortedRooms.length - 1 && (
                        <Divider sx={{ 
                          borderColor: 'rgba(0,0,0,0.06)',
                          mx: 2
                        }} />
                      )}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default RoomList;


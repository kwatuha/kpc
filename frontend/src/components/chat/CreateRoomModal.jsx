import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Autocomplete,
  useTheme,
  Alert
} from '@mui/material';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { tokens } from '../../pages/dashboard/theme';
import { axiosInstance } from '../../api';

const CreateRoomModal = ({ open, onClose, onRoomCreated }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // Helper function to check if current mode is a dark theme
  const isDarkMode = theme.palette.mode === 'dark';
  const { createRoom, createRoleRoom, fetchRoles: contextFetchRoles } = useChat();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    room_name: '',
    room_type: 'group',
    description: '',
    project_id: null,
    role_id: null,
    participants: []
  });
  
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch users, projects, and roles when modal opens
  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchProjects();
      fetchRoles();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      console.log('CreateRoomModal - Fetching users...');
      const response = await axiosInstance.get('/users/users');
      console.log('CreateRoomModal - Users response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Filter out current user
        const otherUsers = response.data.filter(u => u.userId !== user.userId);
        console.log('CreateRoomModal - Filtered users:', otherUsers);
        setUsers(otherUsers);
      } else {
        console.log('CreateRoomModal - Response data is not an array:', response.data);
      }
    } catch (error) {
      console.error('CreateRoomModal - Error fetching users:', error);
      console.error('CreateRoomModal - Error details:', error.response?.data);
    }
  };

  const fetchProjects = async () => {
    try {
      console.log('CreateRoomModal - Fetching projects...');
      const response = await axiosInstance.get('/projects');
      console.log('CreateRoomModal - Projects response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        console.log('CreateRoomModal - Projects loaded:', response.data.length);
        setProjects(response.data);
      } else {
        console.log('CreateRoomModal - Projects response data is not an array:', response.data);
      }
    } catch (error) {
      console.error('CreateRoomModal - Error fetching projects:', error);
      console.error('CreateRoomModal - Error details:', error.response?.data);
    }
  };

  const fetchRoles = async () => {
    try {
      console.log('CreateRoomModal - Fetching roles...');
      const rolesData = await contextFetchRoles();
      console.log('CreateRoomModal - Roles response:', rolesData);
      
      if (rolesData && Array.isArray(rolesData)) {
        console.log('CreateRoomModal - Roles loaded:', rolesData.length);
        setRoles(rolesData);
      } else {
        console.log('CreateRoomModal - Roles response data is not an array:', rolesData);
      }
    } catch (error) {
      console.error('CreateRoomModal - Error fetching roles:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async () => {
    console.log('CreateRoomModal - Starting room creation...');
    console.log('CreateRoomModal - Form data:', formData);
    
    if (!formData.room_name.trim()) {
      setError('Room name is required');
      return;
    }

    if (formData.room_type === 'direct' && formData.participants.length !== 1) {
      setError('Direct messages require exactly one participant');
      return;
    }

    if (formData.room_type === 'project' && !formData.project_id) {
      setError('Project is required for project rooms');
      return;
    }

    if (formData.room_type === 'role' && !formData.role_id) {
      setError('Role is required for role-based rooms');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let roomId;
      
      if (formData.room_type === 'role') {
        // Use createRoleRoom for role-based rooms
        console.log('CreateRoomModal - Creating role-based room for role_id:', formData.role_id);
        roomId = await createRoleRoom(formData.role_id);
        console.log('CreateRoomModal - Role room created with ID:', roomId);
      } else {
        // Use regular createRoom for other room types
        const roomData = {
          room_name: formData.room_name.trim(),
          room_type: formData.room_type,
          description: formData.description.trim(),
          project_id: formData.project_id,
          participant_ids: formData.participants.map(p => p.userId)
        };

        console.log('CreateRoomModal - Sending room data:', roomData);
        roomId = await createRoom(roomData);
        console.log('CreateRoomModal - Room created with ID:', roomId);
      }
      
      if (roomId) {
        onRoomCreated();
        handleClose();
      } else {
        setError('Room creation returned no ID');
      }
    } catch (error) {
      console.error('CreateRoomModal - Error creating room:', error);
      console.error('CreateRoomModal - Error details:', error.response?.data);
      console.error('CreateRoomModal - Error status:', error.response?.status);
      
      let errorMessage = 'Failed to create room';
      if (error.response?.status === 401) {
        errorMessage = 'You are not authorized to create chat rooms. Please contact your administrator.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to create chat rooms. Please contact your administrator.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      room_name: '',
      room_type: 'group',
      description: '',
      project_id: null,
      role_id: null,
      participants: []
    });
    setError('');
    onClose();
  };

  const getRoomTypeDescription = (type) => {
    switch (type) {
      case 'direct':
        return 'Private conversation between two people';
      case 'group':
        return 'Group conversation with multiple participants';
      case 'project':
        return 'Project-specific discussion room';
      case 'department':
        return 'Department-wide communication';
      case 'role':
        return 'Role-based discussion room - automatically includes all users with this role';
      default:
        return '';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#ffffff',
          color: '#000000',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(0,0,0,0.08)'
        }
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#f8fafc',
          borderBottom: `1px solid rgba(0,0,0,0.08)`,
          color: '#000000',
          fontWeight: 700,
          fontSize: '1.25rem'
        }}
      >
        Create New Chat Room
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Room Name */}
          <TextField
            label="Room Name"
            value={formData.room_name}
            onChange={(e) => handleInputChange('room_name', e.target.value)}
            fullWidth
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.greenAccent?.[500] || '#4caf50'
                  }
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.greenAccent?.[500] || '#4caf50'
                  }
                }
              },
              '& .MuiInputLabel-root': {
                color: '#555555',
                fontWeight: '500',
                '&.Mui-focused': {
                  color: colors.greenAccent?.[500] || '#4caf50'
                }
              },
              '& .MuiOutlinedInput-input': {
                color: '#333333'
              }
            }}
          />

          {/* Room Type */}
          <FormControl fullWidth>
            <InputLabel sx={{ 
              color: '#555555', 
              fontWeight: '500',
              '&.Mui-focused': {
                color: colors.greenAccent?.[500] || '#4caf50'
              }
            }}>Room Type</InputLabel>
            <Select
              value={formData.room_type}
              onChange={(e) => handleInputChange('room_type', e.target.value)}
              label="Room Type"
              sx={{
                backgroundColor: '#ffffff',
                color: '#333333',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.greenAccent?.[500] || '#4caf50'
                  }
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.greenAccent?.[500] || '#4caf50'
                  }
                }
              }}
            >
              <MenuItem value="group">Group Chat</MenuItem>
              <MenuItem value="direct">Direct Message</MenuItem>
              <MenuItem value="project">Project Room</MenuItem>
              <MenuItem value="department">Department Room</MenuItem>
              <MenuItem value="role">Role-Based Room</MenuItem>
            </Select>
            <Typography variant="caption" sx={{ mt: 1, color: '#666666', fontWeight: '500' }}>
              {getRoomTypeDescription(formData.room_type)}
            </Typography>
          </FormControl>

          {/* Project Selection (for project rooms) */}
          {formData.room_type === 'project' && (
            <FormControl fullWidth>
              <InputLabel sx={{ 
                color: '#555555', 
                fontWeight: '500',
                '&.Mui-focused': {
                  color: colors.greenAccent?.[500] || '#4caf50'
                }
              }}>Project</InputLabel>
              <Select
                value={formData.project_id || ''}
                onChange={(e) => handleInputChange('project_id', e.target.value)}
                label="Project"
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#333333',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.greenAccent?.[500] || '#4caf50'
                    }
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.greenAccent?.[500] || '#4caf50'
                    }
                  }
                }}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.projectName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Role Selection (for role-based rooms) */}
          {formData.room_type === 'role' && (
            <FormControl fullWidth>
              <InputLabel sx={{ 
                color: '#555555', 
                fontWeight: '500',
                '&.Mui-focused': {
                  color: colors.greenAccent?.[500] || '#4caf50'
                }
              }}>Role</InputLabel>
              <Select
                value={formData.role_id || ''}
                onChange={(e) => handleInputChange('role_id', e.target.value)}
                label="Role"
                sx={{
                  backgroundColor: '#ffffff',
                  color: '#333333',
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.greenAccent?.[500] || '#4caf50'
                    }
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#ffffff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: colors.greenAccent?.[500] || '#4caf50'
                    }
                  }
                }}
              >
                {roles.map((role) => (
                  <MenuItem key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Participants (not shown for role-based rooms) */}
          {formData.room_type !== 'role' && (
            <Autocomplete
              multiple
              options={users}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.email})`}
              isOptionEqualToValue={(option, value) => option.userId === value.userId}
              value={formData.participants}
              onChange={(event, newValue) => handleInputChange('participants', newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={`${option.firstName} ${option.lastName}`}
                    {...getTagProps({ index })}
                    key={option.userId}
                    sx={{
                      borderColor: colors.greenAccent?.[500] || '#4caf50',
                      color: colors.greenAccent?.[500] || '#4caf50',
                      backgroundColor: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#f8fafc'
                      }
                    }}
                  />
                ))
              }
              renderOption={(props, option) => (
                <li {...props} key={option.userId}>
                  {`${option.firstName} ${option.lastName} (${option.email})`}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Participants"
                  placeholder="Select participants..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.greenAccent?.[500] || '#4caf50'
                        }
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#ffffff',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: colors.greenAccent?.[500] || '#4caf50'
                        }
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: '#555555',
                      fontWeight: '500',
                      '&.Mui-focused': {
                        color: colors.greenAccent?.[500] || '#4caf50'
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      color: '#333333'
                    }
                  }}
                />
              )}
              sx={{
                '& .MuiAutocomplete-popupIndicator': {
                  color: '#666666'
                }
              }}
            />
          )}
          
          {/* Info message for role-based rooms */}
          {formData.room_type === 'role' && (
            <Alert 
              severity="info" 
              sx={{ 
                backgroundColor: 'rgba(33, 150, 243, 0.08)',
                color: '#333333',
                fontWeight: '500',
                border: '1px solid rgba(33, 150, 243, 0.2)'
              }}
            >
              All users with the selected role will be automatically added as participants.
            </Alert>
          )}

          {/* Description */}
          <TextField
            label="Description (Optional)"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            fullWidth
            multiline
            rows={3}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#ffffff',
                '&:hover': {
                  backgroundColor: '#f8fafc',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.greenAccent?.[500] || '#4caf50'
                  }
                },
                '&.Mui-focused': {
                  backgroundColor: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.greenAccent?.[500] || '#4caf50'
                  }
                }
              },
              '& .MuiInputLabel-root': {
                color: '#555555',
                fontWeight: '500',
                '&.Mui-focused': {
                  color: colors.greenAccent?.[500] || '#4caf50'
                }
              },
              '& .MuiOutlinedInput-input': {
                color: '#333333'
              }
            }}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 2, backgroundColor: '#f8fafc', borderTop: `1px solid rgba(0,0,0,0.08)` }}>
        <Button 
          onClick={handleClose} 
          sx={{ 
            color: '#666666',
            fontWeight: '600',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.04)'
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            backgroundColor: colors.greenAccent?.[500] || '#4caf50',
            color: '#ffffff',
            fontWeight: '700',
            '&:hover': {
              backgroundColor: colors.greenAccent?.[600] || '#388e3c',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
            },
            '&:disabled': {
              backgroundColor: '#bdbdbd',
              color: '#ffffff'
            }
          }}
        >
          {loading ? 'Creating...' : 'Create Room'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRoomModal;

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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { tokens } from '../pages/dashboard/theme';

const TeamDirectoryCard = ({ currentUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Mock data for team directory
  const [teamMembers] = useState([
    {
      id: 1,
      name: 'Dr. Aisha Mwangi',
      role: 'Project Manager',
      department: 'Health',
      email: 'aisha.mwangi@company.com',
      phone: '+254-700-123456',
      location: 'Nairobi Office',
      status: 'online',
      skills: ['Project Management', 'Healthcare', 'Budget Planning'],
      availability: 'Available',
    },
    {
      id: 2,
      name: 'John Kiprotich',
      role: 'Data Analyst',
      department: 'Analytics',
      email: 'john.kiprotich@company.com',
      phone: '+254-700-234567',
      location: 'Remote',
      status: 'away',
      skills: ['Data Analysis', 'Statistics', 'Reporting'],
      availability: 'Busy until 3 PM',
    },
    {
      id: 3,
      name: 'Grace Akinyi',
      role: 'Field Coordinator',
      department: 'Operations',
      email: 'grace.akinyi@company.com',
      phone: '+254-700-345678',
      location: 'Field Office',
      status: 'online',
      skills: ['Field Operations', 'Logistics', 'Team Leadership'],
      availability: 'Available',
    },
    {
      id: 4,
      name: 'Peter Mwangi',
      role: 'Technical Lead',
      department: 'IT',
      email: 'peter.mwangi@company.com',
      phone: '+254-700-456789',
      location: 'Tech Hub',
      status: 'busy',
      skills: ['Software Development', 'System Architecture', 'Database Management'],
      availability: 'In meeting until 2 PM',
    },
    {
      id: 5,
      name: 'Mary Wanjiku',
      role: 'Research Assistant',
      department: 'Research',
      email: 'mary.wanjiku@company.com',
      phone: '+254-700-567890',
      location: 'Research Lab',
      status: 'online',
      skills: ['Research', 'Data Collection', 'Analysis'],
      availability: 'Available',
    },
  ]);

  const departments = ['all', 'Health', 'Analytics', 'Operations', 'IT', 'Research'];

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

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

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
            Team Directory
          </Typography>
          <Chip 
            label={`${filteredMembers.length} members`}
            size="small"
            sx={{ 
              bgcolor: colors.blueAccent?.[500] || '#6870fa',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.7rem'
            }}
          />
        </Box>

        {/* Search and Filter */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <TextField
            size="small"
            placeholder="Search team members..."
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
              flex: 1, 
              minWidth: 200,
              '& .MuiOutlinedInput-root': {
                bgcolor: '#ffffff',
              }
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              label="Department"
              sx={{ 
                bgcolor: '#ffffff',
              }}
            >
              {departments.map(dept => (
                <MenuItem key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Team Members List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
          {filteredMembers.map((member) => (
            <Box 
              key={member.id}
              sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: '#ffffff',
                border: `1px solid rgba(0,0,0,0.08)`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  transform: 'translateX(4px)',
                }
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: getStatusColor(member.status),
                    width: 48,
                    height: 48,
                    fontSize: '1.1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {member.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="bold" 
                      color="#000000"
                    >
                      {member.name}
                    </Typography>
                    <Chip 
                      label={member.status.toUpperCase()} 
                      size="small" 
                      sx={{ 
                        bgcolor: getStatusColor(member.status),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.6rem',
                        height: 20
                      }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="#333333"
                    fontWeight="500"
                    sx={{ mb: 1 }}
                  >
                    {member.role} • {member.department}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={2} mb={1} flexWrap="wrap">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <EmailIcon sx={{ fontSize: 14, color: '#666666' }} />
                      <Typography variant="caption" color="#555555" fontWeight="600">
                        {member.email}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <PhoneIcon sx={{ fontSize: 14, color: '#666666' }} />
                      <Typography variant="caption" color="#555555" fontWeight="600">
                        {member.phone}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <LocationIcon sx={{ fontSize: 14, color: '#666666' }} />
                      <Typography variant="caption" color="#555555" fontWeight="600">
                        {member.location}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box mb={1}>
                    <Typography variant="caption" color="#555555" fontWeight="600" sx={{ fontSize: '0.7rem' }}>
                      Skills:
                    </Typography>
                    <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                      {member.skills.map((skill, index) => (
                        <Chip 
                          key={index}
                          label={skill} 
                          size="small" 
                          sx={{ 
                            bgcolor: colors.blueAccent?.[500] || '#6870fa',
                            color: 'white',
                            fontSize: '0.6rem',
                            height: 18
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <ScheduleIcon sx={{ fontSize: 14, color: getStatusColor(member.status) }} />
                    <Typography variant="caption" color={getStatusColor(member.status)} sx={{ fontSize: '0.7rem', fontWeight: 'medium' }}>
                      {member.availability}
                    </Typography>
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

export default TeamDirectoryCard;

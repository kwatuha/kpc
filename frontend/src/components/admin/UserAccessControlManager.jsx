import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Snackbar,
  Autocomplete,
  Switch,
  FormControlLabel,
  Divider,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as DepartmentIcon,
  LocationOn as LocationIcon,
  Assignment as ProjectIcon,
  FilterList as FilterIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { tokens } from '../../pages/dashboard/theme';
import dataAccessService from '../../services/dataAccessService';
import userService from '../../api/userService';
import projectService from '../../api/projectService';
import organizationService from '../../api/organizationService';

const UserAccessControlManager = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  console.log('UserAccessControlManager component loaded');
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dialog states
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [wardDialogOpen, setWardDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // Form states
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [primaryDepartment, setPrimaryDepartment] = useState('');
  const [selectedSubcounties, setSelectedSubcounties] = useState([]);
  const [selectedWards, setSelectedWards] = useState([]);
  const [wardAccessLevels, setWardAccessLevels] = useState({});
  const [filteredWards, setFilteredWards] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [projectAccessLevels, setProjectAccessLevels] = useState({});
  const [dataFilters, setDataFilters] = useState({
    budgetRange: { min: 0, max: 100000000, enabled: false },
    allowedStatuses: { values: [], enabled: false },
    projectTypes: { values: [], enabled: false }
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter wards based on selected subcounties
  useEffect(() => {
    if (selectedSubcounties.length > 0) {
      const filtered = wards.filter(ward => 
        selectedSubcounties.includes(ward.subcountyId)
      );
      setFilteredWards(filtered);
    } else {
      setFilteredWards(wards);
    }
  }, [selectedSubcounties, wards]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [usersData, departmentsData, subcountiesData, wardsData, projectsData] = await Promise.all([
        userService.getUsers(),
        organizationService.getCountyDepartments(),
        organizationService.getSubcounties(),
        organizationService.getWards(),
        projectService.projects.getProjects()
      ]);
      
      console.log('Loaded users:', usersData);
      console.log('Loaded departments:', departmentsData);
      console.log('Loaded subcounties:', subcountiesData);
      console.log('Loaded wards:', wardsData);
      console.log('Loaded projects:', projectsData);
      
      setUsers(usersData);
      setDepartments(departmentsData);
      setSubcounties(subcountiesData);
      setWards(wardsData);
      setProjects(projectsData);
    } catch (err) {
      setError('Failed to load initial data');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load user's current assignments
  const loadUserAssignments = async (userId) => {
    try {
      const [userDepartments, userWards, userProjects, userFilters] = await Promise.all([
        dataAccessService.getUserDepartments(userId),
        dataAccessService.getUserWards(userId),
        dataAccessService.getUserProjects(userId),
        dataAccessService.getUserDataFilters(userId)
      ]);

      console.log('Loading user assignments for user:', userId);
      console.log('User departments:', userDepartments);
      console.log('User wards:', userWards);
      console.log('User projects:', userProjects);
      console.log('User filters:', userFilters);

      // Set department assignments
      setSelectedDepartments(userDepartments.map(d => d.departmentId));
      setPrimaryDepartment(userDepartments.find(d => d.is_primary)?.departmentId || '');

      // Set ward assignments
      const assignedWardIds = userWards.map(w => w.wardId);
      setSelectedWards(assignedWardIds);
      
      // Set ward access levels
      const wardLevels = {};
      userWards.forEach(w => {
        wardLevels[w.wardId] = w.access_level;
      });
      setWardAccessLevels(wardLevels);
      
      // Set subcounties based on assigned wards
      const assignedSubcountyIds = [...new Set(
        assignedWardIds.map(wardId => {
          const ward = wards.find(w => w.wardId === wardId);
          return ward?.subcountyId;
        }).filter(Boolean)
      )];
      setSelectedSubcounties(assignedSubcountyIds);

      // Set project assignments
      setSelectedProjects(userProjects.map(p => p.projectId));
      const projectLevels = {};
      userProjects.forEach(p => {
        projectLevels[p.projectId] = p.access_level;
      });
      setProjectAccessLevels(projectLevels);

      // Set data filters
      const filters = {
        budgetRange: { min: 0, max: 100000000, enabled: false },
        allowedStatuses: { values: [], enabled: false },
        projectTypes: { values: [], enabled: false }
      };
      
      userFilters.forEach(filter => {
        if (filter.filter_type === 'budget_range') {
          filters.budgetRange = { ...filter.filter_value, enabled: true };
        } else if (filter.filter_type === 'progress_status') {
          filters.allowedStatuses = { values: filter.filter_value, enabled: true };
        } else if (filter.filter_type === 'project_type') {
          filters.projectTypes = { values: filter.filter_value, enabled: true };
        }
      });
      
      setDataFilters(filters);
    } catch (err) {
      setError('Failed to load user assignments');
      console.error('Error loading user assignments:', err);
    }
  };

  // Clear all form states
  const clearFormStates = () => {
    setSelectedDepartments([]);
    setPrimaryDepartment('');
    setSelectedSubcounties([]);
    setSelectedWards([]);
    setWardAccessLevels({});
    setSelectedProjects([]);
    setProjectAccessLevels({});
    setDataFilters({
      budgetRange: { min: 0, max: 100000000, enabled: false },
      allowedStatuses: { values: [], enabled: false },
      projectTypes: { values: [], enabled: false }
    });
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    clearFormStates(); // Clear previous user's data
    if (user) {
      loadUserAssignments(user.userId);
    }
  };

  // Save department assignments
  const saveDepartmentAssignments = async () => {
    if (!selectedUser) return;
    
    try {
      await dataAccessService.assignUserToDepartments(
        selectedUser.userId, 
        selectedDepartments, 
        primaryDepartment
      );
      setSuccess('Department assignments saved successfully');
      setDepartmentDialogOpen(false);
    } catch (err) {
      setError('Failed to save department assignments');
      console.error('Error saving department assignments:', err);
    }
  };

  // Save ward assignments
  const saveWardAssignments = async () => {
    if (!selectedUser) return;
    
    try {
      const wardAssignments = selectedWards.map(wardId => ({
        wardId,
        accessLevel: wardAccessLevels[wardId] || 'read'
      }));
      
      console.log('Saving ward assignments:', wardAssignments);
      await dataAccessService.assignUserToWards(selectedUser.userId, wardAssignments);
      setSuccess('Ward assignments saved successfully');
      setWardDialogOpen(false);
      
      // Reload user assignments to reflect changes
      await loadUserAssignments(selectedUser.userId);
    } catch (err) {
      setError('Failed to save ward assignments');
      console.error('Error saving ward assignments:', err);
    }
  };

  // Save project assignments
  const saveProjectAssignments = async () => {
    if (!selectedUser) return;
    
    try {
      const projectAssignments = selectedProjects.map(projectId => ({
        projectId,
        accessLevel: projectAccessLevels[projectId] || 'view'
      }));
      
      await dataAccessService.assignUserToProjects(selectedUser.userId, projectAssignments);
      setSuccess('Project assignments saved successfully');
      setProjectDialogOpen(false);
    } catch (err) {
      setError('Failed to save project assignments');
      console.error('Error saving project assignments:', err);
    }
  };

  // Save data filters
  const saveDataFilters = async () => {
    if (!selectedUser) return;
    
    try {
      const filters = [];
      
      if (dataFilters.budgetRange.enabled) {
        filters.push({
          filter_type: 'budget_range',
          filter_key: 'project_budget',
          filter_value: {
            min: dataFilters.budgetRange.min,
            max: dataFilters.budgetRange.max
          }
        });
      }
      
      if (dataFilters.allowedStatuses.enabled && dataFilters.allowedStatuses.values.length > 0) {
        filters.push({
          filter_type: 'progress_status',
          filter_key: 'project_status',
          filter_value: dataFilters.allowedStatuses.values
        });
      }
      
      if (dataFilters.projectTypes.enabled && dataFilters.projectTypes.values.length > 0) {
        filters.push({
          filter_type: 'project_type',
          filter_key: 'project_category',
          filter_value: dataFilters.projectTypes.values
        });
      }
      
      await dataAccessService.updateUserDataFilters(selectedUser.userId, filters);
      setSuccess('Data filters saved successfully');
      setFilterDialogOpen(false);
    } catch (err) {
      setError('Failed to save data filters');
      console.error('Error saving data filters:', err);
    }
  };

  // Tab panel component
  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        User Access Control Manager
      </Typography>

      <Grid container spacing={3}>
        {/* User Selection Panel */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent>
              <Typography variant="h6" mb={2} display="flex" alignItems="center">
                <PersonIcon sx={{ mr: 1 }} />
                Select User
              </Typography>
              
              <Autocomplete
                options={users}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.username})`}
                value={selectedUser}
                onChange={(event, newValue) => handleUserSelect(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Search Users" variant="outlined" />
                )}
                sx={{ mb: 2 }}
              />

              {selectedUser && (
                <Box sx={{ mt: 2, p: 2, bgcolor: colors.primary[400], borderRadius: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedUser.email}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Role: {selectedUser.roleName || 'N/A'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Access Control Tabs */}
        <Grid item xs={12} md={8}>
          {selectedUser ? (
            <Card>
              <CardContent>
                <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                  <Tab label="Departments" icon={<DepartmentIcon />} />
                  <Tab label="Wards/Regions" icon={<LocationIcon />} />
                  <Tab label="Projects" icon={<ProjectIcon />} />
                  <Tab label="Data Filters" icon={<FilterIcon />} />
                </Tabs>

                {/* Department Assignments Tab */}
                <TabPanel value={activeTab} index={0}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Department Assignments</Typography>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setDepartmentDialogOpen(true)}
                    >
                      Manage Departments
                    </Button>
                  </Box>
                  
                  <List>
                    {departments
                      .filter(dept => selectedDepartments.includes(dept.departmentId))
                      .map(dept => (
                        <ListItem key={dept.departmentId}>
                          <ListItemText
                            primary={dept.name}
                            secondary={dept.departmentId === primaryDepartment ? 'Primary Department' : 'Secondary'}
                          />
                          <Chip
                            label={dept.departmentId === primaryDepartment ? 'Primary' : 'Secondary'}
                            color={dept.departmentId === primaryDepartment ? 'primary' : 'default'}
                            size="small"
                          />
                        </ListItem>
                      ))}
                  </List>
                </TabPanel>

                {/* Ward Assignments Tab */}
                <TabPanel value={activeTab} index={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Ward/Region Assignments</Typography>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setWardDialogOpen(true)}
                    >
                      Manage Wards
                    </Button>
                  </Box>
                  
                  <List>
                    {selectedWards.map(wardId => {
                      const ward = wards.find(w => w.wardId === wardId);
                      const subcounty = subcounties.find(sc => sc.subcountyId === ward?.subcountyId);
                      return (
                        <ListItem key={wardId}>
                          <ListItemText
                            primary={ward?.name || `Ward ${wardId}`}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  Subcounty: {subcounty?.name || 'Unknown'}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Access Level: {wardAccessLevels[wardId] || 'read'}
                                </Typography>
                              </Box>
                            }
                          />
                          <Chip
                            label={wardAccessLevels[wardId] || 'read'}
                            color="primary"
                            size="small"
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                  
                  {selectedWards.length === 0 && (
                    <Typography variant="body2" color="textSecondary" textAlign="center" py={4}>
                      No ward assignments configured
                    </Typography>
                  )}
                </TabPanel>

                {/* Project Assignments Tab */}
                <TabPanel value={activeTab} index={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Project Assignments</Typography>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setProjectDialogOpen(true)}
                    >
                      Manage Projects
                    </Button>
                  </Box>
                  
                  <List>
                    {projects
                      .filter(project => selectedProjects.includes(project.id))
                      .map(project => (
                        <ListItem key={project.id}>
                          <ListItemText
                            primary={project.projectName}
                            secondary={`Access Level: ${projectAccessLevels[project.id] || 'view'}`}
                          />
                          <Chip
                            label={projectAccessLevels[project.id] || 'view'}
                            color="primary"
                            size="small"
                          />
                        </ListItem>
                      ))}
                  </List>
                </TabPanel>

                {/* Data Filters Tab */}
                <TabPanel value={activeTab} index={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Data Filters</Typography>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setFilterDialogOpen(true)}
                    >
                      Manage Filters
                    </Button>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Budget Range Filter: {dataFilters.budgetRange.enabled ? 'Enabled' : 'Disabled'}
                    </Typography>
                    {dataFilters.budgetRange.enabled && (
                      <Typography variant="body2" color="textSecondary" mb={2}>
                        KES {dataFilters.budgetRange.min.toLocaleString()} - KES {dataFilters.budgetRange.max.toLocaleString()}
                      </Typography>
                    )}
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Status Filter: {dataFilters.allowedStatuses.enabled ? 'Enabled' : 'Disabled'}
                    </Typography>
                    {dataFilters.allowedStatuses.enabled && (
                      <Box mb={2}>
                        {dataFilters.allowedStatuses.values.map(status => (
                          <Chip key={status} label={status} size="small" sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </Box>
                    )}
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Project Type Filter: {dataFilters.projectTypes.enabled ? 'Enabled' : 'Disabled'}
                    </Typography>
                    {dataFilters.projectTypes.enabled && (
                      <Box>
                        {dataFilters.projectTypes.values.map(type => (
                          <Chip key={type} label={type} size="small" sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </Box>
                    )}
                  </Box>
                </TabPanel>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <PersonIcon sx={{ fontSize: 64, color: colors.grey[500], mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  Select a user to manage their access controls
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Department Assignment Dialog */}
      <Dialog open={departmentDialogOpen} onClose={() => setDepartmentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Department Assignments</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={departments}
            getOptionLabel={(option) => option.name}
            value={departments.filter(dept => selectedDepartments.includes(dept.departmentId))}
            onChange={(event, newValue) => {
              setSelectedDepartments(newValue.map(dept => dept.departmentId));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select Departments" variant="outlined" />
            )}
            sx={{ mb: 3, mt: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Primary Department</InputLabel>
            <Select
              value={primaryDepartment}
              onChange={(e) => setPrimaryDepartment(e.target.value)}
              label="Primary Department"
            >
              {departments
                .filter(dept => selectedDepartments.includes(dept.departmentId))
                .map(dept => (
                  <MenuItem key={dept.departmentId} value={dept.departmentId}>
                    {dept.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepartmentDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={saveDepartmentAssignments} variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ward Assignment Dialog */}
      <Dialog open={wardDialogOpen} onClose={() => setWardDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Ward/Region Assignments</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Select subcounties first, then choose specific wards within those subcounties.
          </Typography>
          
          {/* Subcounty Selection */}
          <Autocomplete
            multiple
            options={subcounties}
            getOptionLabel={(option) => option.name}
            value={subcounties.filter(sc => selectedSubcounties.includes(sc.subcountyId))}
            onChange={(event, newValue) => {
              const subcountyIds = newValue.map(sc => sc.subcountyId);
              setSelectedSubcounties(subcountyIds);
              // Clear ward selections when subcounties change
              setSelectedWards([]);
              setWardAccessLevels({});
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select Subcounties" variant="outlined" />
            )}
            sx={{ mb: 3, mt: 2 }}
          />
          
          {/* Ward Selection (filtered by selected subcounties) */}
          {selectedSubcounties.length > 0 && (
            <>
              <Autocomplete
                multiple
                options={filteredWards}
                getOptionLabel={(option) => `${option.name} (${subcounties.find(sc => sc.subcountyId === option.subcountyId)?.name || 'Unknown Subcounty'})`}
                value={filteredWards.filter(ward => selectedWards.includes(ward.wardId))}
                onChange={(event, newValue) => {
                  setSelectedWards(newValue.map(ward => ward.wardId));
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select Wards" variant="outlined" />
                )}
                sx={{ mb: 3 }}
              />
              
              {/* Access Level Configuration for Selected Wards */}
              {selectedWards.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Configure Access Levels:
                  </Typography>
                  {selectedWards.map(wardId => {
                    const ward = wards.find(w => w.wardId === wardId);
                    const subcounty = subcounties.find(sc => sc.subcountyId === ward?.subcountyId);
                    return (
                      <Box key={wardId} display="flex" alignItems="center" mb={2}>
                        <Typography variant="body2" sx={{ minWidth: 200, mr: 2 }}>
                          {ward?.name} ({subcounty?.name})
                        </Typography>
                        <FormControl sx={{ minWidth: 120 }}>
                          <InputLabel>Access Level</InputLabel>
                          <Select
                            value={wardAccessLevels[wardId] || 'read'}
                            onChange={(e) => setWardAccessLevels(prev => ({
                              ...prev,
                              [wardId]: e.target.value
                            }))}
                            label="Access Level"
                          >
                            <MenuItem value="read">Read</MenuItem>
                            <MenuItem value="write">Write</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWardDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={saveWardAssignments} variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Assignment Dialog */}
      <Dialog open={projectDialogOpen} onClose={() => setProjectDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Project Assignments</DialogTitle>
        <DialogContent>
          <Autocomplete
            multiple
            options={projects}
            getOptionLabel={(option) => option.projectName}
            value={projects.filter(project => selectedProjects.includes(project.id))}
            onChange={(event, newValue) => {
              setSelectedProjects(newValue.map(project => project.id));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select Projects" variant="outlined" />
            )}
            sx={{ mb: 3, mt: 2 }}
          />
          
          {projects
            .filter(project => selectedProjects.includes(project.id))
            .map(project => (
              <Box key={project.id} display="flex" alignItems="center" mb={2}>
                <Typography variant="body2" sx={{ minWidth: 200, mr: 2 }}>
                  {project.projectName}
                </Typography>
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Access Level</InputLabel>
                  <Select
                    value={projectAccessLevels[project.id] || 'view'}
                    onChange={(e) => setProjectAccessLevels(prev => ({
                      ...prev,
                      [project.id]: e.target.value
                    }))}
                    label="Access Level"
                  >
                    <MenuItem value="view">View</MenuItem>
                    <MenuItem value="edit">Edit</MenuItem>
                    <MenuItem value="manage">Manage</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={saveProjectAssignments} variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Data Filters Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Data Filters</DialogTitle>
        <DialogContent>
          {/* Budget Range Filter */}
          <Box mb={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={dataFilters.budgetRange.enabled}
                  onChange={(e) => setDataFilters(prev => ({
                    ...prev,
                    budgetRange: { ...prev.budgetRange, enabled: e.target.checked }
                  }))}
                />
              }
              label="Enable Budget Range Filter"
            />
            
            {dataFilters.budgetRange.enabled && (
              <Box display="flex" gap={2} mt={2}>
                <TextField
                  label="Minimum Budget (KES)"
                  type="number"
                  value={dataFilters.budgetRange.min}
                  onChange={(e) => setDataFilters(prev => ({
                    ...prev,
                    budgetRange: { ...prev.budgetRange, min: parseInt(e.target.value) || 0 }
                  }))}
                />
                <TextField
                  label="Maximum Budget (KES)"
                  type="number"
                  value={dataFilters.budgetRange.max}
                  onChange={(e) => setDataFilters(prev => ({
                    ...prev,
                    budgetRange: { ...prev.budgetRange, max: parseInt(e.target.value) || 0 }
                  }))}
                />
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Status Filter */}
          <Box mb={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={dataFilters.allowedStatuses.enabled}
                  onChange={(e) => setDataFilters(prev => ({
                    ...prev,
                    allowedStatuses: { ...prev.allowedStatuses, enabled: e.target.checked }
                  }))}
                />
              }
              label="Enable Status Filter"
            />
            
            {dataFilters.allowedStatuses.enabled && (
              <Autocomplete
                multiple
                freeSolo
                options={['active', 'planning', 'completed', 'on-hold', 'cancelled']}
                value={dataFilters.allowedStatuses.values}
                onChange={(event, newValue) => setDataFilters(prev => ({
                  ...prev,
                  allowedStatuses: { ...prev.allowedStatuses, values: newValue }
                }))}
                renderInput={(params) => (
                  <TextField {...params} label="Allowed Statuses" variant="outlined" />
                )}
                sx={{ mt: 2 }}
              />
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Project Type Filter */}
          <Box mb={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={dataFilters.projectTypes.enabled}
                  onChange={(e) => setDataFilters(prev => ({
                    ...prev,
                    projectTypes: { ...prev.projectTypes, enabled: e.target.checked }
                  }))}
                />
              }
              label="Enable Project Type Filter"
            />
            
            {dataFilters.projectTypes.enabled && (
              <Autocomplete
                multiple
                freeSolo
                options={['infrastructure', 'health', 'education', 'agriculture', 'water', 'environment']}
                value={dataFilters.projectTypes.values}
                onChange={(event, newValue) => setDataFilters(prev => ({
                  ...prev,
                  projectTypes: { ...prev.projectTypes, values: newValue }
                }))}
                renderInput={(params) => (
                  <TextField {...params} label="Allowed Project Types" variant="outlined" />
                )}
                sx={{ mt: 2 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={saveDataFilters} variant="contained" startIcon={<SaveIcon />}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserAccessControlManager;

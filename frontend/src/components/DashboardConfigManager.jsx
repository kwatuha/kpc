import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  useTheme,
  Tabs,
  Tab,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ListSubheader,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  AttachMoney as MoneyIcon,
  Settings as SettingsIcon,
  Visibility as ViewIcon,
  Edit as EditIcon2,
} from '@mui/icons-material';
import { tokens } from '../pages/dashboard/theme';
import dashboardConfigService from '../services/dashboardConfigService';
import { getAllComponents, getComponentsByCategory, COMPONENT_CATEGORIES } from './dashboard/componentRegistry';

const DashboardConfigManager = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Configuration data
  const [roles, setRoles] = useState([]);
  const [components, setComponents] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [permissions, setPermissions] = useState([]);
  
  // Available dashboard components from registry
  const [availableComponents, setAvailableComponents] = useState([]);
  const [selectedComponentCategory, setSelectedComponentCategory] = useState('');
  
  // Role configurations
  const [roleConfigs, setRoleConfigs] = useState({});
  const [selectedRole, setSelectedRole] = useState('admin');
  
  // Dialog states
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openComponentDialog, setOpenComponentDialog] = useState(false);
  const [openTabDialog, setOpenTabDialog] = useState(false);
  
  // Form data
  const [roleFormData, setRoleFormData] = useState({
    roleName: '',
    description: '',
    tabs: [],
    components: {}
  });
  
  const [componentFormData, setComponentFormData] = useState({
    component_key: '',
    component_name: '',
    component_type: '',
    component_file: '',
    description: '',
    is_active: true
  });

  // Form validation states
  const [componentFormErrors, setComponentFormErrors] = useState({});
  const [isValidatingComponent, setIsValidatingComponent] = useState(false);
  
  const [tabFormData, setTabFormData] = useState({
    tab_key: '',
    tab_name: '',
    tab_icon: '',
    tab_order: 1,
    is_active: true
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load available components from registry
      const registryComponents = getAllComponents();
      setAvailableComponents(registryComponents);
      
      // Load roles, components, tabs, and permissions
      const [rolesData, componentsData, tabsData, permissionsData] = await Promise.all([
        dashboardConfigService.getRoles(),
        dashboardConfigService.getAvailableComponents(),
        dashboardConfigService.getAvailableTabs(),
        dashboardConfigService.getAvailablePermissions()
      ]);
      
      setRoles(rolesData);
      setComponents(componentsData);
      setTabs(tabsData);
      setPermissions(permissionsData);
      
      // Load role configurations
      const configs = {};
      for (const role of rolesData) {
        try {
          console.log(`Loading config for role: ${role.roleName}`);
          const config = await dashboardConfigService.getRoleDashboardConfig(role.roleName);
          console.log(`Config loaded for ${role.roleName}:`, config);
          configs[role.roleName] = config;
        } catch (err) {
          console.error(`Error loading config for role ${role.roleName}:`, err);
          // Provide a default configuration structure
          configs[role.roleName] = { 
            role: role.roleName, 
            tabs: [],
            error: `Failed to load configuration for ${role.roleName}: ${err.message}`
          };
        }
      }
      setRoleConfigs(configs);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(`Failed to load dashboard configuration data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleName) => {
    setSelectedRole(roleName);
  };

  const handleSaveRoleConfig = async () => {
    try {
      setLoading(true);
      
      // Get the components that are enabled for this role
      const enabledComponents = roleConfigs[selectedRole]?.components || {};
      
      // For now, we'll create a default "Overview" tab and put all components there
      // This maintains compatibility with the current backend structure
      const configData = {
        tabs: [{
          tab_key: 'overview',
          tab_name: 'Overview',
          tab_icon: 'Dashboard',
          tab_order: 1,
          components: Object.keys(enabledComponents).map((componentKey, index) => ({
            component_key: componentKey,
            component_order: index + 1,
            is_required: enabledComponents[componentKey].is_required || true,
            permissions: enabledComponents[componentKey].settings || {}
          }))
        }]
      };
      
      console.log('Saving role configuration:', selectedRole, configData);
      console.log('Enabled components:', enabledComponents);
      
      // Call the backend API to save the configuration
      await dashboardConfigService.updateRoleDashboardConfig(selectedRole, configData);
      
      setSuccessMessage(`Configuration saved for ${selectedRole} role! Changes have been applied to the dashboard.`);
      
      // Reload data to show current state
      await loadDashboardData();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error saving role config:', err);
      setError(`Failed to save role configuration: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComponent = (tabKey, componentKey, isRequired) => {
    // Update the role configuration state
    setRoleConfigs(prevConfigs => {
      const updatedConfigs = { ...prevConfigs };
      if (updatedConfigs[selectedRole] && updatedConfigs[selectedRole].tabs) {
        updatedConfigs[selectedRole].tabs = updatedConfigs[selectedRole].tabs.map(tab => {
          if (tab.tab_key === tabKey) {
            return {
              ...tab,
              components: tab.components.map(comp => 
                comp.component_key === componentKey 
                  ? { ...comp, is_required: isRequired }
                  : comp
              )
            };
          }
          return tab;
        });
      }
      return updatedConfigs;
    });
  };

  const handleRemoveComponent = (tabKey, componentKey) => {
    if (window.confirm(`Are you sure you want to remove this component from the ${tabKey} tab?`)) {
      setRoleConfigs(prevConfigs => {
        const updatedConfigs = { ...prevConfigs };
        if (updatedConfigs[selectedRole] && updatedConfigs[selectedRole].tabs) {
          updatedConfigs[selectedRole].tabs = updatedConfigs[selectedRole].tabs.map(tab => {
            if (tab.tab_key === tabKey) {
              return {
                ...tab,
                components: tab.components.filter(comp => comp.component_key !== componentKey)
              };
            }
            return tab;
          });
        }
        return updatedConfigs;
      });
    }
  };

  const handleAddComponentToTab = (tabKey) => {
    // This would open a dialog to select from available components
    console.log(`Add component to tab: ${tabKey}`);
    // For now, just show an alert
    alert(`Add component to ${tabKey} tab - This feature can be implemented to show available components`);
  };

  // Component form validation
  const validateComponentForm = () => {
    const errors = {};
    
    // Component Key validation
    if (!componentFormData.component_key.trim()) {
      errors.component_key = 'Component key is required';
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(componentFormData.component_key)) {
      errors.component_key = 'Component key must start with a letter and contain only letters, numbers, and underscores';
    } else if (components.some(comp => comp.component_key === componentFormData.component_key)) {
      errors.component_key = 'Component key already exists';
    }
    
    // Component Name validation
    if (!componentFormData.component_name.trim()) {
      errors.component_name = 'Component name is required';
    } else if (componentFormData.component_name.length < 3) {
      errors.component_name = 'Component name must be at least 3 characters';
    } else if (components.some(comp => comp.component_name === componentFormData.component_name)) {
      errors.component_name = 'Component name already exists';
    }
    
    // Component Type validation
    if (!componentFormData.component_type) {
      errors.component_type = 'Component type is required';
    }
    
    // Component File validation
    if (!componentFormData.component_file.trim()) {
      errors.component_file = 'Please select a component template';
    }
    
    // Description validation
    if (!componentFormData.description.trim()) {
      errors.description = 'Description is required';
    } else if (componentFormData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    setComponentFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate component key from name
  const generateComponentKey = (name) => {
    if (!name || !name.trim()) return '';
    
    let key = name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();
    
    // Ensure it starts with a letter
    if (!/^[a-zA-Z]/.test(key)) {
      key = 'comp_' + key;
    }
    
    // Make it unique if it already exists
    let uniqueKey = key;
    let counter = 1;
    while (components.some(comp => comp.component_key === uniqueKey)) {
      uniqueKey = `${key}_${counter}`;
      counter++;
    }
    
    return uniqueKey;
  };

  // Handle component name change with auto-generation of key
  const handleComponentNameChange = (name) => {
    const newFormData = { ...componentFormData, component_name: name };
    
    // Auto-generate component key if it's empty or was auto-generated
    if (!componentFormData.component_key || 
        componentFormData.component_key === generateComponentKey(componentFormData.component_name)) {
      newFormData.component_key = generateComponentKey(name);
    }
    
    setComponentFormData(newFormData);
    
    // Clear related errors
    const newErrors = { ...componentFormErrors };
    delete newErrors.component_name;
    if (newFormData.component_key !== componentFormData.component_key) {
      delete newErrors.component_key;
    }
    setComponentFormErrors(newErrors);
  };

  // Handle component key change with validation
  const handleComponentKeyChange = (key) => {
    setComponentFormData({ ...componentFormData, component_key: key });
    
    // Clear component key error
    const newErrors = { ...componentFormErrors };
    delete newErrors.component_key;
    setComponentFormErrors(newErrors);
  };

  const handleCreateComponent = async () => {
    const isValid = validateComponentForm();
    if (!isValid) {
      const errorMessages = Object.values(componentFormErrors).join(', ');
      setError(`Please fix the form errors before creating the component: ${errorMessages}`);
      console.log('Component form validation errors:', componentFormErrors);
      console.log('Current form data:', componentFormData);
      return;
    }

    try {
      setLoading(true);
      setIsValidatingComponent(true);
      
      await dashboardConfigService.createComponent(componentFormData);
      
      setSuccessMessage(`Component "${componentFormData.component_name}" created successfully!`);
      setOpenComponentDialog(false);
      
      // Reset form
      setComponentFormData({
        component_key: '',
        component_name: '',
        component_type: '',
        component_file: '',
        description: '',
        is_active: true
      });
      setComponentFormErrors({});
      
      await loadDashboardData();
    } catch (err) {
      console.error('Error creating component:', err);
      setError(err.response?.data?.message || 'Failed to create component');
    } finally {
      setLoading(false);
      setIsValidatingComponent(false);
    }
  };

  const handleCreateTab = async () => {
    try {
      setLoading(true);
      await dashboardConfigService.createTab(tabFormData);
      setOpenTabDialog(false);
      setTabFormData({
        tab_key: '',
        tab_name: '',
        tab_icon: '',
        tab_order: 1,
        is_active: true
      });
      await loadDashboardData();
    } catch (err) {
      console.error('Error creating tab:', err);
      setError('Failed to create tab');
    } finally {
      setLoading(false);
    }
  };

  const getTabIcon = (iconName) => {
    const iconMap = {
      'Dashboard': <DashboardIcon />,
      'People': <PeopleIcon />,
      'Assignment': <AssignmentIcon />,
      'Analytics': <AnalyticsIcon />,
      'AttachMoney': <MoneyIcon />,
      'Settings': <SettingsIcon />
    };
    return iconMap[iconName] || <DashboardIcon />;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading Dashboard Configuration...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={loadDashboardData}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={3}>
        Dashboard Configuration Manager
      </Typography>

      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Role Selection */}
      <Card sx={{ 
        mb: 3,
        borderRadius: 3, 
        bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
        boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
        border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
      }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={2}>
            Select Role to Configure
          </Typography>
          
          <Box display="flex" gap={2} flexWrap="wrap">
            {roles.map((role) => (
              <Button
                key={role.roleName}
                variant={selectedRole === role.roleName ? 'contained' : 'outlined'}
                onClick={() => handleRoleChange(role.roleName)}
                sx={{ 
                  bgcolor: selectedRole === role.roleName ? colors.blueAccent?.[500] : 'transparent',
                  borderColor: colors.blueAccent?.[500],
                  color: selectedRole === role.roleName ? 'white' : colors.blueAccent?.[500],
                  '&:hover': {
                    bgcolor: selectedRole === role.roleName ? colors.blueAccent?.[600] : colors.blueAccent?.[100],
                    color: selectedRole === role.roleName ? 'white' : colors.blueAccent?.[700]
                  }
                }}
              >
                {role.roleName}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Role Configuration Display */}
      {roleConfigs[selectedRole] && (
        <Card sx={{ 
          mb: 3,
          borderRadius: 3, 
          bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
          boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
          border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
        }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
                {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Dashboard Configuration
              </Typography>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setOpenRoleDialog(true)}
                sx={{ 
                  bgcolor: colors.greenAccent?.[500] || '#4caf50',
                  '&:hover': { bgcolor: colors.greenAccent?.[600] || '#388e3c' }
                }}
              >
                Edit Configuration
              </Button>
            </Box>

            {/* Error Display */}
            {roleConfigs[selectedRole].error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {roleConfigs[selectedRole].error}
              </Alert>
            )}

            {/* Tabs Configuration */}
            {roleConfigs[selectedRole].tabs && roleConfigs[selectedRole].tabs.length > 0 ? (
              <Box>
                <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={2}>
                  Dashboard Tabs
                </Typography>
                <Grid container spacing={2}>
                  {roleConfigs[selectedRole].tabs.map((tab, index) => (
                    <Grid item xs={12} md={6} lg={4} key={tab.tab_key}>
                      <Card sx={{ 
                        p: 2,
                        bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                        border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[200]}`,
                        borderRadius: 2
                      }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          {getTabIcon(tab.tab_icon)}
                          <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
                            {tab.tab_name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]} mb={2}>
                          {tab.components?.length || 0} components
                        </Typography>
                        
                        {/* Components in this tab */}
                        {tab.components && tab.components.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                              Components:
                            </Typography>
                            {tab.components.map((component, compIndex) => (
                              <Chip
                                key={compIndex}
                                label={component.component_name}
                                size="small"
                                sx={{ 
                                  mr: 1, 
                                  mb: 1,
                                  bgcolor: theme.palette.mode === 'dark' ? colors.blueAccent?.[600] : colors.blueAccent?.[100],
                                  color: theme.palette.mode === 'dark' ? 'white' : colors.blueAccent?.[700]
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : (
              <Alert severity="info">
                No dashboard configuration found for {selectedRole} role.
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Management Actions */}
      <Card sx={{ 
        borderRadius: 3, 
        bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
        boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
        border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
      }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={3}>
            Management Actions
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setOpenComponentDialog(true)}
                fullWidth
                sx={{ 
                  borderColor: colors.greenAccent?.[500],
                  color: colors.greenAccent?.[500],
                  '&:hover': { 
                    bgcolor: colors.greenAccent?.[100],
                    borderColor: colors.greenAccent?.[700]
                  }
                }}
              >
                Configure Components
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setOpenTabDialog(true)}
                fullWidth
                sx={{ 
                  borderColor: colors.blueAccent?.[500],
                  color: colors.blueAccent?.[500],
                  '&:hover': { 
                    bgcolor: colors.blueAccent?.[100],
                    borderColor: colors.blueAccent?.[700]
                  }
                }}
              >
                Add Tab
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={loadDashboardData}
                fullWidth
                sx={{ 
                  borderColor: colors.redAccent?.[500],
                  color: colors.redAccent?.[500],
                  '&:hover': { 
                    bgcolor: colors.redAccent?.[100],
                    borderColor: colors.redAccent?.[700]
                  }
                }}
              >
                Refresh Data
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Add Components to Role Dialog */}
      <Dialog open={openComponentDialog} onClose={() => setOpenComponentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: colors.blueAccent[700], color: 'white' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <AddIcon />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Add Components to {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Role
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Select which dashboard components this role can access
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: colors.primary[400] }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="bold">
              Component Association:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Select which dashboard components the <strong>{selectedRole}</strong> role can access. 
              Each component can be customized with role-specific settings.
            </Typography>
          </Alert>

          {/* Component Selection by Category */}
          {Object.keys(COMPONENT_CATEGORIES).map(category => (
            <Accordion key={category} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6" fontWeight="bold">
                    {COMPONENT_CATEGORIES[category].name}
                  </Typography>
                  <Chip 
                    label={`${getComponentsByCategory(category).length} components`}
                    size="small"
                    color="primary"
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {COMPONENT_CATEGORIES[category].description}
                </Typography>
                
                <Grid container spacing={2}>
                  {getComponentsByCategory(category).map(component => {
                    const isEnabled = roleConfigs[selectedRole]?.components?.[component.key]?.is_required || false;
                    
                    return (
                      <Grid item xs={12} key={component.key}>
                        <Card 
                          sx={{ 
                            p: 2, 
                            bgcolor: isEnabled ? colors.greenAccent[800] : colors.primary[500],
                            border: isEnabled ? `2px solid ${colors.greenAccent[500]}` : `1px solid ${colors.grey[600]}`
                          }}
                        >
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box flex={1}>
                              <Box display="flex" alignItems="center" gap={2} mb={1}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={isEnabled}
                                      onChange={(e) => {
                                        const newRoleConfigs = { ...roleConfigs };
                                        if (!newRoleConfigs[selectedRole]) {
                                          newRoleConfigs[selectedRole] = { components: {} };
                                        }
                                        if (!newRoleConfigs[selectedRole].components) {
                                          newRoleConfigs[selectedRole].components = {};
                                        }
                                        
                                        if (e.target.checked) {
                                          newRoleConfigs[selectedRole].components[component.key] = {
                                            is_required: true,
                                            component_order: Object.keys(newRoleConfigs[selectedRole].components).length + 1
                                          };
                                        } else {
                                          delete newRoleConfigs[selectedRole].components[component.key];
                                        }
                                        
                                        setRoleConfigs(newRoleConfigs);
                                      }}
                                      color="success"
                                    />
                                  }
                                  label={
                                    <Typography variant="h6" fontWeight="bold">
                                      {component.name}
                                    </Typography>
                                  }
                                />
                                <Chip 
                                  label={component.category} 
                                  size="small" 
                                  color="primary" 
                                />
                              </Box>
                              <Typography variant="body2" color="textSecondary" sx={{ ml: 4 }}>
                                {component.description}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" sx={{ ml: 4, fontStyle: 'italic' }}>
                                Preview: {component.preview}
                              </Typography>
                            </Box>
                            
                            {isEnabled && (
                              <Box sx={{ ml: 2 }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => {
                                    // TODO: Open component configuration dialog
                                    console.log('Configure component:', component.key);
                                  }}
                                  sx={{ color: colors.blueAccent[400] }}
                                >
                                  <SettingsIcon />
                                </IconButton>
                              </Box>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400], p: 3 }}>
          <Button 
            onClick={() => setOpenComponentDialog(false)} 
            color="primary" 
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              try {
                setLoading(true);
                await handleSaveRoleConfig();
                setOpenComponentDialog(false);
                setSuccessMessage(`Component configuration updated for ${selectedRole} role!`);
              } catch (err) {
                setError('Failed to save component configuration');
              } finally {
                setLoading(false);
              }
            }} 
            color="primary" 
            variant="contained" 
            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            disabled={loading}
            sx={{
              bgcolor: colors.greenAccent[600],
              '&:hover': { bgcolor: colors.greenAccent[700] }
            }}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Tab Dialog */}
      <Dialog open={openTabDialog} onClose={() => setOpenTabDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: colors.blueAccent[700], color: 'white' }}>
          Create New Tab
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: colors.primary[400] }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tab Key"
                value={tabFormData.tab_key}
                onChange={(e) => setTabFormData({...tabFormData, tab_key: e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tab Name"
                value={tabFormData.tab_name}
                onChange={(e) => setTabFormData({...tabFormData, tab_name: e.target.value})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tab Icon"
                value={tabFormData.tab_icon}
                onChange={(e) => setTabFormData({...tabFormData, tab_icon: e.target.value})}
                variant="outlined"
                placeholder="e.g., Dashboard, People, Assignment"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tab Order"
                type="number"
                value={tabFormData.tab_order}
                onChange={(e) => setTabFormData({...tabFormData, tab_order: parseInt(e.target.value)})}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={tabFormData.is_active}
                    onChange={(e) => setTabFormData({...tabFormData, is_active: e.target.checked})}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
          <Button onClick={() => setOpenTabDialog(false)} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleCreateTab} color="primary" variant="contained" startIcon={<SaveIcon />}>
            Create Tab
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Role Configuration Dialog */}
      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ backgroundColor: colors.blueAccent[700], color: 'white' }}>
          Edit {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Dashboard Configuration
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: colors.primary[400] }}>
          <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={2}>
            Configure Dashboard Tabs and Components
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Available Actions:</strong>
              <br />• <strong>Toggle Required/Optional:</strong> Use the switches to mark components as required or optional
              <br />• <strong>Remove Components:</strong> Click the delete icon to remove components from tabs
              <br />• <strong>Add Components:</strong> Click "Add Component" to add new components to tabs
              <br />• <strong>Save Changes:</strong> Click "Save Configuration" to apply all changes
              <br />
              <br /><strong>Note:</strong> Changes are applied immediately in the UI. The save function will persist your configuration changes.
            </Typography>
          </Alert>
          
          {roleConfigs[selectedRole] && roleConfigs[selectedRole].tabs && roleConfigs[selectedRole].tabs.length > 0 ? (
            <Box>
              {roleConfigs[selectedRole].tabs.map((tab, index) => (
                <Accordion key={tab.tab_key} sx={{ mb: 2, bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100] }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                      <Box display="flex" alignItems="center">
                        {getTabIcon(tab.tab_icon)}
                        <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
                          {tab.tab_name}
                        </Typography>
                        <Chip 
                          label={`${tab.components?.length || 0} components`} 
                          size="small" 
                          sx={{ ml: 2 }}
                          color="primary"
                        />
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddComponentToTab(tab.tab_key);
                        }}
                        sx={{ mr: 2 }}
                      >
                        Add Component
                      </Button>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {tab.components && tab.components.map((component, compIndex) => (
                        <Grid item xs={12} md={6} key={compIndex}>
                          <Card sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.primary[200] }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                              <Box flex={1}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {component.component_name}
                                </Typography>
                                <Typography variant="body2" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]} mb={1}>
                                  {component.component_type} • {component.component_file}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveComponent(tab.tab_key, component.component_key)}
                                sx={{ 
                                  color: colors.redAccent?.[500] || '#f44336',
                                  '&:hover': { bgcolor: colors.redAccent?.[100] || '#ffebee' }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={component.is_required}
                                    onChange={(e) => {
                                      handleToggleComponent(tab.tab_key, component.component_key, e.target.checked);
                                    }}
                                    color="primary"
                                  />
                                }
                                label="Required"
                              />
                              <Chip
                                label={component.is_required ? "Required" : "Optional"}
                                size="small"
                                color={component.is_required ? "error" : "default"}
                                variant={component.is_required ? "filled" : "outlined"}
                              />
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              No configuration found for {selectedRole} role. You can add components and tabs using the management actions below.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400] }}>
          <Button onClick={() => setOpenRoleDialog(false)} color="primary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSaveRoleConfig} color="primary" variant="contained" startIcon={<SaveIcon />}>
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardConfigManager;

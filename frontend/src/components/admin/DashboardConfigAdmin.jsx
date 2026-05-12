import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { tokens } from '../../pages/dashboard/theme';
import { useDashboardComponentManagement, useRoleDashboardManagement } from '../../hooks/useDatabaseDashboardConfig';

const DashboardConfigAdmin = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [activeTab, setActiveTab] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [formData, setFormData] = useState({
    component_key: '',
    component_name: '',
    component_type: 'card',
    component_file: '',
    description: '',
    is_active: true
  });

  const {
    components,
    loading: componentsLoading,
    error: componentsError,
    fetchComponents,
    createComponent,
    updateComponent,
    deleteComponent
  } = useDashboardComponentManagement();

  const {
    updateRoleConfig,
    updateRolePermissions
  } = useRoleDashboardManagement();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedComponent) {
        await updateComponent(selectedComponent.component_key, formData);
      } else {
        await createComponent(formData);
      }
      setEditDialogOpen(false);
      setSelectedComponent(null);
      setFormData({
        component_key: '',
        component_name: '',
        component_type: 'card',
        component_file: '',
        description: '',
        is_active: true
      });
    } catch (error) {
      console.error('Error saving component:', error);
    }
  };

  // Handle edit
  const handleEdit = (component) => {
    setSelectedComponent(component);
    setFormData({
      component_key: component.component_key,
      component_name: component.component_name,
      component_type: component.component_type,
      component_file: component.component_file,
      description: component.description,
      is_active: component.is_active
    });
    setEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (componentKey) => {
    if (window.confirm('Are you sure you want to delete this component?')) {
      try {
        await deleteComponent(componentKey);
      } catch (error) {
        console.error('Error deleting component:', error);
      }
    }
  };

  // Handle add new
  const handleAddNew = () => {
    setSelectedComponent(null);
    setFormData({
      component_key: '',
      component_name: '',
      component_type: 'card',
      component_file: '',
      description: '',
      is_active: true
    });
    setEditDialogOpen(true);
  };

  if (componentsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading dashboard configuration...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
          Dashboard Configuration Admin
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchComponents}
            sx={{ 
              borderColor: colors.blueAccent?.[500] || '#6870fa',
              color: colors.blueAccent?.[500] || '#6870fa'
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{ 
              bgcolor: colors.greenAccent?.[500] || '#4caf50',
              '&:hover': { bgcolor: colors.greenAccent?.[600] || '#388e3c' }
            }}
          >
            Add Component
          </Button>
        </Box>
      </Box>

      {componentsError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {componentsError}
        </Alert>
      )}

      {/* Components Table */}
      <Card sx={{ 
        borderRadius: 3, 
        bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
        boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
        border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
      }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]} mb={2}>
            Dashboard Components
          </Typography>
          
          <TableContainer component={Paper} sx={{ 
            bgcolor: 'transparent',
            boxShadow: 'none',
            border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
            borderRadius: 2
          }}>
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100] 
                }}>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900] }}>
                    Component Key
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900] }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900] }}>
                    Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900] }}>
                    File
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900] }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900] }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {components.map((component) => (
                  <TableRow key={component.component_key} hover>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700] }}>
                      {component.component_key}
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700] }}>
                      {component.component_name}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={component.component_type} 
                        size="small" 
                        sx={{ 
                          bgcolor: colors.blueAccent?.[500] || '#6870fa',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700] }}>
                      {component.component_file}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={component.is_active ? 'Active' : 'Inactive'} 
                        size="small" 
                        sx={{ 
                          bgcolor: component.is_active ? 
                            (colors.greenAccent?.[500] || '#4caf50') : 
                            (colors.redAccent?.[500] || '#f44336'),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(component)}
                          sx={{ 
                            color: colors.blueAccent?.[500] || '#6870fa',
                            '&:hover': { bgcolor: colors.blueAccent?.[500] + '10' }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(component.component_key)}
                          sx={{ 
                            color: colors.redAccent?.[500] || '#f44336',
                            '&:hover': { bgcolor: colors.redAccent?.[500] + '10' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
          color: theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]
        }}>
          {selectedComponent ? 'Edit Component' : 'Add New Component'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Component Key"
                  value={formData.component_key}
                  onChange={(e) => setFormData({ ...formData, component_key: e.target.value })}
                  required
                  disabled={!!selectedComponent}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Component Name"
                  value={formData.component_name}
                  onChange={(e) => setFormData({ ...formData, component_name: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Component Type</InputLabel>
                  <Select
                    value={formData.component_type}
                    onChange={(e) => setFormData({ ...formData, component_type: e.target.value })}
                    label="Component Type"
                  >
                    <MenuItem value="card">Card</MenuItem>
                    <MenuItem value="list">List</MenuItem>
                    <MenuItem value="chart">Chart</MenuItem>
                    <MenuItem value="form">Form</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Component File"
                  value={formData.component_file}
                  onChange={(e) => setFormData({ ...formData, component_file: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            startIcon={<CancelIcon />}
            sx={{ 
              borderColor: colors.grey[400],
              color: colors.grey[600]
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ 
              bgcolor: colors.greenAccent?.[500] || '#4caf50',
              '&:hover': { bgcolor: colors.greenAccent?.[600] || '#388e3c' }
            }}
          >
            {selectedComponent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardConfigAdmin;












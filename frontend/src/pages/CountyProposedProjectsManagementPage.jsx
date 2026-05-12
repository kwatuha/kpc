import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Menu,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  TrendingUp as TrendingUpIcon,
  Cancel as CancelIcon,
  Engineering as EngineeringIcon,
  Assessment as AssessmentIcon,
  School as SchoolIcon,
  LocalHospital as HealthIcon,
  Water as WaterIcon,
  Agriculture as AgricultureIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import countyProposedProjectsService from '../api/countyProposedProjectsService';
import { formatCurrency } from '../utils/helpers';

const categories = [
  'All',
  'Infrastructure',
  'Technology',
  'Agriculture',
  'Health',
  'Education',
  'Water & Sanitation',
];

const statuses = [
  'All',
  'Planning',
  'Approved',
  'Implementation',
  'Completed',
  'Cancelled',
];

const priorities = [
  'All',
  'High',
  'Medium',
  'Low',
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Planning':
      return { background: '#ff9800', text: '#ffffff', icon: <HourglassEmptyIcon sx={{ color: '#ffffff' }} /> };
    case 'Approved':
      return { background: '#2196f3', text: '#ffffff', icon: <CheckCircleIcon sx={{ color: '#ffffff' }} /> };
    case 'Implementation':
      return { background: '#4caf50', text: '#ffffff', icon: <TrendingUpIcon sx={{ color: '#ffffff' }} /> };
    case 'Completed':
      return { background: '#9e9e9e', text: '#ffffff', icon: <CheckCircleIcon sx={{ color: '#ffffff' }} /> };
    case 'Cancelled':
      return { background: '#f44336', text: '#ffffff', icon: <CancelIcon sx={{ color: '#ffffff' }} /> };
    default:
      return { background: '#e0e0e0', text: '#424242', icon: null };
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return { background: '#f44336', text: '#ffffff' };
    case 'Medium':
      return { background: '#ff9800', text: '#ffffff' };
    case 'Low':
      return { background: '#4caf50', text: '#ffffff' };
    default:
      return { background: '#e0e0e0', text: '#424242' };
  }
};

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Infrastructure':
      return <EngineeringIcon sx={{ fontSize: 20 }} />;
    case 'Technology':
      return <AssessmentIcon sx={{ fontSize: 20 }} />;
    case 'Agriculture':
      return <AgricultureIcon sx={{ fontSize: 20 }} />;
    case 'Health':
      return <HealthIcon sx={{ fontSize: 20 }} />;
    case 'Education':
      return <SchoolIcon sx={{ fontSize: 20 }} />;
    case 'Water & Sanitation':
      return <WaterIcon sx={{ fontSize: 20 }} />;
    default:
      return <BusinessIcon sx={{ fontSize: 20 }} />;
  }
};

const CountyProposedProjectsManagementPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    category: 'All',
    status: 'All',
    priority: 'All',
    search: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    estimatedCost: '',
    justification: '',
    expectedBenefits: '',
    timeline: '',
    status: 'Planning',
    priority: 'Medium',
    department: '',
    projectManager: '',
    contact: '',
    startDate: '',
    endDate: '',
    progress: 0,
    budgetAllocated: 0,
    budgetUtilized: 0,
    stakeholders: '',
    risks: '',
    milestones: []
  });

  useEffect(() => {
    fetchProjects();
  }, [filters, page]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(filters.category !== 'All' && { category: filters.category }),
        ...(filters.status !== 'All' && { status: filters.status }),
        ...(filters.priority !== 'All' && { priority: filters.priority }),
        ...(filters.search && { search: filters.search })
      };
      
      const data = await countyProposedProjectsService.getProjects(params);
      setProjects(data.projects || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title || '',
        description: project.description || '',
        category: project.category || '',
        location: project.location || '',
        estimatedCost: project.estimated_cost || '',
        justification: project.justification || '',
        expectedBenefits: project.expected_benefits || '',
        timeline: project.timeline || '',
        status: project.status || 'Planning',
        priority: project.priority || 'Medium',
        department: project.department || '',
        projectManager: project.project_manager || '',
        contact: project.contact || '',
        startDate: project.start_date || '',
        endDate: project.end_date || '',
        progress: project.progress || 0,
        budgetAllocated: project.budget_allocated || 0,
        budgetUtilized: project.budget_utilized || 0,
        stakeholders: Array.isArray(project.stakeholders) 
          ? project.stakeholders.join(', ') 
          : (project.stakeholders || ''),
        risks: Array.isArray(project.risks) 
          ? project.risks.join(', ') 
          : (project.risks || ''),
        milestones: project.milestones || []
      });
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        estimatedCost: '',
        justification: '',
        expectedBenefits: '',
        timeline: '',
        status: 'Planning',
        priority: 'Medium',
        department: '',
        projectManager: '',
        contact: '',
        startDate: '',
        endDate: '',
        progress: 0,
        budgetAllocated: 0,
        budgetUtilized: 0,
        stakeholders: '',
        risks: '',
        milestones: []
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProject(null);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost),
        progress: parseFloat(formData.progress),
        budgetAllocated: parseFloat(formData.budgetAllocated),
        budgetUtilized: parseFloat(formData.budgetUtilized),
        stakeholders: formData.stakeholders ? formData.stakeholders.split(',').map(s => s.trim()) : [],
        risks: formData.risks ? formData.risks.split(',').map(r => r.trim()) : []
      };

      if (editingProject) {
        await countyProposedProjectsService.updateProject(editingProject.id, submitData);
        setSuccessMessage('Project updated successfully!');
      } else {
        await countyProposedProjectsService.createProject(submitData);
        setSuccessMessage('Project created successfully!');
      }
      
      handleCloseDialog();
      fetchProjects();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error saving project:', err);
      setError(err.response?.data?.error || 'Failed to save project. Please try again.');
    }
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
    setMenuAnchor(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await countyProposedProjectsService.deleteProject(projectToDelete.id);
      setSuccessMessage('Project deleted successfully!');
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
      fetchProjects();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
    }
  };

  const handleMenuOpen = (event, project) => {
    setMenuAnchor(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedProject(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Proposed Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage projects proposed by the County Government
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none' }}
        >
          Add New Project
        </Button>
      </Box>

      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Projects Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Title</strong></TableCell>
                <TableCell><strong>Category</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Priority</strong></TableCell>
                <TableCell><strong>Budget</strong></TableCell>
                <TableCell><strong>Progress</strong></TableCell>
                <TableCell><strong>Department</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No projects found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => {
                  const statusInfo = getStatusColor(project.status);
                  const priorityInfo = getPriorityColor(project.priority);
                  const budgetUtilization = project.budget_allocated > 0 
                    ? (project.budget_utilized / project.budget_allocated) * 100 
                    : 0;

                  return (
                    <TableRow key={project.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {project.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.location}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getCategoryIcon(project.category)}
                          <Typography variant="body2">{project.category}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.status}
                          size="small"
                          sx={{
                            backgroundColor: statusInfo.background,
                            color: statusInfo.text,
                            fontWeight: 'bold',
                          }}
                          icon={statusInfo.icon}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={project.priority}
                          size="small"
                          sx={{
                            backgroundColor: priorityInfo.background,
                            color: priorityInfo.text,
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(project.estimated_cost)}
                        </Typography>
                        {project.budget_allocated > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Utilized: {budgetUtilization.toFixed(1)}%
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ minWidth: 100 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={project.progress} 
                            sx={{ height: 6, borderRadius: 3, mb: 0.5 }} 
                          />
                          <Typography variant="caption">{project.progress}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{project.department}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {project.project_manager}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(project)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteClick(project)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Box display="flex" gap={1} alignItems="center">
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              size="small"
            >
              Previous
            </Button>
            <Typography variant="body2">
              Page {page} of {totalPages}
            </Typography>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              size="small"
            >
              Next
            </Button>
          </Box>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
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
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.filter(c => c !== 'All').map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Estimated Cost (KES)"
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Timeline"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                placeholder="e.g., 18 months"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {statuses.filter(s => s !== 'All').map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  {priorities.filter(p => p !== 'All').map((priority) => (
                    <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Manager"
                value={formData.projectManager}
                onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Progress (%)"
                type="number"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Budget Allocated (KES)"
                type="number"
                value={formData.budgetAllocated}
                onChange={(e) => setFormData({ ...formData, budgetAllocated: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Budget Utilized (KES)"
                type="number"
                value={formData.budgetUtilized}
                onChange={(e) => setFormData({ ...formData, budgetUtilized: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Justification"
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Expected Benefits"
                value={formData.expectedBenefits}
                onChange={(e) => setFormData({ ...formData, expectedBenefits: e.target.value })}
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Stakeholders (comma-separated)"
                value={formData.stakeholders}
                onChange={(e) => setFormData({ ...formData, stakeholders: e.target.value })}
                placeholder="e.g., County Assembly, Tourism Board"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Risks (comma-separated)"
                value={formData.risks}
                onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
                placeholder="e.g., Budget constraints, Environmental impact"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingProject ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{projectToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CountyProposedProjectsManagementPage;


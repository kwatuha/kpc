import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Paper,
  Card,
  CardContent
} from '@mui/material';
import {
  Close,
  Business,
  Assessment,
  TrendingUp,
  CheckCircle,
  Construction,
  Warning,
  Comment
} from '@mui/icons-material';
import { getProjectsByDepartment } from '../services/publicApi';
import { formatCurrency, formatDate } from '../utils/formatters';
import ProjectFeedbackModal from './ProjectFeedbackModal';

const DepartmentProjectsModal = ({ open, onClose, department, finYearId }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (open && department) {
      fetchProjects();
    }
  }, [open, department, finYearId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjectsByDepartment(department.department_id, finYearId);
      setProjects(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching department projects:', err);
      setError('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Completed': 'success',
      'Ongoing': 'info',
      'Stalled': 'error',
      'Not Started': 'warning',
      'Under Procurement': 'secondary'
    };
    return statusColors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Completed': <CheckCircle />,
      'Ongoing': <Construction />,
      'Stalled': <Warning />,
      'Not Started': <Warning />,
      'Under Procurement': <Assessment />
    };
    return icons[status] || <Assessment />;
  };

  const handleOpenFeedback = (project) => {
    setSelectedProject(project);
    setFeedbackModalOpen(true);
  };

  const handleCloseFeedback = () => {
    setFeedbackModalOpen(false);
    setSelectedProject(null);
  };

  // Group projects by status
  const groupedProjects = projects.reduce((acc, project) => {
    const status = project.status || 'Unknown';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(project);
    return acc;
  }, {});

  const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <Business color="primary" />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {department?.department_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Department Project Portfolio
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            {/* Summary Statistics */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {projects.length}
                        </Typography>
                        <Typography variant="body2">
                          Total Projects
                        </Typography>
                      </Box>
                      <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {formatCurrency(totalBudget)}
                        </Typography>
                        <Typography variant="body2">
                          Total Budget
                        </Typography>
                      </Box>
                      <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {groupedProjects['Completed']?.length || 0}
                        </Typography>
                        <Typography variant="body2">
                          Completed
                        </Typography>
                      </Box>
                      <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {groupedProjects['Ongoing']?.length || 0}
                        </Typography>
                        <Typography variant="body2">
                          Ongoing
                        </Typography>
                      </Box>
                      <Construction sx={{ fontSize: 40, opacity: 0.8 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Projects by Status */}
            {Object.keys(groupedProjects).length > 0 ? (
              Object.entries(groupedProjects).map(([status, statusProjects]) => (
                <Box key={status} sx={{ mb: 3 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    {getStatusIcon(status)}
                    <Typography variant="h6" fontWeight="bold">
                      {status}
                    </Typography>
                    <Chip
                      label={statusProjects.length}
                      color={getStatusColor(status)}
                      size="small"
                    />
                  </Box>

                  <Paper elevation={2} sx={{ borderRadius: 2 }}>
                    <List>
                      {statusProjects.map((project, index) => (
                        <React.Fragment key={project.id || index}>
                          <ListItem
                            sx={{
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              },
                              display: 'block'
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
                                  <Typography variant="subtitle1" fontWeight="medium" sx={{ flex: 1 }}>
                                    {project.project_name}
                                  </Typography>
                                  <Box display="flex" gap={1} alignItems="center">
                                    <Chip
                                      label={formatCurrency(project.budget || 0)}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                    <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => handleOpenFeedback(project)}
                                      title="Submit Feedback"
                                    >
                                      <Comment />
                                    </IconButton>
                                  </Box>
                                </Box>
                              }
                              secondary={
                                <Box>
                                  {project.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                      {project.description}
                                    </Typography>
                                  )}
                                  <Box display="flex" gap={2} mt={1} flexWrap="wrap">
                                    {project.ward_name && (
                                      <Chip
                                        label={`Ward: ${project.ward_name}`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                    {project.subcounty_name && (
                                      <Chip
                                        label={`SubCounty: ${project.subcounty_name}`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                    {project.start_date && (
                                      <Typography variant="caption" color="text.secondary">
                                        Start: {formatDate(project.start_date)}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < statusProjects.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                </Box>
              ))
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No projects found for this department
                </Typography>
              </Paper>
            )}
          </>
        )}
      </DialogContent>

      {/* Project Feedback Modal */}
      {selectedProject && (
        <ProjectFeedbackModal
          open={feedbackModalOpen}
          onClose={handleCloseFeedback}
          project={selectedProject}
        />
      )}
    </Dialog>
  );
};

export default DepartmentProjectsModal;


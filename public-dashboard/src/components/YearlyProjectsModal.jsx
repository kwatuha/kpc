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
  CardContent,
  Button
} from '@mui/material';
import {
  Close,
  Assessment,
  TrendingUp,
  Comment,
  Construction,
  Business,
  LocationOn,
  AttachMoney
} from '@mui/icons-material';
import { getProjectsByFinancialYear } from '../services/publicApi';
import { formatCurrency, formatDate } from '../utils/formatters';
import ProjectFeedbackModal from './ProjectFeedbackModal';

const YearlyProjectsModal = ({ open, onClose, yearData, finYearId }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (open && finYearId) {
      fetchProjects();
    }
  }, [open, finYearId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjectsByFinancialYear(finYearId);
      setProjects(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching yearly projects:', err);
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
      'Under Procurement': 'secondary',
      'New': 'info'
    };
    return statusColors[status] || 'default';
  };

  const handleOpenFeedback = (project) => {
    setSelectedProject(project);
    setFeedbackModalOpen(true);
  };

  const handleCloseFeedback = () => {
    setFeedbackModalOpen(false);
    setSelectedProject(null);
  };

  const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.costOfProject || p.budget) || 0), 0);
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const ongoingCount = projects.filter(p => p.status === 'Ongoing' || p.status === 'New').length;
  const plannedCount = projects.filter(p => p.status === 'Not Started' || p.status === 'Under Procurement').length;

  // Group projects by department
  const projectsByDepartment = projects.reduce((acc, project) => {
    const deptName = project.departmentName || project.department_name || 'Unassigned';
    if (!acc[deptName]) {
      acc[deptName] = [];
    }
    acc[deptName].push(project);
    return acc;
  }, {});

  return (
    <>
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
              <Assessment color="primary" />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {yearData?.year} Projects
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Financial Year Project Details
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Loading projects...
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <>
              {/* Summary Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h5" fontWeight="bold">
                            {projects.length}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Total Projects
                          </Typography>
                        </Box>
                        <Assessment sx={{ fontSize: 32, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h5" fontWeight="bold">
                            {formatCurrency(totalBudget)}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Total Budget
                          </Typography>
                        </Box>
                        <AttachMoney sx={{ fontSize: 32, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h5" fontWeight="bold">
                            {completedCount}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Completed
                          </Typography>
                        </Box>
                        <Construction sx={{ fontSize: 32, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                    <CardContent sx={{ py: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="h5" fontWeight="bold">
                            {ongoingCount}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Ongoing
                          </Typography>
                        </Box>
                        <TrendingUp sx={{ fontSize: 32, opacity: 0.8 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Projects by Department */}
              {Object.keys(projectsByDepartment).map((departmentName) => {
                const deptProjects = projectsByDepartment[departmentName];
                const deptBudget = deptProjects.reduce((sum, p) => sum + (parseFloat(p.costOfProject || p.budget) || 0), 0);

                return (
                  <Paper key={departmentName} sx={{ mb: 3, borderRadius: 2 }} elevation={1}>
                    <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: '8px 8px 0 0' }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Business color="primary" />
                          <Typography variant="h6" fontWeight="bold">
                            {departmentName}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={2}>
                          <Chip 
                            label={`${deptProjects.length} projects`} 
                            color="primary" 
                            size="small"
                          />
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {formatCurrency(deptBudget)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <List sx={{ p: 0 }}>
                      {deptProjects.map((project, index) => (
                        <React.Fragment key={project.id || index}>
                          <ListItem sx={{ py: 2 }}>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {project.projectName || project.project_name}
                                  </Typography>
                                  <Chip
                                    label={project.status || 'New'}
                                    color={getStatusColor(project.status)}
                                    size="small"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {project.projectDescription || project.description || 'No description available'}
                                  </Typography>
                                  <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
                                      <Typography variant="body2" fontWeight="bold">
                                        {formatCurrency(project.costOfProject || project.budget || 0)}
                                      </Typography>
                                    </Box>
                                    {project.subcountyName && (
                                      <Box display="flex" alignItems="center" gap={0.5}>
                                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                          {project.subcountyName}
                                        </Typography>
                                      </Box>
                                    )}
                                    {project.wardName && (
                                      <Typography variant="body2" color="text.secondary">
                                        • {project.wardName}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              }
                            />
                            <Box display="flex" gap={1}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<Comment />}
                                onClick={() => handleOpenFeedback(project)}
                                sx={{ minWidth: 'auto' }}
                              >
                                Feedback
                              </Button>
                            </Box>
                          </ListItem>
                          {index < deptProjects.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Paper>
                );
              })}

              {projects.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Assessment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No projects found for {yearData?.year}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Projects may not be available for this financial year.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Project Feedback Modal */}
      {selectedProject && (
        <ProjectFeedbackModal
          open={feedbackModalOpen}
          onClose={handleCloseFeedback}
          project={selectedProject}
        />
      )}
    </>
  );
};

export default YearlyProjectsModal;


























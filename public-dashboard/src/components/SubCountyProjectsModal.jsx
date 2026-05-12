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
  LocationOn,
  Assessment,
  CheckCircle,
  TrendingUp,
  Comment,
  Construction
} from '@mui/icons-material';
import { getProjectsBySubCounty } from '../services/publicApi';
import { formatCurrency, formatDate } from '../utils/formatters';
import ProjectFeedbackModal from './ProjectFeedbackModal';

const SubCountyProjectsModal = ({ open, onClose, subCounty, finYearId }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    if (open && subCounty) {
      fetchProjects();
    }
  }, [open, subCounty, finYearId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjectsBySubCounty(subCounty.subcounty_id, finYearId);
      setProjects(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching subcounty projects:', err);
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

  const handleOpenFeedback = (project) => {
    setSelectedProject(project);
    setFeedbackModalOpen(true);
  };

  const handleCloseFeedback = () => {
    setFeedbackModalOpen(false);
    setSelectedProject(null);
  };

  const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const ongoingCount = projects.filter(p => p.status === 'Ongoing').length;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
            <LocationOn color="success" />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {subCounty?.subcounty_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sub-County Projects
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
              <Grid item xs={12} sm={4}>
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

              <Grid item xs={12} sm={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {completedCount}
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

              <Grid item xs={12} sm={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="h6" fontWeight="bold" noWrap>
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
            </Grid>

            {/* Projects List */}
            {projects.length > 0 ? (
              <Paper elevation={2} sx={{ borderRadius: 2 }}>
                <List>
                  {projects.map((project, index) => (
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
                                  label={project.status || 'Unknown'}
                                  color={getStatusColor(project.status)}
                                  size="small"
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
                              <Box display="flex" gap={2} mt={1} flexWrap="wrap" alignItems="center">
                                <Chip
                                  label={formatCurrency(project.budget || 0)}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                {project.ward_name && (
                                  <Chip
                                    label={`Ward: ${project.ward_name}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                                {project.department_name && (
                                  <Chip
                                    label={project.department_name}
                                    size="small"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < projects.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No projects found for this sub-county
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

export default SubCountyProjectsModal;


import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Engineering as EngineeringIcon,
  School as SchoolIcon,
  LocalHospital as HealthIcon,
  Water as WaterIcon,
  Agriculture as AgricultureIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { formatCurrency } from '../utils/formatters';
import { getCountyProposedProjects } from '../services/publicApi';

// Mock API service for county proposed projects (kept for reference)
const mockProjectsData = [
          {
            id: 1,
            title: 'Kisumu Lakefront Development Phase II',
            category: 'Infrastructure',
            description: 'Development of the second phase of the Kisumu Lakefront including modern recreational facilities, walkways, and commercial spaces.',
            location: 'Kisumu Central',
            estimatedCost: 250000000,
            justification: 'To enhance tourism, create employment opportunities, and improve the city\'s aesthetic appeal.',
            expectedBenefits: 'Increased tourism revenue, job creation, improved city image, enhanced recreational facilities.',
            timeline: '18 months',
            status: 'Planning',
            priority: 'High',
            department: 'Department of Physical Planning',
            projectManager: 'Dr. Sarah Wanjiku',
            contact: 'planning@kisumu.go.ke',
            startDate: '2024-12-01',
            endDate: '2026-05-31',
            progress: 15,
            budgetAllocated: 50000000,
            budgetUtilized: 7500000,
            stakeholders: ['County Assembly', 'Tourism Board', 'Environmental Authority'],
            risks: ['Environmental impact', 'Community displacement', 'Budget constraints'],
            milestones: [
              { name: 'Environmental Impact Assessment', completed: true, date: '2024-10-15' },
              { name: 'Community Consultation', completed: true, date: '2024-11-01' },
              { name: 'Design Finalization', completed: false, date: '2024-12-15' },
              { name: 'Tender Award', completed: false, date: '2025-02-01' },
              { name: 'Construction Start', completed: false, date: '2025-03-01' }
            ]
          },
          {
            id: 2,
            title: 'Smart City Digital Infrastructure',
            category: 'Technology',
            description: 'Implementation of smart city technologies including IoT sensors, digital payment systems, and e-governance platforms.',
            location: 'Kisumu County',
            estimatedCost: 180000000,
            justification: 'To modernize service delivery, improve efficiency, and enhance citizen engagement.',
            expectedBenefits: 'Improved service delivery, reduced corruption, enhanced transparency, better data-driven decisions.',
            timeline: '24 months',
            status: 'Approved',
            priority: 'High',
            department: 'ICT Department',
            projectManager: 'Eng. Michael Ochieng',
            contact: 'ict@kisumu.go.ke',
            startDate: '2024-11-01',
            endDate: '2026-10-31',
            progress: 25,
            budgetAllocated: 45000000,
            budgetUtilized: 11250000,
            stakeholders: ['National ICT Authority', 'Telecom Companies', 'Software Vendors'],
            risks: ['Technology obsolescence', 'Cybersecurity threats', 'User adoption'],
            milestones: [
              { name: 'Feasibility Study', completed: true, date: '2024-09-30' },
              { name: 'Vendor Selection', completed: true, date: '2024-10-31' },
              { name: 'Pilot Implementation', completed: false, date: '2025-01-31' },
              { name: 'Full Deployment', completed: false, date: '2025-06-30' },
              { name: 'Training & Support', completed: false, date: '2025-12-31' }
            ]
          },
          {
            id: 3,
            title: 'Agricultural Value Chain Development',
            category: 'Agriculture',
            description: 'Comprehensive agricultural development program focusing on value addition, market linkages, and farmer capacity building.',
            location: 'Nyando, Muhoroni, Nyakach',
            estimatedCost: 120000000,
            justification: 'To boost agricultural productivity, reduce post-harvest losses, and increase farmer incomes.',
            expectedBenefits: 'Increased farmer incomes, reduced food waste, improved food security, job creation.',
            timeline: '36 months',
            status: 'Implementation',
            priority: 'Medium',
            department: 'Department of Agriculture',
            projectManager: 'Dr. Grace Akinyi',
            contact: 'agriculture@kisumu.go.ke',
            startDate: '2024-08-01',
            endDate: '2027-07-31',
            progress: 40,
            budgetAllocated: 30000000,
            budgetUtilized: 12000000,
            stakeholders: ['Farmers Cooperatives', 'Agricultural Research Institute', 'Export Companies'],
            risks: ['Climate change', 'Market volatility', 'Farmer adoption'],
            milestones: [
              { name: 'Farmer Registration', completed: true, date: '2024-08-31' },
              { name: 'Training Programs', completed: true, date: '2024-10-31' },
              { name: 'Equipment Distribution', completed: false, date: '2025-01-31' },
              { name: 'Market Linkages', completed: false, date: '2025-06-30' },
              { name: 'Value Addition Centers', completed: false, date: '2026-03-31' }
            ]
          },
          {
            id: 4,
            title: 'Universal Healthcare Access Program',
            category: 'Health',
            description: 'Expansion of healthcare services to ensure universal access to quality healthcare across all wards.',
            location: 'All Wards',
            estimatedCost: 200000000,
            justification: 'To improve health outcomes, reduce maternal and child mortality, and ensure healthcare equity.',
            expectedBenefits: 'Improved health outcomes, reduced mortality rates, better healthcare access, enhanced quality of life.',
            timeline: '30 months',
            status: 'Planning',
            priority: 'High',
            department: 'Department of Health',
            projectManager: 'Dr. Peter Mwangi',
            contact: 'health@kisumu.go.ke',
            startDate: '2025-01-01',
            endDate: '2027-06-30',
            progress: 10,
            budgetAllocated: 50000000,
            budgetUtilized: 5000000,
            stakeholders: ['Ministry of Health', 'WHO', 'Medical Practitioners'],
            risks: ['Resource constraints', 'Staff shortages', 'Infrastructure challenges'],
            milestones: [
              { name: 'Needs Assessment', completed: true, date: '2024-11-30' },
              { name: 'Facility Mapping', completed: false, date: '2025-01-31' },
              { name: 'Staff Recruitment', completed: false, date: '2025-03-31' },
              { name: 'Equipment Procurement', completed: false, date: '2025-06-30' },
              { name: 'Service Launch', completed: false, date: '2025-09-30' }
            ]
          },
          {
            id: 5,
            title: 'Youth Skills Development Centers',
            category: 'Education',
            description: 'Establishment of modern skills development centers to equip youth with market-relevant technical skills.',
            location: 'Kisumu Central, Nyando, Muhoroni',
            estimatedCost: 150000000,
            justification: 'To address youth unemployment, equip youth with marketable skills, and promote entrepreneurship.',
            expectedBenefits: 'Reduced youth unemployment, increased entrepreneurship, improved economic productivity, social stability.',
            timeline: '24 months',
            status: 'Approved',
            priority: 'Medium',
            department: 'Department of Youth Affairs',
            projectManager: 'Ms. Jane Adhiambo',
            contact: 'youth@kisumu.go.ke',
            startDate: '2024-12-01',
            endDate: '2026-11-30',
            progress: 20,
            budgetAllocated: 37500000,
            budgetUtilized: 7500000,
            stakeholders: ['TVET Authority', 'Private Sector', 'Youth Groups'],
            risks: ['Low enrollment', 'Equipment maintenance', 'Industry relevance'],
            milestones: [
              { name: 'Site Selection', completed: true, date: '2024-10-31' },
              { name: 'Curriculum Development', completed: true, date: '2024-11-30' },
              { name: 'Facility Construction', completed: false, date: '2025-06-30' },
              { name: 'Equipment Installation', completed: false, date: '2025-08-31' },
              { name: 'Training Commencement', completed: false, date: '2025-10-01' }
            ]
          },
          {
            id: 6,
            title: 'Water and Sanitation Improvement',
            category: 'Water & Sanitation',
            description: 'Comprehensive water and sanitation improvement program including borehole drilling, water treatment, and sanitation facilities.',
            location: 'Rural Wards',
            estimatedCost: 100000000,
            justification: 'To improve access to clean water, reduce waterborne diseases, and enhance sanitation standards.',
            expectedBenefits: 'Improved water access, reduced diseases, better sanitation, enhanced quality of life.',
            timeline: '18 months',
            status: 'Implementation',
            priority: 'High',
            department: 'Department of Water',
            projectManager: 'Eng. Susan Owino',
            contact: 'water@kisumu.go.ke',
            startDate: '2024-09-01',
            endDate: '2026-02-28',
            progress: 35,
            budgetAllocated: 25000000,
            budgetUtilized: 8750000,
            stakeholders: ['KIWASCO', 'Water Resources Authority', 'Community Groups'],
            risks: ['Groundwater depletion', 'Maintenance challenges', 'Community participation'],
            milestones: [
              { name: 'Site Survey', completed: true, date: '2024-09-30' },
              { name: 'Borehole Drilling', completed: true, date: '2024-11-30' },
              { name: 'Water Treatment Plants', completed: false, date: '2025-03-31' },
              { name: 'Distribution Networks', completed: false, date: '2025-08-31' },
              { name: 'Sanitation Facilities', completed: false, date: '2025-12-31' }
            ]
          }
        ];

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

const CountyProposedProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [filters, setFilters] = useState({
    category: 'All',
    status: 'All',
    priority: 'All'
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getCountyProposedProjects({
        category: filters.category,
        status: filters.status,
        priority: filters.priority
      });
      setProjects(data.projects || []);
      if (data.projects && data.projects.length === 0) {
        console.log('No county proposed projects found in database');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.details || error.message || 'Failed to load projects';
      console.error('Error details:', errorMsg);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedProject(null);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Proposed Projects
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View projects proposed by the County Government across various sectors
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <FilterIcon sx={{ color: 'text.secondary' }} />
          <Typography variant="h6" fontWeight="bold">
            Filter Projects
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                label="Priority"
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => {
            const statusInfo = getStatusColor(project.status);
            const priorityInfo = getPriorityColor(project.priority);
            const budgetUtilization = project.budget_allocated > 0 
              ? (project.budget_utilized / project.budget_allocated) * 100 
              : 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                    },
                    cursor: 'pointer',
                  }}
                  onClick={() => handleViewDetails(project)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
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
                      <Chip
                        label={project.priority}
                        size="small"
                        sx={{
                          backgroundColor: priorityInfo.background,
                          color: priorityInfo.text,
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                    
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {project.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description.substring(0, 120)}...
                    </Typography>

                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {getCategoryIcon(project.category)}
                      <Typography variant="body2" color="text.secondary">
                        {project.category}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {project.location}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <AttachMoneyIcon sx={{ fontSize: 18, color: 'success.main' }} />
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(project.estimated_cost)}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          Progress: {project.progress}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Budget: {budgetUtilization.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress} 
                        sx={{ height: 8, borderRadius: 4, mb: 1 }} 
                      />
                      <LinearProgress 
                        variant="determinate" 
                        value={budgetUtilization} 
                        color="success"
                        sx={{ height: 4, borderRadius: 2 }} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Project Details Dialog */}
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="lg" fullWidth>
        <DialogTitle>
          Project Details
          <IconButton
            aria-label="close"
            onClick={handleCloseDetails}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedProject && (
            <Box>
              {/* Project Header */}
              <Paper elevation={0} sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Chip
                        label={selectedProject.status}
                        sx={{
                          backgroundColor: getStatusColor(selectedProject.status).background,
                          color: getStatusColor(selectedProject.status).text,
                          fontWeight: 'bold',
                        }}
                        icon={getStatusColor(selectedProject.status).icon}
                      />
                      <Chip
                        label={selectedProject.priority}
                        sx={{
                          backgroundColor: getPriorityColor(selectedProject.priority).background,
                          color: getPriorityColor(selectedProject.priority).text,
                          fontWeight: 'bold',
                        }}
                      />
                    </Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {selectedProject.title}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {getCategoryIcon(selectedProject.category)}
                      <Typography variant="body2" color="text.secondary">
                        <strong>Category:</strong> {selectedProject.category}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Location:</strong> {selectedProject.location}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <AttachMoneyIcon sx={{ fontSize: 18, color: 'success.main' }} />
                      <Typography variant="body2" fontWeight="bold">
                        <strong>Budget:</strong> {formatCurrency(selectedProject.estimated_cost)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Timeline:</strong> {selectedProject.timeline}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Project Details */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Project Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedProject.description}
                  </Typography>

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Justification
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedProject.justification}
                  </Typography>

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Expected Benefits
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedProject.expectedBenefits}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Project Team
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Project Manager:</strong> {selectedProject.project_manager}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <BusinessIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      <strong>Department:</strong> {selectedProject.department}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Contact:</strong> {selectedProject.contact}
                    </Typography>
                  </Box>

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Budget Utilization
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Allocated: {formatCurrency(selectedProject.budget_allocated)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Utilized: {formatCurrency(selectedProject.budget_utilized)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedProject.budget_allocated > 0 
                        ? (selectedProject.budget_utilized / selectedProject.budget_allocated) * 100 
                        : 0} 
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }} 
                    />
                  </Box>

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Project Progress
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                      Overall Progress: {selectedProject.progress}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedProject.progress} 
                      sx={{ height: 8, borderRadius: 4 }} 
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Project Milestones
                  </Typography>
                  <TableContainer component={Paper} elevation={0}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Milestone</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Target Date</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedProject.milestones.map((milestone, index) => (
                          <TableRow key={index}>
                            <TableCell>{milestone.name}</TableCell>
                            <TableCell>
                              <Chip
                                label={milestone.completed ? 'Completed' : 'Pending'}
                                size="small"
                                color={milestone.completed ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell>{milestone.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CountyProposedProjectsPage;
























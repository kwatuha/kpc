import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    IconButton,
    Chip,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress
} from '@mui/material';
import {
    Close,
    Assessment,
    CheckCircle,
    Construction,
    HourglassEmpty,
    ShoppingCart,
    Warning,
    Comment,
    TrendingUp
} from '@mui/icons-material';
import { getProjects } from '../services/publicApi';
import { formatCurrency, formatDate, getStatusColor, formatStatus } from '../utils/formatters';
import ProjectFeedbackModal from './ProjectFeedbackModal';

const ProjectsModal = ({ open, onClose, filterType, filterValue, title }) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    useEffect(() => {
        if (open) {
            fetchProjects();
        }
    }, [open, filterType, filterValue]);

    const fetchProjects = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Build filter object based on type
            const filters = { page: 1, limit: 100 };
            
            if (filterType === 'status') {
                // Handle phased projects filter
                if (filterValue === 'Phase') {
                    filters.status = 'Phase'; // Special value that backend will handle
                } else if (filterValue === 'Other') {
                    filters.status = 'Other'; // Special value for other statuses
                } else {
                    filters.status = filterValue;
                }
            } else if (filterType === 'department') {
                filters.department = filterValue;
            } else if (filterType === 'finYearId') {
                filters.finYearId = filterValue;
            }
            
            const response = await getProjects(filters);
            setProjects(response.projects || []);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to load projects. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = () => {
        if (!projects.length) return null;
        
        const totalProjects = projects.length;
        const completedProjects = projects.filter(p => p.status === 'Completed').length;
        const ongoingProjects = projects.filter(p => p.status === 'Ongoing').length;
        const notStartedProjects = projects.filter(p => p.status === 'Not Started').length;
        const totalBudget = projects.reduce((sum, p) => {
            const budget = parseFloat(p.budget) || 0;
            return sum + budget;
        }, 0);
        
        return {
            totalProjects,
            completedProjects,
            ongoingProjects,
            notStartedProjects,
            totalBudget
        };
    };

    const stats = calculateStats();

    const getStatusIcon = (status) => {
        const icons = {
            'Completed': <CheckCircle />,
            'Ongoing': <Construction />,
            'Not Started': <HourglassEmpty />,
            'Under Procurement': <ShoppingCart />,
            'Stalled': <Warning />
        };
        return icons[status] || <Assessment />;
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }
            }}
        >
            <DialogTitle sx={{ 
                pb: 2,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white',
                position: 'relative'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Assessment sx={{ fontSize: '2rem' }} />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {title}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                {filterValue === 'Other' 
                                    ? 'Projects with statuses that don\'t match the main categories'
                                    : 'Detailed project breakdown and information'}
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton 
                        onClick={onClose}
                        sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                ) : (
                    <>
                        {/* Summary Stats */}
                        {stats && (
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={2.4}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                        color: 'white',
                                        borderRadius: '12px'
                                    }}>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Assessment sx={{ fontSize: '2rem', mb: 1 }} />
                                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                {stats.totalProjects}
                                            </Typography>
                                            <Typography variant="body2">
                                                Total Projects
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} md={2.4}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                                        color: 'white',
                                        borderRadius: '12px'
                                    }}>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <CheckCircle sx={{ fontSize: '2rem', mb: 1 }} />
                                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                {stats.completedProjects}
                                            </Typography>
                                            <Typography variant="body2">
                                                Completed
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} md={2.4}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
                                        color: 'white',
                                        borderRadius: '12px'
                                    }}>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <Construction sx={{ fontSize: '2rem', mb: 1 }} />
                                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                {stats.ongoingProjects}
                                            </Typography>
                                            <Typography variant="body2">
                                                Ongoing
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} md={2.4}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                                        color: 'white',
                                        borderRadius: '12px'
                                    }}>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <HourglassEmpty sx={{ fontSize: '2rem', mb: 1 }} />
                                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                {stats.notStartedProjects}
                                            </Typography>
                                            <Typography variant="body2">
                                                Not Started
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} md={2.4}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                                        color: 'white',
                                        borderRadius: '12px'
                                    }}>
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <TrendingUp sx={{ fontSize: '2rem', mb: 1 }} />
                                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                {formatCurrency(stats.totalBudget)}
                                            </Typography>
                                            <Typography variant="body2">
                                                Total Budget
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}

                        {/* Projects Table */}
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Projects List ({projects.length})
                            </Typography>
                        </Box>
                        
                        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 2 }}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Project Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Department</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Progress</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Budget</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Start Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>End Date</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {projects.length > 0 ? (
                                        projects.map((project, index) => (
                                            <TableRow 
                                                key={project.id} 
                                                hover
                                                sx={{ 
                                                    '&:hover': { 
                                                        backgroundColor: '#f8f9fa',
                                                        cursor: 'pointer'
                                                    }
                                                }}
                                            >
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {project.project_name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{project.department_name || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        icon={getStatusIcon(project.status)}
                                                        label={formatStatus(project.status)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getStatusColor(project.status),
                                                            color: 'white',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ width: '100%' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                            <Typography variant="body2" sx={{ minWidth: 35 }}>
                                                                {project.completionPercentage || 0}%
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress 
                                                            variant="determinate" 
                                                            value={project.completionPercentage || 0}
                                                            sx={{ 
                                                                height: 6, 
                                                                borderRadius: 3,
                                                                backgroundColor: '#e0e0e0',
                                                                '& .MuiLinearProgress-bar': {
                                                                    backgroundColor: getStatusColor(project.status)
                                                                }
                                                            }}
                                                        />
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {formatCurrency(project.budget)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{formatDate(project.start_date)}</TableCell>
                                                <TableCell>{formatDate(project.end_date)}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => {
                                                            setSelectedProject({
                                                                ...project,
                                                                statusColor: getStatusColor(project.status)
                                                            });
                                                            setFeedbackModalOpen(true);
                                                        }}
                                                        sx={{
                                                            '&:hover': {
                                                                backgroundColor: '#e3f2fd'
                                                            }
                                                        }}
                                                    >
                                                        <Comment />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                                <Typography variant="body1" color="text.secondary">
                                                    No projects found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button 
                    onClick={onClose}
                    variant="outlined"
                    sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 'bold'
                    }}
                >
                    Close
                </Button>
            </DialogActions>

            {/* Project Feedback Modal */}
            <ProjectFeedbackModal
                open={feedbackModalOpen}
                onClose={() => setFeedbackModalOpen(false)}
                project={selectedProject}
            />
        </Dialog>
    );
};

export default ProjectsModal;


import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import { Close, CalendarToday, Business, AttachMoney, CheckCircle } from '@mui/icons-material';
import ProjectDetailTable from '../tables/ProjectDetailTable';
import reportsService from '../../api/reportsService';

const YearProjectsModal = ({ open, onClose, yearData }) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open && yearData) {
            fetchYearProjects();
        }
    }, [open, yearData]);

    const fetchYearProjects = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // For now, we'll use mock data since we don't have a specific API for projects by year
            // In a real implementation, you would call: reportsService.getProjectsByYear(yearData.year)
            const mockProjects = generateMockProjectsForYear(yearData.year);
            setProjects(mockProjects);
        } catch (err) {
            console.error('Error fetching projects for year:', err);
            setError('Failed to load projects for this year');
        } finally {
            setIsLoading(false);
        }
    };

    const generateMockProjectsForYear = (year) => {
        const projectNames = [
            'Climate Change Research Initiative',
            'Health Infrastructure Development',
            'Education Technology Enhancement',
            'Water Management System',
            'Agricultural Innovation Program',
            'Digital Government Services',
            'Renewable Energy Project',
            'Community Development Initiative'
        ];

        const departments = [
            'Ministry of Health & Sanitation',
            'Ministry of Education, ICT & Youth Development',
            'Ministry of Water & Irrigation',
            'Ministry of Agriculture & Livestock',
            'Ministry of Lands, Infrastructure, Housing and Urban Development'
        ];

        const statuses = ['Completed', 'In Progress', 'At Risk', 'Delayed', 'Initiated'];

        return Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, index) => ({
            id: `${year}-${index + 1}`,
            projectName: projectNames[index % projectNames.length],
            department: departments[index % departments.length],
            status: statuses[index % statuses.length],
            startDate: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            endDate: `${year + 1}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            allocatedBudget: Math.floor(Math.random() * 50000000) + 10000000,
            amountPaid: Math.floor(Math.random() * 30000000) + 5000000,
            percentCompleted: Math.floor(Math.random() * 100),
            healthScore: Math.floor(Math.random() * 100)
        }));
    };

    const calculateYearStats = () => {
        if (projects.length === 0) return { totalProjects: 0, totalBudget: 0, totalPaid: 0, avgCompletion: 0 };
        
        const totalProjects = projects.length;
        const totalBudget = projects.reduce((sum, p) => sum + (p.allocatedBudget || 0), 0);
        const totalPaid = projects.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
        const avgCompletion = projects.reduce((sum, p) => sum + (p.percentCompleted || 0), 0) / totalProjects;
        
        return { totalProjects, totalBudget, totalPaid, avgCompletion };
    };

    const stats = calculateYearStats();

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                pb: 1,
                borderBottom: '1px solid rgba(0,0,0,0.1)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ color: 'primary.main', fontSize: '1.5rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Projects for {yearData?.year}
                    </Typography>
                </Box>
                <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1 }}>
                    <Close />
                </Button>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {stats.totalProjects}
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            Total Projects
                                        </Typography>
                                    </Box>
                                    <Business sx={{ fontSize: '2rem', opacity: 0.8 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            KSh {(stats.totalBudget / 1000000).toFixed(1)}M
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            Total Budget
                                        </Typography>
                                    </Box>
                                    <AttachMoney sx={{ fontSize: '2rem', opacity: 0.8 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            KSh {(stats.totalPaid / 1000000).toFixed(1)}M
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            Total Paid
                                        </Typography>
                                    </Box>
                                    <CheckCircle sx={{ fontSize: '2rem', opacity: 0.8 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                            {stats.avgCompletion.toFixed(1)}%
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            Avg Completion
                                        </Typography>
                                    </Box>
                                    <CheckCircle sx={{ fontSize: '2rem', opacity: 0.8 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Demo Data Alert */}
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Demo Data:</strong> This shows sample projects for {yearData?.year}. 
                        In a production environment, this would display real project data from the database.
                    </Typography>
                </Alert>

                {/* Projects Table */}
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : (
                    <ProjectDetailTable
                        data={projects.map((project, index) => ({
                            id: project.id,
                            rowNumber: index + 1,
                            projectName: project.projectName,
                            department: project.department,
                            status: project.status,
                            percentCompleted: project.percentCompleted,
                            healthScore: project.healthScore,
                            allocatedBudget: project.allocatedBudget,
                            amountPaid: project.amountPaid,
                            startDate: project.startDate,
                            endDate: project.endDate
                        }))}
                        columns={[
                            {
                                id: 'rowNumber',
                                label: '#',
                                minWidth: 60,
                                type: 'number'
                            },
                            {
                                id: 'projectName',
                                label: 'Project Name',
                                minWidth: 200,
                                type: 'text'
                            },
                            {
                                id: 'department',
                                label: 'Department',
                                minWidth: 150,
                                type: 'text'
                            },
                            {
                                id: 'status',
                                label: 'Status',
                                minWidth: 120,
                                type: 'status'
                            },
                            {
                                id: 'percentCompleted',
                                label: 'Progress',
                                minWidth: 120,
                                type: 'progress'
                            },
                            {
                                id: 'healthScore',
                                label: 'Health Score',
                                minWidth: 100,
                                type: 'number'
                            },
                            {
                                id: 'allocatedBudget',
                                label: 'Budget',
                                minWidth: 120,
                                type: 'currency'
                            },
                            {
                                id: 'amountPaid',
                                label: 'Paid',
                                minWidth: 120,
                                type: 'currency'
                            }
                        ]}
                        title={`Projects for ${yearData?.year}`}
                    />
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                <Button onClick={onClose} variant="contained" color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default YearProjectsModal;

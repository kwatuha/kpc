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
    CircularProgress,
    Divider
} from '@mui/material';
import { Close, CalendarToday, Business, AttachMoney, CheckCircle, TrendingUp, Assessment } from '@mui/icons-material';
import ProjectDetailTable from '../tables/ProjectDetailTable';
import reportsService from '../../api/reportsService';

const YearBudgetModal = ({ open, onClose, yearData }) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open && yearData) {
            fetchYearBudgetProjects();
        }
    }, [open, yearData]);

    const fetchYearBudgetProjects = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // For now, we'll use mock data since we don't have a specific API for budget projects by year
            // In a real implementation, you would call: reportsService.getBudgetProjectsByYear(yearData.year)
            const mockProjects = generateMockBudgetProjectsForYear(yearData.year);
            setProjects(mockProjects);
        } catch (err) {
            console.error('Error fetching budget projects for year:', err);
            setError('Failed to load budget projects for this year');
        } finally {
            setIsLoading(false);
        }
    };

    const generateMockBudgetProjectsForYear = (year) => {
        const projectNames = [
            'Road Construction and Maintenance',
            'Healthcare Infrastructure',
            'Education Facilities',
            'Water and Sanitation',
            'Agricultural Development',
            'ICT Infrastructure',
            'Environmental Conservation',
            'Youth Empowerment',
            'Women Development',
            'Sports and Recreation'
        ];

        const departments = [
            'Public Works',
            'Health Services',
            'Education',
            'Water and Sanitation',
            'Agriculture',
            'ICT',
            'Environment',
            'Youth Affairs',
            'Gender Affairs',
            'Sports'
        ];

        const statuses = ['Completed', 'In Progress', 'At Risk', 'Delayed', 'Planning'];
        
        const projects = [];
        const numProjects = Math.floor(Math.random() * 15) + 10; // 10-24 projects

        for (let i = 0; i < numProjects; i++) {
            const projectName = projectNames[Math.floor(Math.random() * projectNames.length)];
            const department = departments[Math.floor(Math.random() * departments.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const totalBudget = Math.floor(Math.random() * 50000000) + 5000000; // 5M to 55M
            const amountPaid = Math.floor(totalBudget * (Math.random() * 0.8 + 0.1)); // 10% to 90% of budget
            const absorptionRate = ((amountPaid / totalBudget) * 100).toFixed(1);
            
            projects.push({
                id: `budget-${year}-${i + 1}`,
                rowNumber: i + 1,
                projectName: `${projectName} - ${year}`,
                department: department,
                status: status,
                totalBudget: totalBudget,
                amountPaid: amountPaid,
                absorptionRate: parseFloat(absorptionRate),
                remainingBudget: totalBudget - amountPaid,
                startDate: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-01`,
                endDate: `${year}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-28`,
                progress: Math.floor(Math.random() * 100)
            });
        }

        return projects.sort((a, b) => b.totalBudget - a.totalBudget); // Sort by budget descending
    };

    const formatCurrency = (amount) => {
        if (amount >= 1000000) {
            return `KSh ${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `KSh ${(amount / 1000).toFixed(0)}K`;
        } else {
            return `KSh ${amount.toLocaleString()}`;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#4caf50';
            case 'In Progress': return '#2196f3';
            case 'At Risk': return '#ff9800';
            case 'Delayed': return '#f44336';
            case 'Planning': return '#9c27b0';
            default: return '#757575';
        }
    };

    const calculateTotals = () => {
        const totalBudget = projects.reduce((sum, project) => sum + project.totalBudget, 0);
        const totalPaid = projects.reduce((sum, project) => sum + project.amountPaid, 0);
        const avgAbsorptionRate = projects.length > 0 
            ? projects.reduce((sum, project) => sum + project.absorptionRate, 0) / projects.length 
            : 0;
        
        return {
            totalBudget,
            totalPaid,
            avgAbsorptionRate: avgAbsorptionRate.toFixed(1),
            remainingBudget: totalBudget - totalPaid
        };
    };

    const totals = calculateTotals();

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                pb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '16px 16px 0 0'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoney sx={{ fontSize: '1.5rem' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        Budget Projects for {yearData?.year || 'Selected Year'}
                    </Typography>
                </Box>
                <Button
                    onClick={onClose}
                    sx={{ 
                        color: 'white',
                        minWidth: 'auto',
                        p: 1,
                        '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                    }}
                >
                    <Close />
                </Button>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {isLoading ? (
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '300px',
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        <CircularProgress size={60} />
                        <Typography variant="h6" color="text.secondary">
                            Loading budget projects...
                        </Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 3 }}>
                        <Alert severity="error" sx={{ borderRadius: '12px' }}>
                            {error}
                        </Alert>
                    </Box>
                ) : (
                    <Box>
                        {/* Summary Cards */}
                        <Box sx={{ p: 3, pb: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        borderRadius: '12px'
                                    }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box>
                                                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                                        Total Budget
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {formatCurrency(totals.totalBudget)}
                                                    </Typography>
                                                </Box>
                                                <AttachMoney sx={{ fontSize: '2rem', opacity: 0.8 }} />
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
                                                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                                        Disbursed
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {formatCurrency(totals.totalPaid)}
                                                    </Typography>
                                                </Box>
                                                <CheckCircle sx={{ fontSize: '2rem', opacity: 0.8 }} />
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
                                                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                                        Remaining
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {formatCurrency(totals.remainingBudget)}
                                                    </Typography>
                                                </Box>
                                                <TrendingUp sx={{ fontSize: '2rem', opacity: 0.8 }} />
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
                                                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                                        Avg Absorption
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {totals.avgAbsorptionRate}%
                                                    </Typography>
                                                </Box>
                                                <Assessment sx={{ fontSize: '2rem', opacity: 0.8 }} />
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider />

                        {/* Projects Table */}
                        <Box sx={{ p: 3, pt: 2 }}>
                            <ProjectDetailTable
                                data={projects.map(project => ({
                                    ...project,
                                    totalBudget: formatCurrency(project.totalBudget),
                                    amountPaid: formatCurrency(project.amountPaid),
                                    absorptionRate: project.absorptionRate.toFixed(1) + '%',
                                    remainingBudget: formatCurrency(project.remainingBudget),
                                    progress: project.progress + '%'
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
                                        minWidth: 120,
                                        type: 'text'
                                    },
                                    {
                                        id: 'status',
                                        label: 'Status',
                                        minWidth: 100,
                                        type: 'chip',
                                        chipColor: getStatusColor
                                    },
                                    {
                                        id: 'totalBudget',
                                        label: 'Total Budget',
                                        minWidth: 140,
                                        type: 'text'
                                    },
                                    {
                                        id: 'amountPaid',
                                        label: 'Disbursed',
                                        minWidth: 140,
                                        type: 'text'
                                    },
                                    {
                                        id: 'absorptionRate',
                                        label: 'Absorption Rate',
                                        minWidth: 130,
                                        type: 'text'
                                    },
                                    {
                                        id: 'remainingBudget',
                                        label: 'Remaining',
                                        minWidth: 140,
                                        type: 'text'
                                    },
                                    {
                                        id: 'progress',
                                        label: 'Progress',
                                        minWidth: 100,
                                        type: 'text'
                                    }
                                ]}
                                title={`Budget Projects for ${yearData?.year || 'Selected Year'} (${projects.length} projects)`}
                                showSearch={true}
                                showPagination={true}
                                pageSize={10}
                            />
                        </Box>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 1 }}>
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
        </Dialog>
    );
};

export default YearBudgetModal;


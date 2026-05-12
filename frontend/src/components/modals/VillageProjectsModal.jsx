import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Chip,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';
import { Close, Home, AttachMoney, Assessment, CheckCircle } from '@mui/icons-material';
import ProjectDetailTable from '../tables/ProjectDetailTable';
import regionalService from '../../api/regionalService';

const VillageProjectsModal = ({ open, onClose, village }) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isUsingMockData, setIsUsingMockData] = useState(false);

    useEffect(() => {
        if (open && village) {
            fetchVillageProjects();
        }
    }, [open, village]);

    const fetchVillageProjects = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await regionalService.getProjectsByVillage(village.village);
            if (response && response.length > 0) {
                setProjects(response);
                setIsUsingMockData(false);
            } else {
                // Generate mock data if no real data
                setProjects(generateMockProjects());
                setIsUsingMockData(true);
            }
        } catch (error) {
            console.error('Error fetching village projects:', error);
            setProjects(generateMockProjects());
            setIsUsingMockData(true);
        } finally {
            setIsLoading(false);
        }
    };

    const generateMockProjects = () => {
        const mockProjects = [];
        const projectNames = [
            'Road Construction Project',
            'Water Supply System',
            'Health Center Upgrade',
            'School Infrastructure'
        ];
        
        const statuses = ['Completed', 'In Progress', 'At Risk', 'Planning'];
        
        for (let i = 0; i < 3; i++) {
            mockProjects.push({
                id: `project-${i + 1}`,
                projectName: projectNames[i],
                county: village?.county || 'Sample County',
                subCounty: village?.subCounty || 'Sample Sub-County',
                ward: village?.ward || 'Sample Ward',
                village: village?.village || 'Sample Village',
                status: statuses[Math.floor(Math.random() * statuses.length)],
                percentCompleted: Math.floor(Math.random() * 100),
                healthScore: Math.floor(Math.random() * 100),
                startDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
                endDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
                allocatedBudget: (Math.random() * 5000000 + 500000).toFixed(2),
                contractSum: (Math.random() * 4500000 + 400000).toFixed(2),
                amountPaid: (Math.random() * 4000000 + 200000).toFixed(2),
                absorptionRate: (Math.random() * 100).toFixed(2),
                objective: `Improve infrastructure in ${village?.village || 'Sample Village'}`,
                expectedOutput: `Deliver quality services to residents`,
                expectedOutcome: `Enhanced community development`,
                principalInvestigator: `PI ${i + 1}`,
                statusReason: 'Project progressing as planned'
            });
        }
        return mockProjects;
    };

    const calculateVillageStats = () => {
        if (!projects.length) return { totalProjects: 0, totalBudget: 0, totalPaid: 0, avgCompletion: 0 };
        
        const totalProjects = projects.length;
        const totalBudget = projects.reduce((sum, project) => sum + (parseFloat(project.allocatedBudget) || 0), 0);
        const totalPaid = projects.reduce((sum, project) => sum + (parseFloat(project.amountPaid) || 0), 0);
        const avgCompletion = projects.reduce((sum, project) => sum + (project.percentCompleted || 0), 0) / totalProjects;
        
        return { totalProjects, totalBudget, totalPaid, avgCompletion };
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const stats = calculateVillageStats();

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                pb: 1,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Home sx={{ fontSize: '1.5rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {village?.village || 'Village'} Projects
                    </Typography>
                </Box>
                <Button
                    onClick={onClose}
                    sx={{ 
                        color: 'white',
                        minWidth: 'auto',
                        p: 1
                    }}
                >
                    <Close />
                </Button>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {/* Data Source Indicator */}
                {isUsingMockData && (
                    <Alert severity="info" sx={{ mb: 2, borderRadius: '8px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="Demo Mode" size="small" color="info" />
                            <Typography variant="body2">
                                Showing sample data. Connect to live database for real project information.
                            </Typography>
                        </Box>
                    </Alert>
                )}

                {!isUsingMockData && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label="Live Data" size="small" color="success" />
                            <Typography variant="body2">
                                Displaying real project data from the database.
                            </Typography>
                        </Box>
                    </Alert>
                )}

                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                <Assessment sx={{ fontSize: '2rem', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {stats.totalProjects}
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    Total Projects
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                <AttachMoney sx={{ fontSize: '2rem', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    KSh {(stats.totalBudget / 1000000).toFixed(1)}M
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    Total Budget
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                <AttachMoney sx={{ fontSize: '2rem', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    KSh {(stats.totalPaid / 1000000).toFixed(1)}M
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    Total Paid
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                            background: 'linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)',
                            color: 'white',
                            borderRadius: '12px'
                        }}>
                            <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                <CheckCircle sx={{ fontSize: '2rem', mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                    {Math.round(stats.avgCompletion)}%
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    Avg Completion
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Projects Table */}
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
                    Project Details
                </Typography>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <ProjectDetailTable
                        data={projects.map((project, index) => ({
                            id: project.id,
                            rowNumber: index + 1,
                            projectName: project.projectName,
                            county: project.county,
                            subCounty: project.subCounty,
                            ward: project.ward,
                            village: project.village,
                            status: project.status,
                            percentCompleted: project.percentCompleted,
                            healthScore: project.healthScore,
                            startDate: formatDate(project.startDate),
                            endDate: formatDate(project.endDate),
                            allocatedBudget: parseFloat(project.allocatedBudget) || 0,
                            contractSum: parseFloat(project.contractSum) || 0,
                            amountPaid: parseFloat(project.amountPaid) || 0,
                            absorptionRate: parseFloat(project.absorptionRate) || 0,
                            objective: project.objective,
                            expectedOutput: project.expectedOutput,
                            expectedOutcome: project.expectedOutcome,
                            principalInvestigator: project.principalInvestigator,
                            statusReason: project.statusReason
                        }))}
                        columns={[
                            { id: 'rowNumber', label: '#', minWidth: 60, type: 'number' },
                            { id: 'projectName', label: 'Project Name', minWidth: 200, type: 'text' },
                            { id: 'county', label: 'County', minWidth: 120, type: 'text' },
                            { id: 'subCounty', label: 'Sub-County', minWidth: 120, type: 'text' },
                            { id: 'ward', label: 'Ward', minWidth: 100, type: 'text' },
                            { id: 'status', label: 'Status', minWidth: 100, type: 'text' },
                            { id: 'percentCompleted', label: 'Progress', minWidth: 100, type: 'percentage' },
                            { id: 'allocatedBudget', label: 'Budget', minWidth: 120, type: 'currency' },
                            { id: 'amountPaid', label: 'Disbursed', minWidth: 120, type: 'currency' },
                            { id: 'absorptionRate', label: 'Absorption', minWidth: 100, type: 'percentage' }
                        ]}
                        title=""
                    />
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button 
                    onClick={onClose}
                    variant="contained"
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

export default VillageProjectsModal;


















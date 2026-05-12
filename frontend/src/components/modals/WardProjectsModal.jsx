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
    Divider,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Close,
    Home,
    AttachMoney,
    TrendingUp,
    Schedule,
    CheckCircle,
    Warning
} from '@mui/icons-material';
import ProjectDetailTable from '../tables/ProjectDetailTable';
import { transformOverviewData } from '../tables/TableConfigs';
import reportsService from '../../api/reportsService';

// Global test function for API endpoint
window.testWardAPI = async (wardName) => {
    try {
        console.log('Testing API endpoint for ward:', wardName);
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${apiUrl}/reports/project-list-detailed?ward=${encodeURIComponent(wardName)}`);
        const data = await response.json();
        console.log('API Response:', data);
        console.log('Response length:', data.length);
        console.log('Sample project:', data[0]);
        return data;
    } catch (error) {
        console.error('API Test Error:', error);
        return null;
    }
};

const WardProjectsModal = ({ open, onClose, wardData }) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isUsingMockData, setIsUsingMockData] = useState(false);

    useEffect(() => {
        if (open && wardData) {
            fetchWardProjects();
        }
    }, [open, wardData]);

    const fetchWardProjects = async () => {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching projects for ward:', wardData.wardName);
        
        try {
            // Fetch actual projects for the ward from the API
            console.log('Making API call to get projects by ward:', wardData.wardName);
            
            // Use the detailed project list API with ward filter
            const filters = {
                ward: wardData.wardName
            };
            console.log('Using filters:', filters);
            console.log('Ward data being filtered:', wardData.wardName);
            console.log('Available wardData fields:', Object.keys(wardData));
            
            let response = await reportsService.getDetailedProjectList(filters);
            
            // If no results, try alternative filter names
            if (!response || response.length === 0) {
                console.log('No results with ward filter, trying alternative filters...');
                const alternativeFilters = {
                    wardName: wardData.wardName,
                    ward_name: wardData.wardName,
                    location: wardData.wardName
                };
                
                for (const [key, value] of Object.entries(alternativeFilters)) {
                    try {
                        console.log(`Trying filter: ${key} = ${value}`);
                        response = await reportsService.getDetailedProjectList({ [key]: value });
                        if (response && response.length > 0) {
                            console.log(`Found results with filter: ${key}`);
                            break;
                        }
                    } catch (err) {
                        console.log(`Filter ${key} failed:`, err.message);
                    }
                }
            }
            console.log('API response:', response);
            
            if (response && response.length > 0) {
                console.log('Using real data from API:', response.length, 'projects');
                console.log('Sample project data:', response[0]);
                console.log('All project wards:', response.map(p => p.ward || p.wardName));
                
                // Debug: Show all project data to understand the structure
                console.log('=== PROJECT DATA STRUCTURE DEBUG ===');
                console.log('First project full object:', response[0]);
                console.log('All project field names:', Object.keys(response[0]));
                console.log('Looking for ward in project:', {
                    ward: response[0].ward,
                    wardName: response[0].wardName,
                    location: response[0].location,
                    ward_id: response[0].ward_id,
                    wardId: response[0].wardId
                });
                console.log('Target ward to match:', wardData.wardName);
                console.log('=== END DEBUG ===');
                
                // Apply client-side filtering since backend doesn't filter by ward
                const filteredProjects = response.filter(project => {
                    // Use the correct field name from the API response
                    const projectWard = project.wardName;
                    
                    const matches = projectWard === wardData.wardName;
                    console.log(`Project: ${project.projectName}, Ward: ${projectWard}, Target: ${wardData.wardName}, Matches: ${matches}`);
                    return matches;
                });
                
                console.log(`Client-side filtering: ${response.length} -> ${filteredProjects.length} projects`);
                
                // Show filtered projects (empty array if no matches)
                setProjects(filteredProjects);
                
                if (filteredProjects.length === 0) {
                    console.log('No projects found for this ward.');
                    console.log('Available wards in data:', [...new Set(response.map(p => p.wardName))]);
                }
                
                setIsUsingMockData(false);
            } else {
                console.log('API returned empty data, using mock data');
                // Use mock data if API doesn't return data
                setProjects(generateMockProjects(wardData));
                setIsUsingMockData(true);
            }
        } catch (err) {
            console.error('API call failed, using mock data:', err);
            console.error('Error details:', {
                message: err.message,
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                config: err.config
            });
            
            let errorMessage = `Failed to load projects for ${wardData.wardName}`;
            if (err.response?.status === 500) {
                errorMessage += ': Server error (500) - The backend may not have this endpoint implemented yet';
            } else {
                errorMessage += `: ${err.message}`;
            }
            
            setError(errorMessage);
            // Use mock data for demonstration
            setProjects(generateMockProjects(wardData));
            setIsUsingMockData(true);
        } finally {
            setIsLoading(false);
        }
    };

    const generateMockProjects = (ward) => {
        // Generate mock project data based on ward
        const projectCount = Math.floor(Math.random() * 6) + 2; // 2-7 projects
        return Array.from({ length: projectCount }, (_, index) => ({
            id: `proj-${ward.wardId}-${index}`,
            projectName: `${ward.wardName} Project ${index + 1}`,
            wardName: ward.wardName,
            subcountyName: ward.subcountyName,
            status: ['Completed', 'In Progress', 'At Risk', 'Delayed'][Math.floor(Math.random() * 4)],
            percentCompleted: Math.floor(Math.random() * 100),
            healthScore: Math.floor(Math.random() * 100),
            startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            costOfProject: Math.floor(Math.random() * 2000000) + 50000,
            contractSum: Math.floor(Math.random() * 2000000) + 50000,
            paidOut: Math.floor(Math.random() * 1500000) + 25000
        }));
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const day = date.getDate().toString().padStart(2, '0');
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return 'Invalid Date';
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Completed': '#4caf50',
            'In Progress': '#2196f3',
            'At Risk': '#f44336',
            'Delayed': '#ff9800'
        };
        return colors[status] || '#757575';
    };

    const calculateWardStats = () => {
        if (!projects.length) return null;
        
        const totalProjects = projects.length;
        const completedProjects = projects.filter(p => p.status === 'Completed').length;
        const inProgressProjects = projects.filter(p => p.status === 'In Progress').length;
        const atRiskProjects = projects.filter(p => p.status === 'At Risk').length;
        const totalBudget = projects.reduce((sum, p) => {
            const budget = parseFloat(p.costOfProject) || 0;
            console.log('Project budget:', p.projectName, 'costOfProject:', p.costOfProject, 'parsed:', budget);
            return sum + budget;
        }, 0);
        const totalPaid = projects.reduce((sum, p) => {
            const paid = parseFloat(p.paidOut) || 0;
            return sum + paid;
        }, 0);
        const avgProgress = projects.reduce((sum, p) => sum + (p.percentCompleted || 0), 0) / totalProjects;

        console.log('Total budget calculated:', totalBudget);
        console.log('Total paid calculated:', totalPaid);
        
        return {
            totalProjects,
            completedProjects,
            inProgressProjects,
            atRiskProjects,
            totalBudget,
            totalPaid,
            avgProgress: Math.round(avgProgress)
        };
    };

    const stats = calculateWardStats();

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
                pb: 1,
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white',
                position: 'relative'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Home sx={{ fontSize: '2rem' }} />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                {wardData?.wardName || 'Ward'} Projects
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Projects in {wardData?.wardName || 'this ward'} - Detailed information and analytics
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
                        {/* Ward Summary Stats */}
                        {stats && (
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={3}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                                        color: 'white',
                                        borderRadius: '12px'
                                    }}>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <CheckCircle sx={{ fontSize: '2rem', mb: 1 }} />
                                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                {stats.completedProjects}
                                            </Typography>
                                            <Typography variant="body2">
                                                Completed Projects
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} md={3}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)',
                                        color: 'white',
                                        borderRadius: '12px'
                                    }}>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <TrendingUp sx={{ fontSize: '2rem', mb: 1 }} />
                                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                {stats.inProgressProjects}
                                            </Typography>
                                            <Typography variant="body2">
                                                In Progress
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} md={3}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
                                        color: 'white',
                                        borderRadius: '12px'
                                    }}>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <Warning sx={{ fontSize: '2rem', mb: 1 }} />
                                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                {stats.atRiskProjects}
                                            </Typography>
                                            <Typography variant="body2">
                                                At Risk
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} md={3}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
                                        color: 'white',
                                        borderRadius: '12px'
                                    }}>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <AttachMoney sx={{ fontSize: '2rem', mb: 1 }} />
                                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                {formatCurrency(stats.totalBudget)}
                                            </Typography>
                                            <Typography variant="body2">
                                                Total Budget
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12} md={3}>
                                    <Card sx={{ 
                                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                                        color: 'white',
                                        borderRadius: '12px'
                                    }}>
                                        <CardContent sx={{ textAlign: 'center' }}>
                                            <Home sx={{ fontSize: '2rem', mb: 1 }} />
                                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                                {formatCurrency(stats.totalPaid)}
                                            </Typography>
                                            <Typography variant="body2">
                                                Total Paid
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}

                        <Divider sx={{ mb: 3 }} />

                        {/* Data Source Notice */}
                        {isUsingMockData ? (
                            <Alert 
                                severity="info" 
                                sx={{ 
                                    mb: 3,
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                                    border: '1px solid rgba(33, 150, 243, 0.2)'
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    📊 Demo Mode: This shows sample project data for demonstration purposes. 
                                    In production, this would display actual projects from the database.
                                </Typography>
                            </Alert>
                        ) : (
                            <Alert 
                                severity="success" 
                                sx={{ 
                                    mb: 3,
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                                    border: '1px solid rgba(76, 175, 80, 0.2)'
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    ✅ Live Data: Showing actual projects from the database for {wardData?.wardName} ward.
                                </Typography>
                            </Alert>
                        )}

                        {/* Projects Table */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Individual Projects ({projects.length})
                            </Typography>
                            <Chip 
                                label={isUsingMockData ? "Demo Data" : "Live Data"} 
                                color={isUsingMockData ? "info" : "success"} 
                                size="small"
                                sx={{ 
                                    background: isUsingMockData 
                                        ? 'linear-gradient(135deg, #2196f3 0%, #42a5f5 100%)'
                                        : 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                                    color: 'white',
                                    fontWeight: 'bold'
                                }}
                            />
                        </Box>
                        
                        {projects.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No Projects Found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    No projects are currently assigned to {wardData?.wardName || 'this ward'}.
                                </Typography>
                            </Box>
                        ) : (
                            <ProjectDetailTable
                            data={projects.map((project, index) => ({
                                id: project.id,
                                rowNumber: index + 1,
                                projectName: project.projectName,
                                wardName: project.wardName,
                                subcountyName: project.subCountyName,
                                status: project.status,
                                percentCompleted: project.percentCompleted || 0,
                                healthScore: project.healthScore || 0,
                                allocatedBudget: parseFloat(project.costOfProject) || 0,
                                contractSum: parseFloat(project.costOfProject) || 0,
                                amountPaid: parseFloat(project.paidOut) || 0,
                                absorptionRate: project.costOfProject > 0 ? parseFloat((((parseFloat(project.paidOut) || 0) / parseFloat(project.costOfProject)) * 100).toFixed(2)) : 0,
                                startDate: formatDate(project.startDate),
                                endDate: formatDate(project.endDate)
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
                                    label: 'Allocated Budget',
                                    minWidth: 140,
                                    type: 'currency'
                                },
                                {
                                    id: 'contractSum',
                                    label: 'Contract Sum',
                                    minWidth: 140,
                                    type: 'currency'
                                },
                                {
                                    id: 'amountPaid',
                                    label: 'Disbursed',
                                    minWidth: 140,
                                    type: 'currency'
                                },
                                {
                                    id: 'absorptionRate',
                                    label: 'Absorption Rate',
                                    minWidth: 120,
                                    type: 'progress'
                                },
                                {
                                    id: 'startDate',
                                    label: 'Start Date',
                                    minWidth: 120,
                                    type: 'date'
                                },
                                {
                                    id: 'endDate',
                                    label: 'End Date',
                                    minWidth: 120,
                                    type: 'date'
                                }
                            ]}
                            title=""
                            onRowClick={(row) => console.log('Project clicked:', row)}
                        />
                        )}
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
                <Button 
                    variant="contained"
                    sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                    }}
                >
                    Export Projects
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WardProjectsModal;
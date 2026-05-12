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
import { Close, LocationOn, AttachMoney, Assessment, CheckCircle } from '@mui/icons-material';
import ProjectDetailTable from '../tables/ProjectDetailTable';
import reportsService from '../../api/reportsService';

// Global test function for API endpoint
window.testSubCountyAPI = async (subCountyName) => {
    try {
        console.log('Testing API endpoint for subcounty:', subCountyName);
        const apiUrl = import.meta.env.VITE_API_URL || '/api';
        const response = await fetch(`${apiUrl}/reports/project-list-detailed?subCounty=${encodeURIComponent(subCountyName)}`);
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

const SubCountyProjectsModal = ({ open, onClose, subCounty }) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isUsingMockData, setIsUsingMockData] = useState(false);

    useEffect(() => {
        if (open && subCounty) {
            fetchSubCountyProjects();
        }
    }, [open, subCounty]);

    const fetchSubCountyProjects = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            console.log('Making API call to get projects by sub-county:', subCounty.subcounty);
            console.log('Full subCounty object:', subCounty);
            
            // Test the API endpoint directly
            console.log('=== API ENDPOINT TEST ===');
            const apiUrl = import.meta.env.VITE_API_URL || '/api';
            console.log('Testing URL:', `${apiUrl}/reports/project-list-detailed?subCounty=${encodeURIComponent(subCounty.subcounty)}`);
            console.log('=== END API TEST ===');
            
            // Use the detailed project list API with subcounty filter
            const filters = {
                subCounty: subCounty.subcountyName || subCounty.subcounty || subCounty.name
            };
            console.log('Using filters:', filters);
            console.log('SubCounty data being filtered:', subCounty.subcountyName || subCounty.subcounty || subCounty.name);
            console.log('Available subCounty fields:', Object.keys(subCounty));
            
            let response = await reportsService.getDetailedProjectList(filters);
            
            // If no results, try alternative filter names
            if (!response || response.length === 0) {
                console.log('No results with subCounty filter, trying alternative filters...');
                const alternativeFilters = {
                    subcounty: subCounty.subcounty,
                    sub_county: subCounty.subcounty,
                    location: subCounty.subcounty
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
            console.log('Response length:', response?.length);
            
            if (response && response.length > 0) {
                console.log('Using real data from API:', response.length, 'projects');
                console.log('Sample project data:', response[0]);
                console.log('All project subcounties:', response.map(p => p.subcounty || p.subCounty || p.subcountyName));
                
                // Debug: Show all project data to understand the structure
                console.log('=== PROJECT DATA STRUCTURE DEBUG ===');
                console.log('First project full object:', response[0]);
                console.log('All project field names:', Object.keys(response[0]));
                console.log('Looking for subcounty in project:', {
                    subcounty: response[0].subcounty,
                    subCounty: response[0].subCounty,
                    subcountyName: response[0].subcountyName,
                    location: response[0].location,
                    subcounty_id: response[0].subcounty_id,
                    subcountyId: response[0].subcountyId
                });
                console.log('Target subcounty to match:', subCounty.subcountyName || subCounty.subcounty || subCounty.name);
                console.log('=== END DEBUG ===');
                
                // Apply client-side filtering since backend doesn't filter by subcounty
                const filteredProjects = response.filter(project => {
                    // Use the correct field name from the API response
                    const projectSubcounty = project.subCountyName;
                    const targetSubcounty = subCounty.subcountyName || subCounty.subcounty || subCounty.name;
                    
                    const matches = projectSubcounty === targetSubcounty;
                    console.log(`Project: ${project.projectName}, Subcounty: ${projectSubcounty}, Target: ${targetSubcounty}, Matches: ${matches}`);
                    return matches;
                });
                
                console.log(`Client-side filtering: ${response.length} -> ${filteredProjects.length} projects`);
                
                // Show filtered projects (empty array if no matches)
                setProjects(filteredProjects);
                
                if (filteredProjects.length === 0) {
                    console.log('No projects found for this subcounty.');
                    console.log('Available subcounties in data:', [...new Set(response.map(p => p.subCountyName))]);
                }
                
                setIsUsingMockData(false);
            } else {
                console.log('API returned empty data, using mock data');
                // Generate mock data if no real data
                setProjects(generateMockProjects());
                setIsUsingMockData(true);
            }
        } catch (error) {
            console.error('Error fetching sub-county projects:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: error.config
            });
            
            let errorMessage = `Failed to load projects for ${subCounty.subcountyName || subCounty.subcounty || subCounty.name}`;
            if (error.response?.status === 500) {
                errorMessage += ': Server error (500) - The backend may not have this endpoint implemented yet';
            } else {
                errorMessage += `: ${error.message}`;
            }
            
            setError(errorMessage);
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
            'School Infrastructure',
            'Market Development',
            'Electricity Connection',
            'Agricultural Support',
            'Community Center'
        ];
        
        const statuses = ['Completed', 'In Progress', 'At Risk', 'Planning'];
        
        for (let i = 0; i < 6; i++) {
            mockProjects.push({
                id: `project-${i + 1}`,
                projectName: projectNames[i],
                county: subCounty?.county || 'Sample County',
                subCounty: subCounty?.subCounty || 'Sample Sub-County',
                ward: `Ward ${i + 1}`,
                village: `Village ${i + 1}`,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                percentCompleted: Math.floor(Math.random() * 100),
                healthScore: Math.floor(Math.random() * 100),
                startDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
                endDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
                allocatedBudget: (Math.random() * 30000000 + 5000000).toFixed(2),
                contractSum: (Math.random() * 28000000 + 4000000).toFixed(2),
                amountPaid: (Math.random() * 25000000 + 2000000).toFixed(2),
                absorptionRate: (Math.random() * 100).toFixed(2),
                objective: `Improve infrastructure in ${subCounty?.subCounty || 'Sample Sub-County'}`,
                expectedOutput: `Deliver quality services to residents`,
                expectedOutcome: `Enhanced community development`,
                principalInvestigator: `PI ${i + 1}`,
                statusReason: 'Project progressing as planned'
            });
        }
        return mockProjects;
    };

    const calculateSubCountyStats = () => {
        if (!projects.length) return { totalProjects: 0, totalBudget: 0, totalPaid: 0, avgCompletion: 0 };
        
        const totalProjects = projects.length;
        const totalBudget = projects.reduce((sum, project) => sum + (parseFloat(project.costOfProject) || 0), 0);
        const totalPaid = projects.reduce((sum, project) => sum + (parseFloat(project.paidOut) || 0), 0);
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

    const stats = calculateSubCountyStats();

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
                    <LocationOn sx={{ fontSize: '1.5rem' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {subCounty?.subcountyName || subCounty?.subcounty || subCounty?.name || 'Sub-County'} Projects
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
                ) : projects.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Projects Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            No projects are currently assigned to {subCounty?.subcountyName || subCounty?.subcounty || subCounty?.name || 'this subcounty'}.
                        </Typography>
                    </Box>
                ) : (
                    <ProjectDetailTable
                        data={projects.map((project, index) => ({
                            id: project.id,
                            rowNumber: index + 1,
                            projectName: project.projectName,
                            county: project.countyName || 'N/A',
                            subCounty: project.subCountyName,
                            ward: project.wardName,
                            village: project.village || 'N/A',
                            status: project.status,
                            percentCompleted: project.percentCompleted || 0,
                            healthScore: project.healthScore || 0,
                            startDate: formatDate(project.startDate),
                            endDate: formatDate(project.endDate),
                            allocatedBudget: parseFloat(project.costOfProject) || 0,
                            contractSum: parseFloat(project.costOfProject) || 0,
                            amountPaid: parseFloat(project.paidOut) || 0,
                            absorptionRate: project.costOfProject > 0 ? parseFloat((((parseFloat(project.paidOut) || 0) / parseFloat(project.costOfProject)) * 100).toFixed(2)) : 0,
                            objective: project.objective || 'N/A',
                            expectedOutput: project.expectedOutput || 'N/A',
                            expectedOutcome: project.expectedOutcome || 'N/A',
                            principalInvestigator: project.principalInvestigator || 'N/A',
                            statusReason: project.statusReason || 'N/A'
                        }))}
                        columns={[
                            { id: 'rowNumber', label: '#', minWidth: 60, type: 'number' },
                            { id: 'projectName', label: 'Project Name', minWidth: 200, type: 'text' },
                            { id: 'subCounty', label: 'Subcounty', minWidth: 120, type: 'text' },
                            { id: 'ward', label: 'Ward', minWidth: 100, type: 'text' },
                            { id: 'village', label: 'Village', minWidth: 100, type: 'text' },
                            { id: 'status', label: 'Status', minWidth: 100, type: 'status' },
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

export default SubCountyProjectsModal;


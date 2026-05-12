import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    useTheme,
    Fade,
    Slide,
    Tabs,
    Tab
} from '@mui/material';
import { Assessment, AttachMoney, TrendingUp } from '@mui/icons-material';

// Import optimized components
import DashboardFilters from './DashboardFilters';
import OverviewTab from './dashboard/OverviewTab';
import FinancialTab from './dashboard/FinancialTab';
import AnalyticsTab from './dashboard/AnalyticsTab';
import { getProjectStatusBackgroundColor } from '../utils/projectStatusColors';
import projectService from '../api/projectService';
import reportsService from '../api/reportsService';

const ProjectOverviewDashboard = () => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [dashboardData, setDashboardData] = useState({
        projectStatus: [],
        projectProgress: [],
        projectTypes: [],
        budgetAllocation: [],
        statusDistribution: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        department: '',
        status: '',
        projectType: '',
        year: ''
    });

    // Memoized calculations
    const financialSummary = useMemo(() => {
        if (!dashboardData.projectProgress || dashboardData.projectProgress.length === 0) {
            return { totalContracted: 0, totalPaid: 0, absorptionRate: 0 };
        }
        
        const totalContracted = dashboardData.projectProgress.reduce((sum, dept) => {
            return sum + (parseFloat(dept.contractSum) || 0);
        }, 0);
        
        const totalPaid = dashboardData.projectProgress.reduce((sum, dept) => {
            return sum + (parseFloat(dept.amountPaid) || 0);
        }, 0);
        
        const absorptionRate = totalContracted > 0 ? (totalPaid / totalContracted) * 100 : 0;
        
        return { 
            totalContracted, 
            totalPaid, 
            absorptionRate: Math.round(absorptionRate * 100) / 100 
        };
    }, [dashboardData.projectProgress]);

    const projectStats = useMemo(() => {
        const totalProjects = dashboardData.projectStatus.reduce((sum, item) => sum + item.value, 0);
        const completedProjects = dashboardData.projectStatus.find(item => item.name === 'Completed')?.value || 0;
        const delayedProjects = dashboardData.projectStatus.find(item => item.name === 'Delayed')?.value || 0;
        const stalledProjects = dashboardData.projectStatus.find(item => item.name === 'Stalled')?.value || 0;
        const atRiskProjects = dashboardData.projectStatus.find(item => item.name === 'At Risk')?.value || 0;
        
        // Calculate risk level based on problematic project statuses
        const riskProjects = delayedProjects + stalledProjects + atRiskProjects;
        const riskLevel = totalProjects > 0 ? Math.round((riskProjects / totalProjects) * 100) : 0;
        
        return {
            totalProjects,
            completedProjects,
            delayedProjects,
            stalledProjects,
            atRiskProjects,
            riskLevel
        };
    }, [dashboardData.projectStatus]);

    // API Integration Functions
    const fetchProjectStatusData = useCallback(async (filters) => {
        try {
            const response = await projectService.analytics.getProjectStatusCounts();
            return response.map(item => ({
                name: item.status,
                value: item.count,
                color: getProjectStatusBackgroundColor(item.status)
            }));
        } catch (error) {
            console.error('Error fetching project status data:', error);
            return [];
        }
    }, []);

    const fetchBudgetAllocationData = useCallback(async (filters) => {
        try {
            const response = await reportsService.getFinancialStatusByProjectStatus(filters);
            return response.map(item => ({
                name: item.status,
                contracted: parseFloat(item.totalBudget) || 0,
                paid: parseFloat(item.totalPaid) || 0,
                color: getProjectStatusBackgroundColor(item.status),
                count: item.projectCount || 0
            }));
        } catch (error) {
            console.error('Error fetching budget allocation data:', error);
            return [];
        }
    }, []);

    const fetchProjectProgressData = useCallback(async (filters) => {
        try {
            const response = await reportsService.getDepartmentSummaryReport(filters);
            return response.map(dept => ({
                department: dept.departmentAlias || dept.departmentName,
                allocatedBudget: parseFloat(dept.allocatedBudget) || 0,
                contractSum: parseFloat(dept.contractSum) || 0,
                amountPaid: parseFloat(dept.amountPaid) || 0,
                numProjects: dept.numProjects || 0
            }));
        } catch (error) {
            console.error('Error fetching project progress data:', error);
            return [];
        }
    }, []);

    const loadDashboardData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const [projectStatus, budgetAllocation, projectProgress] = await Promise.all([
                fetchProjectStatusData(filters),
                fetchBudgetAllocationData(filters),
                fetchProjectProgressData(filters)
            ]);

            setDashboardData({
                projectStatus,
                projectProgress,
                projectTypes: [],
                budgetAllocation,
                statusDistribution: []
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [filters, fetchProjectStatusData, fetchBudgetAllocationData, fetchProjectProgressData]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const handleFilterChange = useCallback((filterName, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [filterName]: value,
        }));
    }, []);

    const handleRefresh = useCallback(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const handleTabChange = useCallback((event, newValue) => {
        setActiveTab(newValue);
    }, []);

    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }, []);

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: 'calc(100vh - 100px)',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
                <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.5px'
                }}>
                    Loading dashboard...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, opacity: 0.7 }}>
                    Preparing your analytics
                </Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    return (
        <Box sx={{ 
            p: 3, 
            maxWidth: '100%', 
            overflowX: 'hidden',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh'
        }}>
            {/* Header Section */}
            <Fade in timeout={800}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography 
                        variant="h4" 
                        component="h1" 
                        sx={{ 
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 1.5,
                            letterSpacing: '0.3px'
                        }}
                    >
                        Project Overview Dashboard
                    </Typography>
                    <Typography 
                        variant="subtitle1" 
                        color="text.secondary" 
                        sx={{ 
                            fontWeight: 400,
                            opacity: 0.8,
                            letterSpacing: '0.2px'
                        }}
                    >
                        Comprehensive project analytics and insights
                    </Typography>
                </Box>
            </Fade>

            <Slide direction="up" in timeout={1000}>
                <Box>
                    <DashboardFilters 
                        filters={filters} 
                        onFilterChange={handleFilterChange}
                        onRefresh={handleRefresh}
                        isLoading={isLoading}
                    />
                </Box>
            </Slide>

            {/* Tabbed Dashboard Interface */}
            <Box sx={{ mt: 3 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            minHeight: '48px'
                        },
                        '& .Mui-selected': {
                            color: 'primary.main',
                            fontWeight: 'bold'
                        }
                    }}
                >
                    <Tab 
                        label="Overview" 
                        icon={<Assessment />} 
                        iconPosition="start"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    />
                    <Tab 
                        label="Financial" 
                        icon={<AttachMoney />} 
                        iconPosition="start"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    />
                    <Tab 
                        label="Analytics" 
                        icon={<TrendingUp />} 
                        iconPosition="start"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    />
                </Tabs>

                {/* Tab Content */}
                <Box sx={{ mt: 3 }}>
                    {activeTab === 0 && (
                        <OverviewTab 
                            dashboardData={dashboardData}
                            financialSummary={financialSummary}
                            formatCurrency={formatCurrency}
                        />
                    )}
                    {activeTab === 1 && (
                        <FinancialTab dashboardData={dashboardData} />
                    )}
                    {activeTab === 2 && (
                        <AnalyticsTab 
                            dashboardData={dashboardData}
                            {...projectStats}
                        />
                    )}
                </Box>
            </Box>
            
            {/* Footer with additional info */}
            <Fade in timeout={2200}>
                <Box sx={{ mt: 6, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.6 }}>
                        Last updated: {new Date().toLocaleString()}
                    </Typography>
                </Box>
            </Fade>
        </Box>
    );
};

export default ProjectOverviewDashboard;


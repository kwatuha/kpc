import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardHeader,
    useTheme,
    Fade,
    Slide,
    Chip,
    Paper,
    Divider,
    LinearProgress,
    Tabs,
    Tab,
    Container
} from '@mui/material';
import { tokens } from '../pages/dashboard/theme';
import { TrendingUp, Assessment, PieChart, BarChart, Timeline, Business, AttachMoney, CheckCircle, Warning, Speed, TrendingDown, Schedule, FilterList } from '@mui/icons-material';

// Import your chart components and new filter component
import CircularChart from './charts/CircularChart';
import LineBarComboChart from './charts/LineBarComboChart';
import BudgetAllocationChart from './charts/BudgetAllocationChart';
import ProjectStatusDistributionChart from './charts/ProjectStatusDistributionChart';
import DashboardFilters from './DashboardFilters';
import { getProjectStatusBackgroundColor } from '../utils/projectStatusColors';
import { groupStatusesByNormalized, normalizeProjectStatus } from '../utils/projectStatusNormalizer';
import projectService from '../api/projectService';
import reportsService from '../api/reportsService';

const ProjectOverviewDashboard = () => {
    const theme = useTheme();

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
    const [activeTab, setActiveTab] = useState(0);

    // API Integration Functions
    const fetchProjectStatusData = async (filters) => {
        try {
            const response = await projectService.analytics.getProjectStatusCounts();
            console.log('Raw status data from API:', response);
            
            // Ensure we have valid data
            if (!Array.isArray(response) || response.length === 0) {
                console.warn('No status data received from API');
                return [];
            }
            
            // Group statuses by normalized categories
            const grouped = groupStatusesByNormalized(response, 'status', 'count');
            console.log('Normalized grouped status data:', grouped);
            console.log('Number of normalized statuses:', grouped.length);
            console.log('Normalized status names:', grouped.map(g => `${g.name} (${g.value})`));
            
            // Verify grouping worked and we have normalized data
            if (!Array.isArray(grouped) || grouped.length === 0) {
                console.warn('Normalization returned empty array, falling back to individual normalization');
                // Fallback: normalize each item individually and group manually
                const fallbackMap = {};
                response.forEach(item => {
                    const normalized = normalizeProjectStatus(item.status);
                    if (!fallbackMap[normalized]) {
                        fallbackMap[normalized] = { name: normalized, value: 0 };
                    }
                    fallbackMap[normalized].value += item.count || 0;
                });
                const fallbackResult = Object.values(fallbackMap).map(item => ({
                    name: item.name,
                    value: item.value,
                    color: getProjectStatusBackgroundColor(item.name)
                }));
                console.log('Fallback normalized data:', fallbackResult);
                return fallbackResult;
            }
            
            const result = grouped.map(item => ({
                name: item.name,
                value: item.value,
                color: getProjectStatusBackgroundColor(item.name)
            }));
            console.log('Final status data for chart (should only have 7 categories max):', result);
            console.log('Final status count:', result.length);
            console.log('Final status names:', result.map(r => r.name));
            return result;
        } catch (error) {
            console.error('Error fetching project status data:', error);
            return [];
        }
    };

    const fetchProjectTypesData = async (filters) => {
        try {
            const response = await projectService.analytics.getProjectsByDirectorateCounts();
            return response.map((item, index) => ({
                name: item.directorate,
                value: item.count,
                color: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'][index % 6]
            }));
        } catch (error) {
            console.error('Error fetching project types data:', error);
            return [];
        }
    };

    const fetchBudgetAllocationData = async (filters) => {
        try {
            // Remove normalized status filter from API call since API doesn't support it
            // We'll filter client-side after normalization
            const apiFilters = { ...filters };
            delete apiFilters.status;
            delete apiFilters.projectStatus;
            
            const response = await reportsService.getFinancialStatusByProjectStatus(apiFilters);
            // Aggregate financial data by normalized status
            const financialMap = {};
            response.forEach(item => {
                const normalizedStatus = normalizeProjectStatus(item.status);
                if (!financialMap[normalizedStatus]) {
                    financialMap[normalizedStatus] = {
                        name: normalizedStatus,
                        contracted: 0,
                        paid: 0,
                        count: 0
                    };
                }
                financialMap[normalizedStatus].contracted += parseFloat(item.totalBudget) || 0;
                financialMap[normalizedStatus].paid += parseFloat(item.totalPaid) || 0;
                financialMap[normalizedStatus].count += item.projectCount || 0;
            });
            return Object.values(financialMap).map(item => ({
                name: item.name,
                contracted: item.contracted,
                paid: item.paid,
                color: getProjectStatusBackgroundColor(item.name),
                count: item.count
            }));
        } catch (error) {
            console.error('Error fetching budget allocation data:', error);
            return [];
        }
    };

    const fetchProjectProgressData = async (filters) => {
        try {
            // Remove normalized status filter from API call since API doesn't support it
            // We'll filter client-side after normalization
            const apiFilters = { ...filters };
            delete apiFilters.status;
            delete apiFilters.projectStatus;
            
            const response = await reportsService.getDepartmentSummaryReport(apiFilters);
            return response.map(dept => ({
                department: dept.departmentAlias || dept.departmentName, // Use alias for display, fallback to name
                departmentName: dept.departmentName, // Keep full name for tooltips
                departmentAlias: dept.departmentAlias, // Keep alias for filtering
                percentCompleted: dept.percentCompleted || 0,
                percentBudgetContracted: dept.percentBudgetContracted || 0,
                percentContractSumPaid: dept.percentContractSumPaid || 0,
                percentAbsorptionRate: dept.percentAbsorptionRate || 0,
                allocatedBudget: dept.allocatedBudget || 0,
                contractSum: dept.contractSum || 0,
                amountPaid: dept.amountPaid || 0,
                numProjects: dept.numProjects || 0
            }));
        } catch (error) {
            console.error('Error fetching project progress data:', error);
            return [];
        }
    };

    // Calculate financial summary metrics from department data
    const calculateFinancialSummary = (departmentData) => {
        if (!departmentData || departmentData.length === 0) {
            return {
                totalContracted: 0,
                totalPaid: 0,
                absorptionRate: 0
            };
        }

        const totalContracted = departmentData.reduce((sum, dept) => {
            const contractSum = parseFloat(dept.contractSum) || 0;
            return sum + contractSum;
        }, 0);
        
        const totalPaid = departmentData.reduce((sum, dept) => {
            const amountPaid = parseFloat(dept.amountPaid) || 0;
            return sum + amountPaid;
        }, 0);
        
        const absorptionRate = totalContracted > 0 ? (totalPaid / totalContracted) * 100 : 0;

        return {
            totalContracted,
            totalPaid,
            absorptionRate: Math.round(absorptionRate * 100) / 100 // Round to 2 decimal places
        };
    };

    const fetchStatusDistributionData = async (filters) => {
        try {
            // Remove normalized status filter from API call since API doesn't support it
            // We'll filter client-side after normalization
            const apiFilters = { ...filters };
            delete apiFilters.status;
            delete apiFilters.projectStatus;
            
            const response = await reportsService.getProjectStatusSummary(apiFilters);
            // Normalize statuses and group by normalized status (similar to fetchProjectStatusData)
            const normalizedMap = {};
            response.forEach(item => {
                const normalizedStatus = normalizeProjectStatus(item.name);
                if (!normalizedMap[normalizedStatus]) {
                    normalizedMap[normalizedStatus] = {
                        name: normalizedStatus,
                        value: 0,
                        count: 0
                    };
                }
                normalizedMap[normalizedStatus].value += item.value || 0;
                normalizedMap[normalizedStatus].count += item.value || 0;
            });
            
            return Object.values(normalizedMap).map(item => ({
                name: item.name,
                value: item.value,
                color: getProjectStatusBackgroundColor(item.name),
                count: item.value
            }));
        } catch (error) {
            console.error('Error fetching status distribution data:', error);
            return [];
        }
    };


    // Function to load data from API
    const loadDashboardData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Fetch all data in parallel for better performance
            const [
                projectStatusData,
                projectTypesData,
                budgetAllocationData,
                projectProgressData,
                statusDistributionData
            ] = await Promise.all([
                fetchProjectStatusData(filters),
                fetchProjectTypesData(filters),
                fetchBudgetAllocationData(filters),
                fetchProjectProgressData(filters),
                fetchStatusDistributionData(filters)
            ]);

            // Apply client-side filtering if needed
            // Normalize the filter status to ensure consistent comparison
            const normalizedFilterStatus = filters.status ? normalizeProjectStatus(filters.status) : null;
            let filteredProjectStatus = normalizedFilterStatus 
                ? projectStatusData.filter(item => {
                    const itemNormalized = normalizeProjectStatus(item.name);
                    return itemNormalized === normalizedFilterStatus;
                }) 
                : projectStatusData;
            
            // Filter by department - check both department (alias) and departmentName (full name)
            let filteredProjectProgress = filters.department 
                ? projectProgressData.filter(item => 
                    item.department === filters.department || 
                    item.departmentName === filters.department ||
                    item.departmentAlias === filters.department
                ) 
                : projectProgressData;
            
            console.log('Department filter debug:', {
                filterValue: filters.department,
                totalData: projectProgressData.length,
                filteredData: filteredProjectProgress.length,
                availableDepartments: projectProgressData.map(d => ({ 
                    department: d.department, 
                    departmentName: d.departmentName,
                    departmentAlias: d.departmentAlias 
                }))
            });
            
            let filteredProjectTypes = filters.projectType 
                ? projectTypesData.filter(item => item.name === filters.projectType) 
                : projectTypesData;
            
            let filteredBudgetAllocation = normalizedFilterStatus 
                ? budgetAllocationData.filter(item => {
                    const itemNormalized = normalizeProjectStatus(item.name);
                    return itemNormalized === normalizedFilterStatus;
                }) 
                : budgetAllocationData;
            
            let filteredStatusDistribution = normalizedFilterStatus 
                ? statusDistributionData.filter(item => {
                    const itemNormalized = normalizeProjectStatus(item.name);
                    return itemNormalized === normalizedFilterStatus;
                }) 
                : statusDistributionData;

            // Ensure all data has correct colors and verify normalization
            filteredProjectStatus = filteredProjectStatus.map(item => {
                // Double-check that status is normalized (should only be one of the 7 categories)
                const validStatuses = ['Completed', 'Ongoing', 'Not started', 'Stalled', 'Under Procurement', 'Suspended', 'Other'];
                const isNormalized = validStatuses.includes(item.name);
                if (!isNormalized) {
                    console.warn(`Status "${item.name}" is not normalized! Normalizing now...`);
                    const normalized = normalizeProjectStatus(item.name);
                    console.log(`Normalized "${item.name}" to "${normalized}"`);
                    return {
                        ...item,
                        name: normalized,
                        color: getProjectStatusBackgroundColor(normalized)
                    };
                }
                return {
                    ...item,
                    color: getProjectStatusBackgroundColor(item.name)
                };
            });
            
            // Final verification: group again to ensure no duplicates
            const finalGrouped = groupStatusesByNormalized(
                filteredProjectStatus.map(item => ({ status: item.name, count: item.value })),
                'status',
                'count'
            );
            filteredProjectStatus = finalGrouped.map(item => ({
                name: item.name,
                value: item.value,
                color: getProjectStatusBackgroundColor(item.name)
            }));
            console.log('Final verified normalized status data:', filteredProjectStatus);

            // Ensure budget allocation data is normalized and has correct colors
            filteredBudgetAllocation = filteredBudgetAllocation.map(item => {
                // Double-check that status is normalized (should only be one of the 7 categories)
                const validStatuses = ['Completed', 'Ongoing', 'Not started', 'Stalled', 'Under Procurement', 'Suspended', 'Other'];
                const isNormalized = validStatuses.includes(item.name);
                if (!isNormalized) {
                    console.warn(`ProjectOverviewDashboard - Budget allocation status "${item.name}" is not normalized! Normalizing now...`);
                    const normalized = normalizeProjectStatus(item.name);
                    console.log(`ProjectOverviewDashboard - Normalized "${item.name}" to "${normalized}"`);
                    return {
                        ...item,
                        name: normalized,
                        color: getProjectStatusBackgroundColor(normalized)
                    };
                }
                return {
                    ...item,
                    color: getProjectStatusBackgroundColor(item.name)
                };
            });
            
            // Final verification: group again to ensure no duplicates
            const budgetGrouped = {};
            filteredBudgetAllocation.forEach(item => {
                if (!budgetGrouped[item.name]) {
                    budgetGrouped[item.name] = {
                        name: item.name,
                        contracted: 0,
                        paid: 0,
                        count: 0,
                        color: item.color
                    };
                }
                budgetGrouped[item.name].contracted += item.contracted || 0;
                budgetGrouped[item.name].paid += item.paid || 0;
                budgetGrouped[item.name].count += item.count || 0;
            });
            filteredBudgetAllocation = Object.values(budgetGrouped);
            console.log('ProjectOverviewDashboard - Final verified normalized budget allocation data:', filteredBudgetAllocation);

            filteredStatusDistribution = filteredStatusDistribution.map(item => ({
                ...item,
                color: getProjectStatusBackgroundColor(item.name)
            }));

            setDashboardData({
                projectStatus: filteredProjectStatus,
                projectProgress: filteredProjectProgress,
                projectTypes: filteredProjectTypes,
                budgetAllocation: filteredBudgetAllocation,
                statusDistribution: filteredStatusDistribution,
            });
        } catch (err) {
            console.error('Error loading dashboard data:', err);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, [filters]); // Re-run effect when filters change

    const handleFilterChange = (filterName, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [filterName]: value,
        }));
    };

    const handleRefresh = () => {
        loadDashboardData();
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const renderNoDataCard = (title) => (
        <Box sx={{ 
            p: 4, 
            border: '2px dashed rgba(0,0,0,0.1)', 
            borderRadius: '16px', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)',
            transition: 'all 0.3s ease'
        }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                No data available for the selected filters.
            </Typography>
        </Box>
    );

    // KPI Cards Component
    const KPICard = ({ title, value, icon, color, subtitle, progress }) => (
        <Card sx={{ 
            height: '100px',
            borderRadius: '12px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                transform: 'translateY(-4px) scale(1.02)',
                border: `1px solid ${color}20`
            },
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: color,
                borderRadius: '12px 12px 0 0'
            }
        }}>
            <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.7rem' }}>
                        {title}
                    </Typography>
                    <Box sx={{ color: color, fontSize: '1.1rem' }}>
                        {icon}
                    </Box>
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.25, fontSize: '1.25rem' }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                            {subtitle}
                        </Typography>
                    )}
                    {progress !== undefined && (
                        <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ 
                                mt: 1, 
                                height: 4, 
                                borderRadius: 2,
                                backgroundColor: 'rgba(0,0,0,0.1)',
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: color,
                                    borderRadius: 2
                                }
                            }} 
                        />
                    )}
                </Box>
            </CardContent>
        </Card>
    );

    // Calculate KPIs from dashboard data
    const totalProjects = dashboardData.projectStatus.reduce((sum, item) => sum + item.value, 0);
    const completedProjects = dashboardData.projectStatus.find(item => item.name === 'Completed')?.value || 0;
    const inProgressProjects = dashboardData.projectStatus.find(item => item.name === 'Ongoing')?.value || 0;
    const atRiskProjects = dashboardData.projectStatus.find(item => item.name === 'Suspended')?.value || 0;
    const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    const totalBudget = dashboardData.budgetAllocation.reduce((sum, item) => sum + item.value, 0);
    const budgetFormatted = totalBudget >= 1000000 ? `${(totalBudget / 1000000).toFixed(1)}M` : `${(totalBudget / 1000).toFixed(0)}K`;

    // Calculate financial summary from department data
    const financialSummary = calculateFinancialSummary(dashboardData.projectProgress);
    
    // Debug logging to verify calculations
    console.log('Financial Summary Debug:', {
        departmentData: dashboardData.projectProgress,
        totalContracted: financialSummary.totalContracted,
        totalPaid: financialSummary.totalPaid,
        absorptionRate: financialSummary.absorptionRate
    });
    
    const formatCurrency = (amount) => {
        if (amount >= 1000000) {
            return `KSh ${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `KSh ${(amount / 1000).toFixed(0)}K`;
        } else {
            return `KSh ${amount.toLocaleString()}`;
        }
    };

    // Additional metrics for last row
    const averageProgress = dashboardData.projectProgress.length > 0 
        ? Math.round(dashboardData.projectProgress.reduce((sum, dept) => {
            const progress = parseFloat(dept.percentCompleted) || 0;
            return sum + progress;
        }, 0) / dashboardData.projectProgress.length)
        : 0;
    
    // Debug logging for average progress calculation
    console.log('Average Progress Debug:', {
        projectProgressData: dashboardData.projectProgress,
        progressValues: dashboardData.projectProgress.map(dept => ({
            department: dept.department,
            percentCompleted: dept.percentCompleted,
            parsed: parseFloat(dept.percentCompleted) || 0
        })),
        averageProgress: averageProgress
    });
    const totalDepartments = dashboardData.projectProgress.length;
    const delayedProjects = dashboardData.projectStatus.find(item => item.name === 'Suspended')?.value || 0;
    const stalledProjects = dashboardData.projectStatus.find(item => item.name === 'Stalled')?.value || 0;
    const healthScore = totalProjects > 0 ? Math.round(((completedProjects + inProgressProjects) / totalProjects) * 100) : 0;

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
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
            p: 1.5, 
            maxWidth: '100%', 
            overflowX: 'hidden',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh'
        }}>
            {/* Header Section */}
            <Fade in timeout={800}>
                <Box sx={{ mb: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography 
                            variant="h6" 
                            component="h1" 
                            sx={{ 
                                fontWeight: 600,
                                color: 'text.primary',
                                mb: 0,
                                fontSize: '1.125rem',
                                lineHeight: 1.2
                            }}
                        >
                            Project Overview Dashboard
                        </Typography>
                        <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                                fontWeight: 400,
                                opacity: 0.7,
                                fontSize: '0.7rem',
                                display: 'block',
                                mt: 0.15
                            }}
                        >
                            Comprehensive project analytics and insights
                        </Typography>
                    </Box>
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
            <Box sx={{ mt: 1 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            minHeight: '36px',
                            py: 0.75
                        },
                        '& .Mui-selected': {
                            color: 'primary.main',
                            fontWeight: 600
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
                <Box sx={{ mt: 1 }}>
                    {activeTab === 0 && (
                        <Grid container spacing={1}>

                {/* Project Status (Donut Chart) */}
                <Grid item xs={12} md={5}>
                    <Fade in timeout={1200}>
                        <Card sx={{ 
                            height: '280px',
                            borderRadius: '8px',
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'visible',
                            display: 'flex',
                            flexDirection: 'column',
                            '&:hover': {
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                transform: 'translateY(-4px) scale(1.01)',
                                border: '1px solid rgba(25, 118, 210, 0.2)'
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'linear-gradient(90deg, #1976d2, #42a5f5, #64b5f6)',
                                borderRadius: '12px 12px 0 0'
                            }
                        }}>
                            <CardHeader
                                title={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <PieChart sx={{ color: 'primary.main', fontSize: '0.95rem' }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}>
                                            Project Status Overview
                                        </Typography>
                                    </Box>
                                }
                                sx={{ pb: 0.25, px: 1.25, pt: 0.75, flexShrink: 0 }}
                            />
                            <CardContent sx={{ flexGrow: 1, p: 0.75, pt: 0.25, pb: 0.75, overflow: 'visible', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                                <Box sx={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {dashboardData.projectStatus.length > 0 ? (
                                    <CircularChart
                                            title=""
                                        data={dashboardData.projectStatus}
                                        type="donut"
                                    />
                                ) : (
                                    renderNoDataCard("Project Status")
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                    </Fade>
                </Grid>

                {/* Project Performance Metrics */}
                <Grid item xs={12} md={4}>
                    <Fade in timeout={1400}>
                        <Card sx={{ 
                            height: '280px',
                            borderRadius: '8px',
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(33, 150, 243, 0.2)'
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'linear-gradient(90deg, #2196f3, #42a5f5, #64b5f6)',
                                borderRadius: '12px 12px 0 0'
                            }
                        }}>
                            <CardHeader
                                title={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Speed sx={{ color: 'info.main', fontSize: '0.95rem' }} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}>
                                            Project Performance Metrics
                                        </Typography>
                                    </Box>
                                }
                                sx={{ pb: 0.25, px: 1.25, pt: 0.75 }}
                            />
                            <CardContent sx={{ flexGrow: 1, p: 0.75, pt: 0.25, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, justifyContent: 'center' }}>
                                    {/* Completion Rate */}
                                    <Box sx={{ textAlign: 'center', p: 0.75, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50', mb: 0.25, fontSize: '1.75rem' }}>
                                            {completionRate}%
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                            Completion Rate
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={completionRate} 
                                            sx={{ 
                                                height: 4, 
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: '#4caf50',
                                                    borderRadius: 2
                                                }
                                            }} 
                                        />
                                    </Box>

                                    {/* Health Score */}
                                    <Box sx={{ textAlign: 'center', p: 0.75, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: '8px' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3', mb: 0.25, fontSize: '1.75rem' }}>
                                            {healthScore}%
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                            Health Score
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={healthScore} 
                                            sx={{ 
                                                height: 4, 
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: '#2196f3',
                                                    borderRadius: 2
                                                }
                                            }} 
                                        />
                                    </Box>

                                    {/* Average Progress */}
                                    <Box sx={{ textAlign: 'center', p: 0.75, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: '8px' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800', mb: 0.25, fontSize: '1.75rem' }}>
                                            {averageProgress}%
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                            Average Progress
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={averageProgress} 
                                            sx={{ 
                                                height: 4, 
                                                borderRadius: 2,
                                                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: '#ff9800',
                                                    borderRadius: 2
                                                }
                                            }} 
                                        />
                                    </Box>
                            </Box>
                        </CardContent>
                    </Card>
                    </Fade>
                </Grid>

                {/* KPI Cards Row */}
                <Grid item xs={12} md={3}>
                    <Fade in timeout={1600}>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 0.75, 
                            height: '280px',
                            justifyContent: 'space-between'
                        }}>
                            <KPICard
                                title="Total Contracted"
                                value={formatCurrency(financialSummary.totalContracted)}
                                icon={<Business />}
                                color="#1976d2"
                                subtitle="Contract sum across all departments"
                            />
                            <KPICard
                                title="Total Paid"
                                value={formatCurrency(financialSummary.totalPaid)}
                                icon={<CheckCircle />}
                                color="#4caf50"
                                subtitle="Amount disbursed to date"
                            />
                            <KPICard
                                title="Absorption Rate"
                                value={`${financialSummary.absorptionRate}%`}
                                icon={<TrendingUp />}
                                color="#ff9800"
                                subtitle="Paid vs contracted ratio"
                                progress={financialSummary.absorptionRate}
                            />
                        </Box>
                    </Fade>
                </Grid>

                {/* Budget Allocation by Status */}
                <Grid item xs={12} md={8}>
                    <Fade in timeout={1600}>
                        <Card sx={{ 
                            height: '300px',
                            borderRadius: '8px',
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                                boxShadow: '0 12px 40px rgba(255, 152, 0, 0.15)',
                                border: '1px solid rgba(255, 152, 0, 0.4)'
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'linear-gradient(90deg, #ff9800, #ffb74d, #ffcc80)',
                                borderRadius: '12px 12px 0 0'
                            }
                        }}>
                            <CardHeader
                                title={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <BarChart sx={{ color: 'warning.main', fontSize: '1.1rem' }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.9rem' }}>
                                            Budget Allocation by Status
                                        </Typography>
                                    </Box>
                                }
                                sx={{ pb: 0.25, px: 1.25, pt: 0.75 }}
                            />
                            <CardContent sx={{ flexGrow: 1, p: 0.75, pt: 0.25 }}>
                                <Box sx={{ height: '220px', minWidth: '500px' }}>
                                    {dashboardData.budgetAllocation.length > 0 ? (
                                        <BudgetAllocationChart
                                            title=""
                                            data={dashboardData.budgetAllocation}
                                        />
                                    ) : (
                                        renderNoDataCard("Budget Allocation")
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>

                {/* Budget Performance by Department */}
                <Grid item xs={12} md={4}>
                    <Fade in timeout={1800}>
                        <Card sx={{ 
                            height: '300px',
                            borderRadius: '8px',
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                                    boxShadow: '0 12px 40px rgba(76, 175, 80, 0.15)',
                                    border: '1px solid rgba(76, 175, 80, 0.4)'
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                    background: 'linear-gradient(90deg, #f44336, #e57373, #ef5350)',
                                borderRadius: '12px 12px 0 0'
                            }
                        }}>
                            <CardHeader
                                title={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <AttachMoney sx={{ color: 'success.main', fontSize: '1.1rem' }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.9rem' }}>
                                            Budget Performance by Department
                                        </Typography>
                                    </Box>
                                }
                                sx={{ pb: 0.25, px: 1.25, pt: 0.75 }}
                            />
                            <CardContent sx={{ flexGrow: 1, p: 0.75, pt: 0.25 }}>
                                <Box sx={{ height: '220px', minWidth: '300px' }}>
                                    {dashboardData.projectProgress.length > 0 ? (
                                        <BudgetAllocationChart
                                            title=""
                                            data={dashboardData.projectProgress.map(dept => ({
                                                name: dept.department,
                                                contracted: dept.contractSum || 0,
                                                paid: dept.amountPaid || 0,
                                                color: '#4caf50',
                                                count: dept.numProjects || 0
                                            }))}
                                        />
                                    ) : (
                                        renderNoDataCard("Budget Performance")
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Fade>
                </Grid>

                {/* Project Progress (Line/Bar Combo Chart) */}
                <Grid item xs={12} md={9}>
                    <Fade in timeout={2000}>
                        <Card sx={{ 
                            height: '320px',
                            borderRadius: '8px',
                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                border: '1px solid rgba(0, 150, 136, 0.2)'
                            },
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'linear-gradient(90deg, #009688, #26a69a, #4db6ac)',
                                borderRadius: '12px 12px 0 0'
                            }
                        }}>
                            <CardHeader
                                title={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Timeline sx={{ color: 'info.main', fontSize: '1.1rem' }} />
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.9rem' }}>
                                            Project Progress | Stratified By Departments
                                        </Typography>
                                    </Box>
                                }
                                sx={{ pb: 0.25, px: 1.25, pt: 0.75 }}
                            />
                            <CardContent sx={{ flexGrow: 1, p: 0.75, pt: 0.25 }}>
                                <Box sx={{ height: '240px', minWidth: '700px' }}>
                                {dashboardData.projectProgress.length > 0 ? (
                                    <LineBarComboChart
                                            title=""
                                        data={dashboardData.projectProgress}
                                        barKeys={['allocatedBudget', 'contractSum', 'amountPaid']}
                                        xAxisKey="department"
                                        yAxisLabelLeft="Budget/Contract Sum"
                                    />
                                ) : (
                                    renderNoDataCard("Project Progress")
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                    </Fade>
                </Grid>

                {/* Additional Analytics & Quick Actions */}
                <Grid item xs={12} md={3}>
                    <Fade in timeout={2200}>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 0.75, 
                            height: '320px',
                            justifyContent: 'space-between'
                        }}>
                            {/* Project Risk Level */}
                            <Card sx={{ 
                                height: '100px',
                                borderRadius: '8px',
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(244, 67, 54, 0.2)'
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: 'linear-gradient(90deg, #f44336, #e57373, #ef5350)',
                                    borderRadius: '12px 12px 0 0'
                                }
                            }}>
                                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem' }}>
                                            Project Risk Level
                                        </Typography>
                                        <Warning sx={{ color: '#f44336', fontSize: '1.2rem' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
                                            {Math.round((atRiskProjects / totalProjects) * 100)}%
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={(atRiskProjects / totalProjects) * 100} 
                                            sx={{ 
                                                height: 6, 
                                                borderRadius: 3,
                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: (atRiskProjects / totalProjects) * 100 <= 10 ? '#4caf50' : (atRiskProjects / totalProjects) * 100 <= 20 ? '#ff9800' : '#f44336',
                                                    borderRadius: 3
                                                }
                                            }} 
                                        />
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                                            {(atRiskProjects / totalProjects) * 100 <= 10 ? 'Low Risk' : (atRiskProjects / totalProjects) * 100 <= 20 ? 'Medium Risk' : 'High Risk'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Project Timeline Metrics */}
                            <Card sx={{ 
                                height: '100px',
                                borderRadius: '8px',
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(76, 175, 80, 0.2)'
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: 'linear-gradient(90deg, #4caf50, #66bb6a, #81c784)',
                                    borderRadius: '12px 12px 0 0'
                                }
                            }}>
                                <CardContent sx={{ p: 2, height: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem' }}>
                                            Project Timeline Metrics
                                        </Typography>
                                        <Schedule sx={{ color: '#4caf50', fontSize: '1.2rem' }} />
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50', fontSize: '1.1rem' }}>
                                                {Math.round((completedProjects / totalProjects) * 100)}%
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                On-Time Delivery
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800', fontSize: '1.1rem' }}>
                                                {Math.round((delayedProjects + stalledProjects) / totalProjects * 100)}%
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                Delayed Projects
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Issues Summary */}
                            <Card sx={{ 
                                height: '100px',
                                borderRadius: '8px',
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(255, 152, 0, 0.2)'
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: 'linear-gradient(90deg, #ff9800, #ffb74d, #ffcc80)',
                                    borderRadius: '12px 12px 0 0'
                                }
                            }}>
                                <CardContent sx={{ p: 2, height: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem' }}>
                                            Issues Summary
                                        </Typography>
                                        <TrendingDown sx={{ color: '#ff9800', fontSize: '1.2rem' }} />
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336', fontSize: '1.1rem' }}>
                                                {delayedProjects}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                Delayed
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800', fontSize: '1.1rem' }}>
                                                {stalledProjects}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                Stalled
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e91e63', fontSize: '1.1rem' }}>
                                                {atRiskProjects}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                At Risk
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Fade>
                            </Grid>
                        </Grid>
                    )}

                    {activeTab === 1 && (
                        <Grid container spacing={2}>
                            {/* Financial Tab Content */}
                            <Grid item xs={12} md={8}>
                                <Fade in timeout={1600}>
                                    <Card sx={{ 
                                        height: '380px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            boxShadow: '0 12px 40px rgba(255, 152, 0, 0.15)',
                                            border: '1px solid rgba(255, 152, 0, 0.4)'
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '3px',
                                            background: 'linear-gradient(90deg, #ff9800, #ffb74d, #ffcc80)',
                                            borderRadius: '12px 12px 0 0'
                                        }
                                    }}>
                                        <CardHeader
                                            title={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <BarChart sx={{ color: 'warning.main', fontSize: '1.2rem' }} />
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.95rem' }}>
                                                        Budget Allocation by Status
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ pb: 0.5, px: 2, pt: 1.5 }}
                                        />
                                        <CardContent sx={{ flexGrow: 1, p: 1.5, pt: 0 }}>
                                            <Box sx={{ height: '300px', minWidth: '500px' }}>
                                                {dashboardData.budgetAllocation.length > 0 ? (
                                                    <BudgetAllocationChart
                                                        title=""
                                                        data={dashboardData.budgetAllocation}
                                                    />
                                                ) : (
                                                    renderNoDataCard("Budget Allocation")
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Fade>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Fade in timeout={1800}>
                                    <Card sx={{ 
                                        height: '380px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            boxShadow: '0 12px 40px rgba(76, 175, 80, 0.15)',
                                            border: '1px solid rgba(76, 175, 80, 0.4)'
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '3px',
                                            background: 'linear-gradient(90deg, #f44336, #e57373, #ef5350)',
                                            borderRadius: '12px 12px 0 0'
                                        }
                                    }}>
                                        <CardHeader
                                            title={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AttachMoney sx={{ color: 'success.main', fontSize: '1.2rem' }} />
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.95rem' }}>
                                                        Budget Performance by Department
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ pb: 0.5, px: 2, pt: 1.5 }}
                                        />
                                        <CardContent sx={{ flexGrow: 1, p: 1.5, pt: 0 }}>
                                            <Box sx={{ height: '300px', minWidth: '300px' }}>
                                                {dashboardData.projectProgress.length > 0 ? (
                                                    <BudgetAllocationChart
                                                        title=""
                                                        data={dashboardData.projectProgress.map(dept => ({
                                                            name: dept.department,
                                                            contracted: dept.contractSum || 0,
                                                            paid: dept.amountPaid || 0,
                                                            color: '#4caf50',
                                                            count: dept.numProjects || 0
                                                        }))}
                                                    />
                                                ) : (
                                                    renderNoDataCard("Budget Performance")
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Fade>
                            </Grid>
                        </Grid>
                    )}

                    {activeTab === 2 && (
                        <Grid container spacing={2}>
                            {/* Analytics Tab Content */}
                            <Grid item xs={12} md={9}>
                                <Fade in timeout={2000}>
                                    <Card sx={{ 
                                        height: '400px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&:hover': {
                                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                            border: '1px solid rgba(0, 150, 136, 0.2)'
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '3px',
                                            background: 'linear-gradient(90deg, #009688, #26a69a, #4db6ac)',
                                            borderRadius: '12px 12px 0 0'
                                        }
                                    }}>
                                        <CardHeader
                                            title={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Timeline sx={{ color: 'info.main', fontSize: '1.2rem' }} />
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.95rem' }}>
                                                        Project Progress | Stratified By Departments
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ pb: 0.5, px: 2, pt: 1.5 }}
                                        />
                                        <CardContent sx={{ flexGrow: 1, p: 1.5, pt: 0 }}>
                                            <Box sx={{ height: '320px', minWidth: '700px' }}>
                                                {dashboardData.projectProgress.length > 0 ? (
                                                    <LineBarComboChart
                                                        title=""
                                                        data={dashboardData.projectProgress}
                                                        barKeys={['allocatedBudget', 'contractSum', 'amountPaid']}
                                                        xAxisKey="department"
                                                        yAxisLabelLeft="Budget/Contract Sum"
                                                    />
                                                ) : (
                                                    renderNoDataCard("Project Progress")
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Fade>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Fade in timeout={2200}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: 1.5, 
                                        height: '400px',
                                        justifyContent: 'space-between'
                                    }}>
                                        {/* Project Risk Level */}
                                        <Card sx={{ 
                                            height: '120px',
                                            borderRadius: '12px',
                                            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            backdropFilter: 'blur(10px)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                                border: '1px solid rgba(244, 67, 54, 0.2)'
                                            },
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '3px',
                                                background: 'linear-gradient(90deg, #f44336, #e57373, #ef5350)',
                                    borderRadius: '12px 12px 0 0'
                                }
                            }}>
                                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem' }}>
                                                        Project Risk Level
                                        </Typography>
                                                    <Warning sx={{ color: '#f44336', fontSize: '1.2rem' }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
                                                        {Math.round((atRiskProjects / totalProjects) * 100)}%
                                        </Typography>
                                        <LinearProgress 
                                            variant="determinate" 
                                                        value={(atRiskProjects / totalProjects) * 100} 
                                            sx={{ 
                                                height: 6, 
                                                borderRadius: 3,
                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                '& .MuiLinearProgress-bar': {
                                                                backgroundColor: (atRiskProjects / totalProjects) * 100 <= 10 ? '#4caf50' : (atRiskProjects / totalProjects) * 100 <= 20 ? '#ff9800' : '#f44336',
                                                    borderRadius: 3
                                                }
                                            }} 
                                        />
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                                                        {(atRiskProjects / totalProjects) * 100 <= 10 ? 'Low Risk' : (atRiskProjects / totalProjects) * 100 <= 20 ? 'Medium Risk' : 'High Risk'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>

                                        {/* Project Timeline Metrics */}
                            <Card sx={{ 
                                            height: '120px',
                                borderRadius: '12px',
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                                border: '1px solid rgba(76, 175, 80, 0.2)'
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                                background: 'linear-gradient(90deg, #4caf50, #66bb6a, #81c784)',
                                    borderRadius: '12px 12px 0 0'
                                }
                            }}>
                                <CardContent sx={{ p: 2, height: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem' }}>
                                                        Project Timeline Metrics
                                        </Typography>
                                                    <Schedule sx={{ color: '#4caf50', fontSize: '1.2rem' }} />
                                    </Box>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50', fontSize: '1.1rem' }}>
                                                            {Math.round((completedProjects / totalProjects) * 100)}%
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                            On-Time Delivery
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800', fontSize: '1.1rem' }}>
                                                            {Math.round((delayedProjects + stalledProjects) / totalProjects * 100)}%
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                            Delayed Projects
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Issues Summary */}
                            <Card sx={{ 
                                            height: '120px',
                                borderRadius: '12px',
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(255, 152, 0, 0.2)'
                                },
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '3px',
                                    background: 'linear-gradient(90deg, #ff9800, #ffb74d, #ffcc80)',
                                    borderRadius: '12px 12px 0 0'
                                }
                            }}>
                                <CardContent sx={{ p: 2, height: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem' }}>
                                            Issues Summary
                                        </Typography>
                                        <TrendingDown sx={{ color: '#ff9800', fontSize: '1.2rem' }} />
                                    </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336', fontSize: '1.1rem' }}>
                                                {delayedProjects}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                Delayed
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800', fontSize: '1.1rem' }}>
                                                {stalledProjects}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                Stalled
                                            </Typography>
                                        </Box>
                                                    <Box sx={{ textAlign: 'center' }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e91e63', fontSize: '1.1rem' }}>
                                                            {atRiskProjects}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                            At Risk
                                                        </Typography>
                                                    </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Fade>
                </Grid>
            </Grid>
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
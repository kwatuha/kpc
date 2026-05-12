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
    Container,
    Button
} from '@mui/material';
import { tokens } from '../pages/dashboard/theme';
import { 
    TrendingUp, 
    Assessment, 
    PieChart, 
    BarChart, 
    Timeline, 
    Business, 
    AttachMoney, 
    CheckCircle, 
    Warning, 
    Speed, 
    TrendingDown, 
    Schedule, 
    FilterList, 
    ShowChart, 
    Analytics,
    LocationOn,
    Public,
    Home,
    Map
} from '@mui/icons-material';

// Import your chart components and new filter component
import CircularChart from './charts/CircularChart';
import LineBarComboChart from './charts/LineBarComboChart';
import BudgetAllocationChart from './charts/BudgetAllocationChart';
import ProjectStatusDistributionChart from './charts/ProjectStatusDistributionChart';
import DashboardFilters from './DashboardFilters';
import { getProjectStatusBackgroundColor } from '../utils/projectStatusColors';
import projectService from '../api/projectService';
import reportsService from '../api/reportsService';
import regionalService from '../api/regionalService';
import ProjectDetailTable from './tables/ProjectDetailTable';
import DepartmentProjectsModal from './modals/DepartmentProjectsModal';
import YearProjectsModal from './modals/YearProjectsModal';
import CountyProjectsModal from './modals/CountyProjectsModal';
import SubCountyProjectsModal from './modals/SubCountyProjectsModal';
import WardProjectsModal from './modals/WardProjectsModal';
import VillageProjectsModal from './modals/VillageProjectsModal';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
    overviewTableColumns, 
    financialTableColumns, 
    analyticsTableColumns,
    transformOverviewData,
    transformFinancialData,
    transformAnalyticsData
} from './tables/TableConfigs';

const RegionalReportsView = () => {
    const theme = useTheme();

    const [dashboardData, setDashboardData] = useState({
        projectStatus: [],
        budgetAllocation: [],
        projectProgress: [],
        departmentSummary: [],
        projectTypes: [],
        riskAnalysis: [],
        performanceMetrics: [],
        issuesSummary: []
    });

    const [trendsData, setTrendsData] = useState({
        projectPerformance: [],
        financialTrends: [],
        departmentTrends: [],
        statusTrends: []
    });

    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        cidpPeriod: '',
        financialYear: '',
        startDate: '',
        endDate: '',
        projectStatus: '',
        section: '',
        subCounty: '',
        ward: ''
    });

    // Modal states
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [yearModalOpen, setYearModalOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);
    
    // Regional modal states
    const [countyModalOpen, setCountyModalOpen] = useState(false);
    const [selectedCounty, setSelectedCounty] = useState(null);
    const [subCountyModalOpen, setSubCountyModalOpen] = useState(false);
    const [selectedSubCounty, setSelectedSubCounty] = useState(null);
    const [wardModalOpen, setWardModalOpen] = useState(false);
    const [selectedWard, setSelectedWard] = useState(null);
    const [villageModalOpen, setVillageModalOpen] = useState(false);
    const [selectedVillage, setSelectedVillage] = useState(null);

    // Tab change handler
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Modal handlers
    const handleDepartmentClick = (row) => {
        setSelectedDepartment(row);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedDepartment(null);
    };

    const handleYearClick = (row) => {
        setSelectedYear(row);
        setYearModalOpen(true);
    };

    const handleCloseYearModal = () => {
        setYearModalOpen(false);
        setSelectedYear(null);
    };

    // Regional modal handlers
    const handleCountyClick = (row) => {
        setSelectedCounty(row);
        setCountyModalOpen(true);
    };

    const handleCloseCountyModal = () => {
        setCountyModalOpen(false);
        setSelectedCounty(null);
    };

    const handleSubCountyClick = (row) => {
        setSelectedSubCounty(row);
        setSubCountyModalOpen(true);
    };

    const handleCloseSubCountyModal = () => {
        setSubCountyModalOpen(false);
        setSelectedSubCounty(null);
    };

    const handleWardClick = (row) => {
        setSelectedWard(row);
        setWardModalOpen(true);
    };

    const handleCloseWardModal = () => {
        setWardModalOpen(false);
        setSelectedWard(null);
    };

    const handleVillageClick = (row) => {
        setSelectedVillage(row);
        setVillageModalOpen(true);
    };

    const handleCloseVillageModal = () => {
        setVillageModalOpen(false);
        setSelectedVillage(null);
    };

    // Filter handlers
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            cidpPeriod: '',
            financialYear: '',
            startDate: '',
            endDate: '',
            projectStatus: '',
            section: '',
            subCounty: '',
            ward: ''
        });
    };

    // Refresh handler
    const handleRefresh = () => {
        loadDashboardData();
        loadTrendsData();
    };

    // Function to load trends data
    const loadTrendsData = async () => {
        try {
            const trendsResponse = await reportsService.getAnnualTrends();
            setTrendsData(trendsResponse);
        } catch (error) {
            console.error('Error loading trends data:', error);
        }
    };

    // Function to load data from API
    const loadDashboardData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Apply filters to the API call
            const filterParams = {
                ...filters,
                // Map projectStatus to status for API compatibility
                status: filters.projectStatus || filters.status
            };

            let response;
            
            // Load data based on active tab
            switch (activeTab) {
                case 0: // Sub-Counties
                    response = await regionalService.getSubCountiesData(filterParams);
                    break;
                case 1: // Wards
                    response = await regionalService.getWardsData(filterParams);
                    break;
                default:
                    response = await regionalService.getSubCountiesData(filterParams);
            }
            
            // Transform the data for the dashboard
            const transformedData = {
                projectStatus: response.projectStatus || [],
                budgetAllocation: response.budgetAllocation || [],
                projectProgress: response.projectProgress || [],
                departmentSummary: response.departmentSummary || [],
                projectTypes: response.projectTypes || [],
                riskAnalysis: response.riskAnalysis || [],
                performanceMetrics: response.performanceMetrics || [],
                issuesSummary: response.issuesSummary || [],
                // Add regional data
                subCounties: response.subCounties || [],
                wards: response.wards || [],
                villages: response.villages || []
            };

            setDashboardData(transformedData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // For now, use mock data if API fails
            setDashboardData({
                projectStatus: [
                    { name: 'Completed', value: 25 },
                    { name: 'In Progress', value: 15 },
                    { name: 'At Risk', value: 5 },
                    { name: 'Planning', value: 10 }
                ],
                budgetAllocation: [
                    { name: 'Infrastructure', value: 50000000 },
                    { name: 'Health', value: 30000000 },
                    { name: 'Education', value: 20000000 },
                    { name: 'Agriculture', value: 10000000 }
                ],
                projectProgress: [
                    { 
                        departmentId: 1, 
                        departmentName: 'Sample County', 
                        departmentAlias: 'SC', 
                        numProjects: 5, 
                        allocatedBudget: 10000000, 
                        amountPaid: 7500000, 
                        percentAbsorptionRate: 75 
                    },
                    { 
                        departmentId: 2, 
                        departmentName: 'Another County', 
                        departmentAlias: 'AC', 
                        numProjects: 3, 
                        allocatedBudget: 8000000, 
                        amountPaid: 6000000, 
                        percentAbsorptionRate: 75 
                    }
                ],
                departmentSummary: [],
                projectTypes: [],
                riskAnalysis: [],
                performanceMetrics: [],
                issuesSummary: []
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount and when filters or active tab change
    useEffect(() => {
        loadDashboardData();
        loadTrendsData();
    }, [filters, activeTab]);

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
            absorptionRate
        };
    };

    // KPI Card component
    const KPICard = ({ title, value, subtitle, icon, color, trend, trendValue }) => {
        const getTrendIcon = () => {
            if (trend === 'up') return <TrendingUp sx={{ color: 'success.main', fontSize: '1rem' }} />;
            if (trend === 'down') return <TrendingDown sx={{ color: 'error.main', fontSize: '1rem' }} />;
            return <Speed sx={{ color: 'info.main', fontSize: '1rem' }} />;
        };

        return (
            <Card sx={{ 
                height: '110px',
                borderRadius: '12px',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }
            }}>
                <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem' }}>
                            {title}
                        </Typography>
                        {icon}
                    </Box>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
                            {value}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {getTrendIcon()}
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                {subtitle}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        );
    };

    // Loading state
    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: '500' }}>
                        Loading Regional Reports...
                    </Typography>
                </Box>
            </Box>
        );
    }

    // Error state
    if (error) {
        return (
            <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                minHeight: '100vh'
            }}>
                <Alert 
                    severity="error" 
                    sx={{ 
                        borderRadius: '12px',
                        '& .MuiAlert-message': {
                            width: '100%'
                        }
                    }}
                    action={
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                                variant="outlined" 
                                size="small" 
                                onClick={handleRefresh}
                                sx={{ 
                                    borderColor: 'error.main',
                                    color: 'error.main',
                                    '&:hover': {
                                        backgroundColor: 'error.main',
                                        color: 'white'
                                    }
                                }}
                            >
                                Retry
                            </Button>
                        </Box>
                    }
                >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Regional Reports Error
                    </Typography>
                    <Typography variant="body2">
                        {error}
                    </Typography>
                </Alert>
            </Box>
        );
    }

    // Calculate summary metrics from regional data based on active tab
    const regionalData = activeTab === 1 ? (dashboardData.wards || []) : (dashboardData.subCounties || []);
    
    const totalProjects = regionalData.reduce((sum, item) => sum + (parseInt(item.totalProjects) || 0), 0);
    const totalBudget = regionalData.reduce((sum, item) => sum + (parseFloat(item.totalBudget) || 0), 0);
    const totalPaid = regionalData.reduce((sum, item) => sum + (parseFloat(item.totalPaid) || 0), 0);
    const avgProgress = regionalData.length > 0 ? regionalData.reduce((sum, item) => sum + (parseFloat(item.avgProgress) || 0), 0) / regionalData.length : 0;
    const completionRate = Math.round(avgProgress);
    const budgetFormatted = totalBudget >= 1000000 ? `KSh ${(totalBudget / 1000000).toFixed(1)}M` : `KSh ${(totalBudget / 1000).toFixed(0)}K`;
    
    console.log('Debug - calculated values:', { totalProjects, totalBudget, totalPaid, budgetFormatted });

    // Calculate financial summary from regional data
    const financialSummary = {
        totalBudget: totalBudget,
        totalPaid: totalPaid,
        absorptionRate: totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0,
        remainingBudget: totalBudget - totalPaid
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

    return (
        <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
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
                            color: 'text.primary', 
                            mb: 1,
                            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Regional Reports Dashboard
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
                        Comprehensive analysis of projects across counties, sub-counties, wards, and villages
                    </Typography>
                </Box>
            </Fade>

            {/* Filters Section */}
            <Slide in timeout={600} direction="up">
                <Box sx={{ mb: 3 }}>
                    <DashboardFilters 
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
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
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '12px 12px 0 0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            minHeight: '56px',
                            color: 'text.secondary',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            '&:hover': {
                                color: 'primary.main',
                                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                transform: 'translateY(-1px)'
                            }
                        },
                        '& .Mui-selected': {
                            color: 'primary.main',
                            fontWeight: '700',
                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                bottom: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: '60%',
                                height: '3px',
                                backgroundColor: 'primary.main',
                                borderRadius: '2px 2px 0 0'
                            }
                        },
                        '& .MuiTabs-indicator': {
                            display: 'none'
                        }
                    }}
                >
                    <Tab 
                        label="Sub-Counties" 
                        icon={<LocationOn sx={{ fontSize: '1.2rem' }} />} 
                        iconPosition="start"
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            px: 2,
                            '& .MuiTab-iconWrapper': {
                                marginRight: '8px !important'
                            }
                        }}
                    />
                    <Tab 
                        label="Wards" 
                        icon={<Map sx={{ fontSize: '1.2rem' }} />} 
                        iconPosition="start"
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            px: 2,
                            '& .MuiTab-iconWrapper': {
                                marginRight: '8px !important'
                            }
                        }}
                    />
                </Tabs>

                {/* Tab Content */}
                <Box sx={{ 
                    mt: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '0 0 12px 12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderTop: 'none',
                    overflow: 'hidden',
                    p: 3
                }}>
                    <>
                    {activeTab === 0 && (
                        <Box>
                            {/* Sub-Counties Tab - Key Metrics */}
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
                                Sub-County Performance Overview
                            </Typography>

                            <Grid container spacing={2}>
                                {/* Main KPI Cards Row */}
                                <Grid item xs={12}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <KPICard
                                                title="Total Sub-Counties"
                                                value="9"
                                                subtitle="Kitui County sub-counties"
                                                icon={<LocationOn sx={{ color: '#1976d2', fontSize: '1.2rem' }} />}
                                                color="primary"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <KPICard
                                                title="Total Projects"
                                                value={totalProjects}
                                                subtitle="Across all sub-counties"
                                                icon={<Assessment sx={{ color: '#2e7d32', fontSize: '1.2rem' }} />}
                                                color="success"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <KPICard
                                                title="Total Budget"
                                                value={budgetFormatted}
                                                subtitle="Allocated budget"
                                                icon={<AttachMoney sx={{ color: '#f57c00', fontSize: '1.2rem' }} />}
                                                color="warning"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <KPICard
                                                title="Absorption Rate"
                                                value={`${financialSummary.absorptionRate.toFixed(1)}%`}
                                                subtitle="Budget utilization"
                                                icon={<TrendingUp sx={{ color: '#d32f2f', fontSize: '1.2rem' }} />}
                                                color="error"
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>

                            {/* Chart Section - Full Width Row */}
                            <Grid item xs={12}>
                                <Card sx={{ 
                                    height: '500px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                                        border: '1px solid rgba(25, 118, 210, 0.3)'
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
                                                <BarChart sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.95rem' }}>
                                                    Budget vs Paid by Sub-County (All)
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{ pb: 0.5, px: 2, pt: 1.5 }}
                                    />
                                    <CardContent sx={{ flexGrow: 1, p: 1.5, pt: 0 }}>
                                        <Box sx={{ 
                                            height: '420px', 
                                            minWidth: { xs: '280px', sm: '300px' },
                                            overflow: 'visible'
                                        }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsBarChart data={dashboardData.subCounties || []} margin={{ top: 20, right: 30, left: 20, bottom: 160 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                    <XAxis 
                                                        dataKey="subcountyName" 
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={160}
                                                        fontSize={11}
                                                        interval={0}
                                                        tick={{ fontSize: 11 }}
                                                        width={100}
                                                    />
                                                    <YAxis 
                                                        tickFormatter={(value) => `KSh ${(value / 1000000).toFixed(1)}M`}
                                                        tick={{ fontSize: 12 }}
                                                    />
                                                    <Tooltip 
                                                        formatter={(value, name) => [
                                                            `KSh ${(value / 1000000).toFixed(2)}M`, 
                                                            name === 'totalBudget' ? 'Budget' : 'Paid'
                                                        ]}
                                                        contentStyle={{
                                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="totalBudget" fill="#1976d2" name="Budget" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="totalPaid" fill="#2e7d32" name="Paid" radius={[4, 4, 0, 0]} />
                                                </RechartsBarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Performance Highlights - Separate Row */}
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Card sx={{ 
                                            p: 2, 
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
                                                boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                                                transform: 'translateY(-2px)',
                                                border: '1px solid rgba(25, 118, 210, 0.3)'
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <TrendingUp sx={{ color: '#1976d2', fontSize: '1.2rem', mr: 1 }} />
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    Top Performer
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                {dashboardData.subCounties?.reduce((max, sub) => 
                                                    parseFloat(sub.absorptionRate) > parseFloat(max.absorptionRate) ? sub : max, 
                                                    { absorptionRate: 0, subcountyName: 'N/A' }
                                                ).subcountyName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Highest absorption rate
                                            </Typography>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Card sx={{ 
                                            p: 2, 
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
                                                boxShadow: '0 12px 40px rgba(76, 175, 80, 0.15)',
                                                transform: 'translateY(-2px)',
                                                border: '1px solid rgba(76, 175, 80, 0.3)'
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Assessment sx={{ color: '#2e7d32', fontSize: '1.2rem', mr: 1 }} />
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    Most Projects
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                                {dashboardData.subCounties?.reduce((max, sub) => 
                                                    parseInt(sub.totalProjects) > parseInt(max.totalProjects) ? sub : max, 
                                                    { totalProjects: 0, subcountyName: 'N/A' }
                                                ).subcountyName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Most active sub-county
                                            </Typography>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Card sx={{ 
                                            p: 2, 
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
                                                boxShadow: '0 12px 40px rgba(255, 152, 0, 0.15)',
                                                transform: 'translateY(-2px)',
                                                border: '1px solid rgba(255, 152, 0, 0.3)'
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <AttachMoney sx={{ color: '#f57c00', fontSize: '1.2rem', mr: 1 }} />
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    Largest Budget
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                                                {dashboardData.subCounties?.reduce((max, sub) => 
                                                    parseFloat(sub.totalBudget) > parseFloat(max.totalBudget) ? sub : max, 
                                                    { totalBudget: 0, subcountyName: 'N/A' }
                                                ).subcountyName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Highest allocation
                                            </Typography>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Sub-County Details Table - Below Chart and KPIs */}
                            <Grid item xs={12}>
                                    <ProjectDetailTable
                                        data={(dashboardData.subCounties || []).map((subcounty, index) => ({ 
                                            id: subcounty.subcountyId || `subcounty-${index}`,
                                            rowNumber: index + 1,
                                            subcountyName: subcounty.subcountyName || 'N/A',
                                            totalWards: subcounty.totalWards || 0,
                                            totalProjects: subcounty.totalProjects || 0,
                                            totalBudget: parseFloat(subcounty.totalBudget) || 0,
                                            totalPaid: parseFloat(subcounty.totalPaid) || 0,
                                            absorptionRate: parseFloat(subcounty.absorptionRate) || 0,
                                            avgProgress: parseFloat(subcounty.avgProgress) || 0
                                        }))}
                                        columns={[
                                            { id: 'rowNumber', label: '#', minWidth: 60, type: 'number' },
                                            { id: 'subcountyName', label: 'Sub-County', minWidth: 150, type: 'text' },
                                            { id: 'totalWards', label: 'Wards', minWidth: 80, type: 'number' },
                                            { id: 'totalProjects', label: 'Projects', minWidth: 100, type: 'number' },
                                            { id: 'totalBudget', label: 'Budget', minWidth: 120, type: 'currency' },
                                            { id: 'totalPaid', label: 'Paid', minWidth: 120, type: 'currency' },
                                            { id: 'absorptionRate', label: 'Absorption Rate', minWidth: 130, type: 'percentage' },
                                            { id: 'avgProgress', label: 'Avg Progress', minWidth: 120, type: 'percentage' }
                                        ]}
                                        title="Sub-County Performance Details"
                                        onRowClick={(row) => handleSubCountyClick(row)}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {activeTab === 1 && (
                        <Box>
                            {/* Wards Tab */}
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
                                Ward Performance Analysis
                            </Typography>

                            <Grid container spacing={2}>
                                {/* Main Ward KPI Cards Row */}
                                <Grid item xs={12}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <KPICard
                                                title="Total Wards"
                                                value="41"
                                                subtitle="Kitui County wards"
                                                icon={<Map sx={{ color: '#1976d2', fontSize: '1.2rem' }} />}
                                                color="primary"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <KPICard
                                                title="Total Projects"
                                                value={totalProjects}
                                                subtitle="Across all wards"
                                                icon={<Assessment sx={{ color: '#2e7d32', fontSize: '1.2rem' }} />}
                                                color="success"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <KPICard
                                                title="Total Budget"
                                                value={budgetFormatted}
                                                subtitle="Allocated budget"
                                                icon={<AttachMoney sx={{ color: '#f57c00', fontSize: '1.2rem' }} />}
                                                color="warning"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <KPICard
                                                title="Absorption Rate"
                                                value={`${financialSummary.absorptionRate.toFixed(1)}%`}
                                                subtitle="Budget utilization"
                                                icon={<TrendingUp sx={{ color: '#d32f2f', fontSize: '1.2rem' }} />}
                                                color="error"
                                            />
                                        </Grid>
                                    </Grid>
                                </Grid>

                            {/* Ward Chart Section - Full Width Row */}
                            <Grid item xs={12}>
                                <Card sx={{ 
                                    height: '500px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                                        border: '1px solid rgba(25, 118, 210, 0.3)'
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
                                                <BarChart sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
                                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.95rem' }}>
                                                    Budget vs Paid by Ward (Top 6)
                                                </Typography>
                                            </Box>
                                        }
                                        sx={{ pb: 0.5, px: 2, pt: 1.5 }}
                                    />
                                    <CardContent sx={{ flexGrow: 1, p: 1.5, pt: 0 }}>
                                        <Box sx={{ 
                                            height: '420px', 
                                            minWidth: { xs: '280px', sm: '300px' },
                                            overflow: 'visible'
                                        }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RechartsBarChart data={(dashboardData.wards || []).slice(0, 6)} margin={{ top: 20, right: 30, left: 20, bottom: 160 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                                    <XAxis 
                                                        dataKey="wardName" 
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={160}
                                                        fontSize={11}
                                                        interval={0}
                                                        tick={{ fontSize: 11 }}
                                                        width={100}
                                                    />
                                                    <YAxis 
                                                        tickFormatter={(value) => `KSh ${(value / 1000000).toFixed(1)}M`}
                                                        tick={{ fontSize: 12 }}
                                                    />
                                                    <Tooltip 
                                                        formatter={(value, name) => [
                                                            `KSh ${(value / 1000000).toFixed(2)}M`, 
                                                            name === 'totalBudget' ? 'Budget' : 'Paid'
                                                        ]}
                                                        contentStyle={{
                                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                            border: '1px solid #e0e0e0',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Bar dataKey="totalBudget" fill="#1976d2" name="Budget" radius={[4, 4, 0, 0]} />
                                                    <Bar dataKey="totalPaid" fill="#2e7d32" name="Paid" radius={[4, 4, 0, 0]} />
                                                </RechartsBarChart>
                                            </ResponsiveContainer>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Ward Performance Highlights - Separate Row */}
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Card sx={{ 
                                            p: 2, 
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
                                                boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                                                transform: 'translateY(-2px)',
                                                border: '1px solid rgba(25, 118, 210, 0.3)'
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <TrendingUp sx={{ color: '#1976d2', fontSize: '1.2rem', mr: 1 }} />
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    Top Ward
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                                {dashboardData.wards?.reduce((max, ward) => 
                                                    parseFloat(ward.absorptionRate) > parseFloat(max.absorptionRate) ? ward : max, 
                                                    { absorptionRate: 0, wardName: 'N/A' }
                                                ).wardName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Highest absorption rate
                                            </Typography>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Card sx={{ 
                                            p: 2, 
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
                                                boxShadow: '0 12px 40px rgba(76, 175, 80, 0.15)',
                                                transform: 'translateY(-2px)',
                                                border: '1px solid rgba(76, 175, 80, 0.3)'
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Assessment sx={{ color: '#2e7d32', fontSize: '1.2rem', mr: 1 }} />
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    Most Active
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                                {dashboardData.wards?.reduce((max, ward) => 
                                                    parseInt(ward.totalProjects) > parseInt(max.totalProjects) ? ward : max, 
                                                    { totalProjects: 0, wardName: 'N/A' }
                                                ).wardName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Most projects
                                            </Typography>
                                        </Card>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Card sx={{ 
                                            p: 2, 
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
                                                boxShadow: '0 12px 40px rgba(255, 152, 0, 0.15)',
                                                transform: 'translateY(-2px)',
                                                border: '1px solid rgba(255, 152, 0, 0.3)'
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
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <AttachMoney sx={{ color: '#f57c00', fontSize: '1.2rem', mr: 1 }} />
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    Highest Budget
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                                                {dashboardData.wards?.reduce((max, ward) => 
                                                    parseFloat(ward.totalBudget) > parseFloat(max.totalBudget) ? ward : max, 
                                                    { totalBudget: 0, wardName: 'N/A' }
                                                ).wardName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Largest allocation
                                            </Typography>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Ward Details Table - Below Chart and KPIs */}
                            <Grid item xs={12}>
                                    <ProjectDetailTable
                                        data={(dashboardData.wards || []).map((ward, index) => {
                                            console.log('Debug - Ward data:', ward);
                                            return {
                                                id: ward.wardId || `ward-${index}`,
                                                rowNumber: index + 1,
                                                wardName: ward.wardName || 'N/A',
                                                subcountyName: ward.subcountyName || 'N/A',
                                                totalProjects: ward.totalProjects || 0,
                                                totalBudget: parseFloat(ward.totalBudget) || 0,
                                                totalPaid: parseFloat(ward.totalPaid) || 0,
                                                absorptionRate: parseFloat(ward.absorptionRate) || 0,
                                                avgProgress: parseFloat(ward.avgProgress) || 0
                                            };
                                        })}
                                        columns={[
                                            { id: 'rowNumber', label: '#', minWidth: 60, type: 'number' },
                                            { id: 'wardName', label: 'Ward', minWidth: 150, type: 'text' },
                                            { id: 'subcountyName', label: 'Sub-County', minWidth: 120, type: 'text' },
                                            { id: 'totalProjects', label: 'Projects', minWidth: 100, type: 'number' },
                                            { id: 'totalBudget', label: 'Budget', minWidth: 120, type: 'currency' },
                                            { id: 'totalPaid', label: 'Paid', minWidth: 120, type: 'currency' },
                                            { id: 'absorptionRate', label: 'Absorption Rate', minWidth: 130, type: 'percentage' },
                                            { id: 'avgProgress', label: 'Avg Progress', minWidth: 120, type: 'percentage' }
                                        ]}
                                        title="Ward Performance Details"
                                        onRowClick={(row) => handleWardClick(row)}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    )}

                    {activeTab === 2 && (
                        <Grid container spacing={2}>
                            {/* Wards Tab */}
                            <Grid item xs={12}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
                                    Ward Performance Analysis
                                </Typography>
                            </Grid>

                            {/* Ward KPI Cards */}
                            <Grid item xs={12} sm={6} md={3}>
                                <KPICard
                                    title="Total Wards"
                                    value="1,450"
                                    subtitle="Active wards"
                                    icon={<Map sx={{ color: '#1976d2', fontSize: '1.2rem' }} />}
                                    color="primary"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <KPICard
                                    title="Avg Projects/Ward"
                                    value={Math.round(totalProjects / 1450)}
                                    subtitle="Average projects"
                                    icon={<Assessment sx={{ color: '#2e7d32', fontSize: '1.2rem' }} />}
                                    color="success"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <KPICard
                                    title="Budget Efficiency"
                                    value={`${financialSummary.absorptionRate.toFixed(2)}%`}
                                    subtitle="Absorption rate"
                                    icon={<TrendingUp sx={{ color: '#f57c00', fontSize: '1.2rem' }} />}
                                    color="warning"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <KPICard
                                    title="Completion Rate"
                                    value={`${completionRate}%`}
                                    subtitle="Overall completion"
                                    icon={<CheckCircle sx={{ color: '#388e3c', fontSize: '1.2rem' }} />}
                                    color="success"
                                />
                            </Grid>

                            {/* Ward Details Table */}
                            <Grid item xs={12}>
                                <ProjectDetailTable
                                    data={(dashboardData.wards || []).map((ward, index) => {
                                        console.log('Debug - Ward data:', ward);
                                        return {
                                            id: ward.wardId || `ward-${index}`,
                                            rowNumber: index + 1,
                                            wardName: ward.wardName || 'N/A',
                                            subcountyName: ward.subcountyName || 'N/A',
                                            totalProjects: ward.totalProjects || 0,
                                            totalBudget: parseFloat(ward.totalBudget) || 0,
                                            totalPaid: parseFloat(ward.totalPaid) || 0,
                                            absorptionRate: parseFloat(ward.absorptionRate) || 0,
                                            avgProgress: parseFloat(ward.avgProgress) || 0
                                        };
                                    })}
                                    columns={[
                                        { id: 'rowNumber', label: '#', minWidth: 60, type: 'number' },
                                        { id: 'wardName', label: 'Ward', minWidth: 150, type: 'text' },
                                        { id: 'subcountyName', label: 'Sub-County', minWidth: 120, type: 'text' },
                                        { id: 'totalProjects', label: 'Projects', minWidth: 100, type: 'number' },
                                        { id: 'totalBudget', label: 'Budget', minWidth: 120, type: 'currency' },
                                        { id: 'totalPaid', label: 'Paid', minWidth: 120, type: 'currency' },
                                        { id: 'absorptionRate', label: 'Absorption Rate', minWidth: 130, type: 'percentage' },
                                        { id: 'avgProgress', label: 'Avg Progress', minWidth: 120, type: 'percentage' }
                                    ]}
                                    title="Ward Performance Details"
                                    onRowClick={(row) => handleWardClick(row)}
                                />
                            </Grid>
                        </Grid>
                    )}

                    {/* Removed Villages tab - focusing on Sub-Counties and Wards only */}
                    {false && (
                        <Grid container spacing={2}>
                            {/* Villages Tab */}
                            <Grid item xs={12}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'text.primary' }}>
                                    Village Performance Analysis
                                </Typography>
                            </Grid>

                            {/* Village KPI Cards */}
                            <Grid item xs={12} sm={6} md={3}>
                                <KPICard
                                    title="Total Villages"
                                    value="7,250"
                                    subtitle="Active villages"
                                    icon={<Home sx={{ color: '#1976d2', fontSize: '1.2rem' }} />}
                                    color="primary"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <KPICard
                                    title="Avg Projects/Village"
                                    value={Math.round(totalProjects / 7250)}
                                    subtitle="Average projects"
                                    icon={<Assessment sx={{ color: '#2e7d32', fontSize: '1.2rem' }} />}
                                    color="success"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <KPICard
                                    title="Budget Efficiency"
                                    value={`${financialSummary.absorptionRate.toFixed(2)}%`}
                                    subtitle="Absorption rate"
                                    icon={<TrendingUp sx={{ color: '#f57c00', fontSize: '1.2rem' }} />}
                                    color="warning"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <KPICard
                                    title="Completion Rate"
                                    value={`${completionRate}%`}
                                    subtitle="Overall completion"
                                    icon={<CheckCircle sx={{ color: '#388e3c', fontSize: '1.2rem' }} />}
                                    color="success"
                                />
                            </Grid>

                            {/* Village Details Table */}
                            <Grid item xs={12}>
                                <ProjectDetailTable
                                    data={dashboardData.projectProgress.map((dept, index) => ({ 
                                        id: dept.departmentId || dept.department || `dept-${index}`,
                                        rowNumber: index + 1,
                                        village: dept.departmentName || dept.department,
                                        ward: dept.departmentAlias || dept.department,
                                        numProjects: dept.numProjects || 0,
                                        allocatedBudget: parseFloat(dept.allocatedBudget) || 0,
                                        amountPaid: parseFloat(dept.amountPaid) || 0,
                                        absorptionRate: parseFloat(dept.percentAbsorptionRate) || 0
                                    }))}
                                    columns={[
                                        { id: 'rowNumber', label: '#', minWidth: 60, type: 'number' },
                                        { id: 'village', label: 'Village', minWidth: 150, type: 'text' },
                                        { id: 'ward', label: 'Ward', minWidth: 120, type: 'text' },
                                        { id: 'numProjects', label: 'Projects', minWidth: 100, type: 'number' },
                                        { id: 'allocatedBudget', label: 'Budget', minWidth: 120, type: 'currency' },
                                        { id: 'amountPaid', label: 'Paid', minWidth: 120, type: 'currency' },
                                        { id: 'absorptionRate', label: 'Absorption Rate', minWidth: 130, type: 'percentage' }
                                    ]}
                                    title="Village Performance Details"
                                    onRowClick={(row) => handleVillageClick(row)}
                                />
                            </Grid>
                        </Grid>
                    )}
                    </>
                </Box>
            </Box>

            {/* Modals */}
            <DepartmentProjectsModal
                open={modalOpen}
                onClose={handleCloseModal}
                department={selectedDepartment}
            />

            <YearProjectsModal
                open={yearModalOpen}
                onClose={handleCloseYearModal}
                year={selectedYear}
            />

            {/* Regional Modals */}
            <CountyProjectsModal
                open={countyModalOpen}
                onClose={handleCloseCountyModal}
                county={selectedCounty}
            />

            <SubCountyProjectsModal
                open={subCountyModalOpen}
                onClose={handleCloseSubCountyModal}
                subCounty={selectedSubCounty}
            />

            <WardProjectsModal
                open={wardModalOpen}
                onClose={handleCloseWardModal}
                ward={selectedWard}
            />

            <VillageProjectsModal
                open={villageModalOpen}
                onClose={handleCloseVillageModal}
                village={selectedVillage}
            />
        </Box>
    );
};

export default RegionalReportsView;

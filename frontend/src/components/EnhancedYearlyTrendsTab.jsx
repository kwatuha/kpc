import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardHeader,
    useTheme,
    Fade,
    CircularProgress,
    Alert,
    Paper,
    Divider,
    LinearProgress,
    Container,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { tokens } from '../pages/dashboard/theme';
import { 
    TrendingUp, 
    TrendingDown, 
    Assessment, 
    Timeline, 
    ShowChart, 
    Analytics,
    Compare,
    AttachMoney,
    CheckCircle,
    Warning,
    Schedule,
    Business,
    FilterList,
    BarChart
} from '@mui/icons-material';
import BarLineChart from './charts/BarLineChart';
import LineBarComboChart from './charts/LineBarComboChart';
import reportsService from '../api/reportsService';

const EnhancedYearlyTrendsTab = ({ 
    dashboardData, 
    totalProjects, 
    completedProjects, 
    totalSubCounties, 
    totalSubCountyBudget, 
    healthScore, 
    formatCurrency 
}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    const [reportData, setReportData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedView, setSelectedView] = useState('overview'); // 'overview', 'subcounty', 'ward'

    // Table columns for yearly trends
    const yearlyTrendsTableColumns = [
        { field: 'name', headerName: 'Financial Year', minWidth: 150, flex: 1.2 },
        { field: 'projectCount', headerName: 'Total Projects', minWidth: 100, type: 'number', flex: 0.8 },
        {
            field: 'totalBudget',
            headerName: 'Total Budget',
            minWidth: 150,
            type: 'number',
            flex: 1,
            valueFormatter: (params) => {
                if (!params || params.value == null) {
                    return '';
                }
                return `KES ${parseFloat(params.value).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        },
        {
            field: 'totalPaid',
            headerName: 'Total Paid',
            minWidth: 150,
            type: 'number',
            flex: 1,
            valueFormatter: (params) => {
                if (!params || params.value == null) {
                    return '';
                }
                return `KES ${parseFloat(params.value).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
        },
        {
            field: 'absorptionRate',
            headerName: 'Absorption Rate',
            minWidth: 120,
            type: 'number',
            flex: 0.8,
            valueFormatter: (params) => {
                if (!params || params.value == null) {
                    return '';
                }
                return `${parseFloat(params.value).toFixed(1)}%`;
            }
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Try to get yearly trends data
                const fetchedData = await reportsService.getYearlyTrendsReport({});
                setReportData(fetchedData);
            } catch (err) {
                console.log('Yearly trends API not available, using mock data');
                // Fallback to mock data if API is not available
                const mockData = [
                    { name: '2022/2023', projectCount: 45, totalBudget: 150000000, totalPaid: 120000000, absorptionRate: 80.0 },
                    { name: '2023/2024', projectCount: 52, totalBudget: 180000000, totalPaid: 150000000, absorptionRate: 83.3 },
                    { name: '2024/2025', projectCount: 48, totalBudget: 200000000, totalPaid: 160000000, absorptionRate: 80.0 }
                ];
                setReportData(mockData);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading yearly trends data...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
    }

    if (reportData.length === 0) {
        return <Alert severity="info" sx={{ mt: 2 }}>No yearly trends data found.</Alert>;
    }

    // Process the data for the chart
    const chartData = reportData.map(item => ({
        name: item.name,
        budget: parseFloat(item.totalBudget),
        paid: parseFloat(item.totalPaid),
    }));

    // Create a unique ID for each row
    const getRowId = (row) => `${row.name}-${row.projectCount}-${row.totalBudget}`;

    return (
        <Box>
            {/* Enhanced Header with View Selection */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: colors.primary[100] }}>
                            Regional Yearly Trends Analysis
                        </Typography>
                        <Typography variant="body1" sx={{ color: colors.grey[100], mt: 1 }}>
                            Financial year performance trends and budget absorption analysis
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                <InputLabel>View</InputLabel>
                                <Select
                                    value={selectedView}
                                    onChange={(e) => setSelectedView(e.target.value)}
                                    label="View"
                                >
                                    <MenuItem value="overview">Overview</MenuItem>
                                    <MenuItem value="subcounty">By Subcounty</MenuItem>
                                    <MenuItem value="ward">By Ward</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Yearly Trends Chart */}
            <Box sx={{ mb: 4 }}>
                <Fade in timeout={800}>
                    <Card sx={{ 
                        borderRadius: '16px',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <CardHeader
                            title={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BarChart sx={{ color: colors.primary[100], fontSize: '1.5rem' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.primary[100] }}>
                                        Budget vs Paid Trends Over Time
                                    </Typography>
                                </Box>
                            }
                        />
                        <CardContent>
                            <Box sx={{ height: '400px', minWidth: '300px' }}>
                                <BarLineChart data={chartData} />
                            </Box>
                        </CardContent>
                    </Card>
                </Fade>
            </Box>

            {/* Yearly Trends Data Table */}
            <Box sx={{ mb: 4 }}>
                <Fade in timeout={1000}>
                    <Card sx={{ 
                        borderRadius: '16px',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <CardHeader
                            title={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Analytics sx={{ color: colors.primary[100], fontSize: '1.5rem' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.primary[100] }}>
                                        Financial Year Performance Summary
                                    </Typography>
                                </Box>
                            }
                        />
                        <CardContent sx={{ p: 0 }}>
                            <Box 
                                sx={{ 
                                    height: 600, 
                                    width: '100%',
                                    "& .MuiDataGrid-root": {
                                        border: "none",
                                    },
                                    "& .MuiDataGrid-cell": {
                                        borderBottom: "none",
                                    },
                                    "& .MuiDataGrid-columnHeaders": {
                                        backgroundColor: `${colors.blueAccent[700]} !important`,
                                        borderBottom: "none",
                                    },
                                    "& .MuiDataGrid-virtualScroller": {
                                        backgroundColor: colors.primary[400],
                                    },
                                    "& .MuiDataGrid-footerContainer": {
                                        borderTop: "none",
                                        backgroundColor: `${colors.blueAccent[700]} !important`,
                                    },
                                }}
                            >
                                <DataGrid
                                    rows={reportData}
                                    columns={yearlyTrendsTableColumns}
                                    pageSizeOptions={[10, 15, 25, 50]}
                                    disableRowSelectionOnClick
                                    getRowId={getRowId}
                                    density="compact"
                                    initialState={{
                                        pagination: {
                                            paginationModel: {
                                                pageSize: 15,
                                            },
                                        },
                                    }}
                                    sx={{
                                        '& .MuiDataGrid-cell': {
                                            fontSize: '0.875rem',
                                            padding: '6px 12px',
                                            minHeight: '36px !important',
                                        },
                                        '& .MuiDataGrid-columnHeaders': {
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            minHeight: '40px !important',
                                            padding: '8px 12px',
                                        },
                                        '& .MuiDataGrid-row': {
                                            minHeight: '36px !important',
                                        },
                                        '& .MuiDataGrid-footerContainer': {
                                            minHeight: '40px !important',
                                            fontSize: '0.875rem',
                                        },
                                        '& .MuiTablePagination-root': {
                                            fontSize: '0.875rem',
                                        },
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Fade>
            </Box>

            {/* Regional Performance Insights */}
            <Box sx={{ mb: 4 }}>
                <Fade in timeout={1200}>
                    <Card sx={{ 
                        borderRadius: '16px',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <CardHeader
                            title={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingUp sx={{ color: colors.primary[100], fontSize: '1.5rem' }} />
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.primary[100] }}>
                                        Regional Performance Insights
                                    </Typography>
                                </Box>
                            }
                        />
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: colors.primary[500], mb: 1 }}>
                                            {totalProjects}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Regional Projects
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: colors.greenAccent[500], mb: 1 }}>
                                            {Math.round((completedProjects / totalProjects) * 100)}%
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Regional Completion Rate
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Paper sx={{ p: 2, textAlign: 'center', background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)' }}>
                                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: colors.blueAccent[500], mb: 1 }}>
                                            {formatCurrency(totalSubCountyBudget)}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Regional Budget
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Fade>
            </Box>
        </Box>
    );
};

export default EnhancedYearlyTrendsTab;

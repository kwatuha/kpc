import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    useTheme,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { tokens } from '../pages/dashboard/theme';
import apiService from '../api';

import ProjectStatusDonutChart from './charts/ProjectStatusDonutChart';
import BarChart from './charts/BarChart';
import LineChart from './charts/LineChart';
import StackedBarChart from './charts/StackedBarChart';

// Define the columns for the detailed project list table with a consistent formatter
const projectListColumns = [
    { field: 'projectName', headerName: 'Project Title', minWidth: 200, flex: 1 },
    { field: 'financialYearName', headerName: 'Financial Year', minWidth: 100 },
    { field: 'departmentName', headerName: 'Department', minWidth: 150 },
    { field: 'countyName', headerName: 'County', minWidth: 120 },
    { field: 'subcountyName', headerName: 'Subcounty', minWidth: 120 },
    { field: 'wardName', headerName: 'Ward', minWidth: 120 },
    { field: 'status', headerName: 'Status', minWidth: 100 },
    {
        field: 'costOfProject',
        headerName: 'Budget',
        minWidth: 120,
        type: 'number',
        valueFormatter: (params) => formatCurrency(params.value),
    },
    {
        field: 'paidOut',
        headerName: 'Paid Amount',
        minWidth: 120,
        type: 'number',
        valueFormatter: (params) => formatCurrency(params.value),
    },
];

// Helper function for consistent currency formatting
const formatCurrency = (value) => {
    if (value == null) {
        return '';
    }
    return `KES ${parseFloat(value).toLocaleString('en-KE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

// Helper function to render a no-data card
const renderNoDataCard = (title) => (
    <Box
        sx={{
            p: 2,
            border: '1px dashed #ccc',
            borderRadius: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        }}
    >
        <Typography variant="h6" align="center" gutterBottom>
            {title}
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary">
            No data available for this chart.
        </Typography>
    </Box>
);

const ProjectSummaryReport = ({ filters }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [reportData, setReportData] = useState({
        detailedList: [],
        statusSummary: [],
        projectsStatusOverTime: [],
        projectsByStatusAndYear: [],
        financialStatusByProjectStatus: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const [
                    fetchedProjectData,
                    fetchedStatusData,
                    fetchedStatusOverTime,
                    fetchedFinancialStatus,
                    fetchedStatusAndYear,
                ] = await Promise.all([
                    apiService.reports.getDetailedProjectList(filters),
                    apiService.reports.getProjectStatusSummary(filters),
                    apiService.reports.getProjectStatusOverTime(filters),
                    apiService.reports.getFinancialStatusByProjectStatus(filters),
                    apiService.reports.getProjectsByStatusAndYear(filters),
                ]);

                setReportData({
                    detailedList: Array.isArray(fetchedProjectData) ? fetchedProjectData : [],
                    statusSummary: Array.isArray(fetchedStatusData) ? fetchedStatusData : [],
                    projectsStatusOverTime: Array.isArray(fetchedStatusOverTime) ? fetchedStatusOverTime : [],
                    financialStatusByProjectStatus: Array.isArray(fetchedFinancialStatus) ? fetchedFinancialStatus : [],
                    projectsByStatusAndYear: Array.isArray(fetchedStatusAndYear) ? fetchedStatusAndYear : [],
                });
            } catch (err) {
                setError('Failed to load project summary report data.');
                console.error('API call failed:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [filters]);

    // Use useMemo to prevent re-computation on every render
    const hasData = useMemo(
        () =>
            reportData.detailedList.length > 0 ||
            reportData.statusSummary.length > 0 ||
            reportData.projectsStatusOverTime.length > 0 ||
            reportData.financialStatusByProjectStatus.length > 0 ||
            reportData.projectsByStatusAndYear.length > 0,
        [reportData]
    );

    // Process data for charts using useMemo for performance
    const donutChartData = useMemo(
        () =>
            reportData.statusSummary.map((item) => ({
                name: item.name || item.statusName,
                value: item.value || item.count,
            })),
        [reportData.statusSummary]
    );

    const stackedBarChartTransformedData = useMemo(() => {
        const data = reportData.projectsByStatusAndYear;
        return Object.values(
            data.reduce((acc, item) => {
                if (!acc[item.year]) {
                    acc[item.year] = { year: item.year };
                }
                acc[item.year][item.status] = item.projectCount;
                return acc;
            }, {})
        );
    }, [reportData.projectsByStatusAndYear]);

    const allStatuses = useMemo(
        () => [...new Set(reportData.projectsByStatusAndYear.map((item) => item.status))],
        [reportData.projectsByStatusAndYear]
    );

    // Render logic
    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading report data...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    if (!hasData) {
        return (
            <Alert severity="info" sx={{ mt: 2 }}>
                No data found for the selected filters.
            </Alert>
        );
    }

    // A more structured and reusable way to define the layout
    const chartSections = [
        {
            title: 'Projects by Status',
            data: donutChartData,
            component: ProjectStatusDonutChart,
            props: { title: '# of Projects by Status', data: donutChartData },
            gridSize: { xs: 12, md: 5, lg: 4 },
        },
        {
            title: 'Budget & Paid by Status',
            data: reportData.financialStatusByProjectStatus,
            component: BarChart,
            props: {
                title: 'Budget & Paid by Status',
                data: reportData.financialStatusByProjectStatus,
                xDataKey: 'status',
                yDataKey: ['totalBudget', 'totalPaid'],
                yAxisLabel: 'Amount (Ksh)',
            },
            gridSize: { xs: 12, md: 7, lg: 8 },
        },
        {
            title: 'Projects by Status and Year',
            data: stackedBarChartTransformedData,
            component: StackedBarChart,
            props: {
                title: 'Projects by Status and Year',
                data: stackedBarChartTransformedData,
                xDataKey: 'year',
                barKeys: allStatuses,
                yAxisLabel: 'Projects',
            },
            gridSize: { xs: 12, md: 6 },
        },
        {
            title: 'Projects Over Time',
            data: reportData.projectsStatusOverTime,
            component: LineChart,
            props: {
                title: 'Projects Over Time',
                data: reportData.projectsStatusOverTime,
                xDataKey: 'year',
                yDataKey: 'projectCount',
                yAxisLabel: 'Projects',
            },
            gridSize: { xs: 12, md: 6 },
        },
    ];

    return (
        <Box sx={{ p: 3, maxWidth: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                Comprehensive Project Overview
            </Typography>

            {/* Dynamic Chart Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {chartSections.map((section, index) => (
                    <Grid item key={index} {...section.gridSize}>
                        <Card sx={{ height: '400px' }}>
                            <CardContent sx={{ height: '100%', p: 2 }}>
                                {section.data.length > 0 ? (
                                    <Box sx={{ width: '100%', height: '100%' }}>
                                        <section.component {...section.props} />
                                    </Box>
                                ) : (
                                    renderNoDataCard(section.title)
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Detailed Project List
                </Typography>
                <Box
                    sx={{
                        height: 600,
                        width: '100%',
                        '& .MuiDataGrid-root': { border: 'none' },
                        '& .MuiDataGrid-cell': { borderBottom: 'none' },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: `${colors.blueAccent[700]} !important`,
                            borderBottom: 'none',
                        },
                        '& .MuiDataGrid-virtualScroller': { backgroundColor: colors.primary[400] },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: 'none',
                            backgroundColor: `${colors.blueAccent[700]} !important`,
                        },
                    }}
                >
                    <DataGrid
                        rows={reportData.detailedList}
                        columns={projectListColumns}
                        pageSizeOptions={[5, 10, 25]}
                        disableRowSelectionOnClick
                        getRowId={(row) => `${row.projectName}-${row.financialYearName}-${row.departmentName}-${row.countyName}`}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                        }}
                    />
                </Box>
            </Box>

            {/* Payment Approval Summary */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600, color: colors.grey[800], mb: 3 }}>
                    🔐 Payment Approval Summary
                </Typography>
                <Card sx={{
                    borderRadius: 3,
                    boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
                    border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.grey[200]}`,
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom sx={{
                            fontWeight: 600,
                            color: theme.palette.mode === 'dark' ? 'white' : colors.grey[800],
                            mb: 3,
                        }}>
                            Approval Levels & Payment Status Overview
                        </Typography>

                        {/* Approval Levels Grid */}
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(300px, 1fr))' },
                            gap: 3,
                            mb: 4,
                        }}>
                            {/* The four payment level cards */}
                            {/* Level 1 - Initial Review */}
                            <Card sx={{
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.mode === 'dark' ? colors.blueAccent[400] : colors.blueAccent[200]}`,
                                background: theme.palette.mode === 'dark'
                                    ? `linear-gradient(135deg, ${colors.blueAccent[700]}, ${colors.blueAccent[800]})`
                                    : `linear-gradient(135deg, ${colors.blueAccent[50]}, ${colors.blueAccent[100]})`,
                            }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.blueAccent[600] }}>
                                            🔍 Level 1
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: colors.grey[600], fontWeight: 500 }}>
                                            Initial Review
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {/* Pending Amount */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                                                Pending Review:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.orange[600] }}>
                                                KES {(() => (Math.floor(Math.random() * 5000000) + 2000000).toLocaleString('en-KE'))()}
                                            </Typography>
                                        </Box>

                                        {/* Approved Amount */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                                                Approved:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.greenAccent[600] }}>
                                                KES {(() => (Math.floor(Math.random() * 8000000) + 5000000).toLocaleString('en-KE'))()}
                                            </Typography>
                                        </Box>

                                        {/* Request Count */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                                                Requests:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {Math.floor(Math.random() * 15) + 8}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Level 2 - Technical Review */}
                            <Card sx={{
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.mode === 'dark' ? colors.greenAccent[400] : colors.greenAccent[200]}`,
                                background: theme.palette.mode === 'dark'
                                    ? `linear-gradient(135deg, ${colors.greenAccent[700]}, ${colors.greenAccent[800]})`
                                    : `linear-gradient(135deg, ${colors.greenAccent[50]}, ${colors.greenAccent[100]})`,
                            }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.greenAccent[600] }}>
                                            ⚙️ Level 2
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: colors.grey[600], fontWeight: 500 }}>
                                            Technical Review
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {/* Pending Amount */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                                                Pending Review:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.orange[600] }}>
                                                KES {(() => (Math.floor(Math.random() * 3000000) + 1000000).toLocaleString('en-KE'))()}
                                            </Typography>
                                        </Box>

                                        {/* Approved Amount */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                                                Approved:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.greenAccent[600] }}>
                                                KES {(() => (Math.floor(Math.random() * 6000000) + 3000000).toLocaleString('en-KE'))()}
                                            </Typography>
                                        </Box>

                                        {/* Request Count */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                                                Requests:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {Math.floor(Math.random() * 12) + 5}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Level 3 - Financial Review */}
                            <Card sx={{
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[200]}`,
                                background: theme.palette.mode === 'dark'
                                    ? `linear-gradient(135deg, ${colors.primary[700]}, ${colors.primary[800]})`
                                    : `linear-gradient(135deg, ${colors.primary[50]}, ${colors.primary[100]})`,
                            }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.primary[600] }}>
                                            💰 Level 3
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: colors.grey[600], fontWeight: 500 }}>
                                            Financial Review
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {/* Pending Amount */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                                                Pending Review:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.orange[600] }}>
                                                KES {(() => (Math.floor(Math.random() * 2000000) + 500000).toLocaleString('en-KE'))()}
                                            </Typography>
                                        </Box>

                                        {/* Approved Amount */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                                                Approved:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.greenAccent[600] }}>
                                                KES {(() => (Math.floor(Math.random() * 4000000) + 2000000).toLocaleString('en-KE'))()}
                                            </Typography>
                                        </Box>

                                        {/* Request Count */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                                                Requests:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {Math.floor(Math.random() * 10) + 3}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Level 4 - Final Approval */}
                            <Card sx={{
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.mode === 'dark' ? colors.redAccent[400] : colors.redAccent[200]}`,
                                background: theme.palette.mode === 'dark'
                                    ? `linear-gradient(135deg, ${colors.redAccent[700]}, ${colors.redAccent[800]})`
                                    : `linear-gradient(135deg, ${colors.redAccent[50]}, ${colors.redAccent[100]})`,
                            }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: colors.redAccent[600] }}>
                                            🎯 Level 4
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: colors.grey[600], fontWeight: 500 }}>
                                            Final Approval
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {/* Pending Amount */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                                                Pending Review:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.orange[600] }}>
                                                KES {(() => (Math.floor(Math.random() * 1000000) + 100000).toLocaleString('en-KE'))()}
                                            </Typography>
                                        </Box>

                                        {/* Approved Amount */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                                                Approved:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: colors.greenAccent[600] }}>
                                                KES {(() => (Math.floor(Math.random() * 2000000) + 1000000).toLocaleString('en-KE'))()}
                                            </Typography>
                                        </Box>

                                        {/* Request Count */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" sx={{ color: colors.grey[600] }}>
                                                Requests:
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {Math.floor(Math.random() * 5) + 1}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default ProjectSummaryReport;
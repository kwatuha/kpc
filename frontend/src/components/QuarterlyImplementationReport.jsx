import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    IconButton,
    Tooltip,
    Fade,
    Slide,
    CircularProgress,
    Alert,
    useTheme,
    Card,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    PictureAsPdf as PdfIcon,
    TableChart as ExcelIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    PlayArrow as PlayIcon,
    MoreVert as MoreVertIcon,
    ArrowUpward as ArrowUpwardIcon
} from '@mui/icons-material';
import apiService from '../api';
import { formatCurrency } from '../utils/helpers';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const QuarterlyImplementationReport = () => {
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [totals, setTotals] = useState({
        totalProjects: 0,
        totalBudget: 0,
        totalSpent: 0,
        averageProgress: 0,
        onTrackProjects: 0,
        delayedProjects: 0
    });
    const [filters, setFilters] = useState({
        quarter: 'Q1',
        year: '2024',
        department: 'asc',
        status: 'asc'
    });
    const [exportingPDF, setExportingPDF] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiService.reports.getQuarterlyImplementationReport(filters);
                setReportData(response.data || []);
                setTotals(response.summary || {
                    totalProjects: 0,
                    totalBudget: 0,
                    totalSpent: 0,
                    averageProgress: 0,
                    onTrackProjects: 0,
                    delayedProjects: 0
                });
            } catch (err) {
                console.error('Error fetching quarterly implementation report:', err);
                setError('Failed to load quarterly implementation report data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [filters]);

    const formatPercentage = (value) => {
        return `${value.toFixed(1)}%`;
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return '#4caf50';
            case 'on track':
                return '#2196f3';
            case 'delayed':
                return '#ff9800';
            case 'at risk':
                return '#f44336';
            default:
                return '#9e9e9e';
        }
    };

    const handleExportPDF = () => {
        setExportingPDF(true);
        try {
            const doc = new jsPDF('landscape', 'pt', 'a4');
            
            // Add title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Quarterly Implementation Report', 40, 40);
            
            // Add subtitle
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`${filters.quarter} ${filters.year} - Project implementation progress and financial performance`, 40, 60);
            
            // Add generation date
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 80);
            
            // Prepare table data
            const headers = [
                'Project Name',
                'Department',
                'Quarter',
                'Status',
                'Progress %',
                'Budget',
                'Spent',
                'Remaining',
                'Start Date',
                'End Date'
            ];
            
            const data = reportData.map(row => [
                row.projectName,
                row.department,
                row.quarter,
                row.status,
                `${row.progressPercentage.toFixed(1)}%`,
                formatCurrency(row.budget),
                formatCurrency(row.spent),
                formatCurrency(row.remaining),
                row.startDate,
                row.endDate
            ]);
            
            // Add summary row
            data.push([
                'TOTAL',
                '-',
                '-',
                '-',
                `${totals.averageProgress.toFixed(1)}%`,
                formatCurrency(totals.totalBudget),
                formatCurrency(totals.totalSpent),
                formatCurrency(totals.totalBudget - totals.totalSpent),
                '-',
                '-'
            ]);
            
            // Create table
            doc.autoTable({
                head: [headers],
                body: data,
                startY: 100,
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                    overflow: 'linebreak',
                    halign: 'left'
                },
                headStyles: {
                    fillColor: [25, 118, 210],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                columnStyles: {
                    4: { halign: 'right' }, // Progress %
                    5: { halign: 'right' }, // Budget
                    6: { halign: 'right' }, // Spent
                    7: { halign: 'right' }  // Remaining
                },
                margin: { top: 100, left: 40, right: 40 }
            });
            
            // Save the PDF
            doc.save(`quarterly-implementation-report-${filters.quarter}-${filters.year}.pdf`);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            alert('Failed to export to PDF. Please try again.');
        } finally {
            setExportingPDF(false);
        }
    };

    const handleExportExcel = () => {
        setExportingExcel(true);
        try {
            // Prepare data for Excel export
            const excelData = reportData.map(row => ({
                'Project Name': row.projectName,
                'Department': row.department,
                'Quarter': row.quarter,
                'Status': row.status,
                'Progress %': `${row.progressPercentage.toFixed(1)}%`,
                'Budget': row.budget,
                'Spent': row.spent,
                'Remaining': row.remaining,
                'Start Date': row.startDate,
                'End Date': row.endDate
            }));
            
            // Add summary row
            excelData.push({
                'Project Name': 'TOTAL',
                'Department': '-',
                'Quarter': '-',
                'Status': '-',
                'Progress %': `${totals.averageProgress.toFixed(1)}%`,
                'Budget': totals.totalBudget,
                'Spent': totals.totalSpent,
                'Remaining': totals.totalBudget - totals.totalSpent,
                'Start Date': '-',
                'End Date': '-'
            });
            
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            
            // Set column widths
            const columnWidths = [
                { wch: 30 }, // Project Name
                { wch: 20 }, // Department
                { wch: 10 }, // Quarter
                { wch: 12 }, // Status
                { wch: 12 }, // Progress %
                { wch: 15 }, // Budget
                { wch: 15 }, // Spent
                { wch: 15 }, // Remaining
                { wch: 12 }, // Start Date
                { wch: 12 }  // End Date
            ];
            worksheet['!cols'] = columnWidths;
            
            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Quarterly Implementation Report');
            
            // Save the Excel file
            XLSX.writeFile(workbook, `quarterly-implementation-report-${filters.quarter}-${filters.year}.xlsx`);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Failed to export to Excel. Please try again.');
        } finally {
            setExportingExcel(false);
        }
    };

    const handleRefresh = () => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiService.reports.getQuarterlyImplementationReport(filters);
                setReportData(response.data || []);
                setTotals(response.summary || {
                    totalProjects: 0,
                    totalBudget: 0,
                    totalSpent: 0,
                    averageProgress: 0,
                    onTrackProjects: 0,
                    delayedProjects: 0
                });
            } catch (err) {
                console.error('Error fetching quarterly implementation report:', err);
                setError('Failed to load quarterly implementation report data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    };

    const removeFilter = (filterKey) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[filterKey];
            return newFilters;
        });
    };

    const handleFilterChange = (filterKey, value) => {
        setFilters(prev => ({
            ...prev,
            [filterKey]: value
        }));
    };

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '50vh' 
            }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Box sx={{ 
            p: { xs: 2, sm: 3 }, 
            maxWidth: '100%', 
            overflowX: 'hidden',
            background: '#f0f9ff',
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
                            color: '#1976d2',
                            mb: 1.5,
                            letterSpacing: '0.3px'
                        }}
                    >
                        Quarterly Implementation Report
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
                        {filters.quarter} {filters.year} - Project implementation progress and financial performance
                    </Typography>
                </Box>
            </Fade>

            {/* Filter Controls */}
            <Slide direction="up" in timeout={1000}>
                <Card sx={{ mb: 3, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Quarter</InputLabel>
                                <Select
                                    value={filters.quarter}
                                    label="Quarter"
                                    onChange={(e) => handleFilterChange('quarter', e.target.value)}
                                >
                                    <MenuItem value="Q1">Q1</MenuItem>
                                    <MenuItem value="Q2">Q2</MenuItem>
                                    <MenuItem value="Q3">Q3</MenuItem>
                                    <MenuItem value="Q4">Q4</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Year</InputLabel>
                                <Select
                                    value={filters.year}
                                    label="Year"
                                    onChange={(e) => handleFilterChange('year', e.target.value)}
                                >
                                    <MenuItem value="2024">2024</MenuItem>
                                    <MenuItem value="2023">2023</MenuItem>
                                    <MenuItem value="2022">2022</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Button
                                variant="contained"
                                startIcon={<RefreshIcon />}
                                onClick={handleRefresh}
                                sx={{ height: '40px' }}
                            >
                                Refresh
                            </Button>
                        </Grid>
                    </Grid>
                </Card>
            </Slide>

            {/* Export Controls */}
            <Slide direction="up" in timeout={1200}>
                <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                    <Button
                        variant="contained"
                        startIcon={exportingPDF ? <CircularProgress size={20} color="inherit" /> : <PdfIcon />}
                        onClick={handleExportPDF}
                        disabled={isLoading || reportData.length === 0 || exportingPDF || exportingExcel}
                        sx={{
                            backgroundColor: '#d32f2f',
                            '&:hover': {
                                backgroundColor: '#b71c1c',
                            },
                            '&:disabled': {
                                backgroundColor: '#ccc',
                                color: '#666'
                            },
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {exportingPDF ? 'Generating PDF...' : 'Export to PDF'}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={exportingExcel ? <CircularProgress size={20} color="inherit" /> : <ExcelIcon />}
                        onClick={handleExportExcel}
                        disabled={isLoading || reportData.length === 0 || exportingPDF || exportingExcel}
                        sx={{
                            backgroundColor: '#2e7d32',
                            '&:hover': {
                                backgroundColor: '#1b5e20',
                            },
                            '&:disabled': {
                                backgroundColor: '#ccc',
                                color: '#666'
                            },
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        {exportingExcel ? 'Generating Excel...' : 'Export to Excel'}
                    </Button>
                </Box>
            </Slide>

            {/* Summary Cards */}
            <Slide direction="up" in timeout={1400}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#e3f2fd' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                {totals.totalProjects}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Projects
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#e8f5e8' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                {formatPercentage(totals.averageProgress)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Avg Progress
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#fff3e0' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                                {totals.onTrackProjects}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                On Track
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#ffebee' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                                {totals.delayedProjects}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Delayed
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#f3e5f5' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                                {formatCurrency(totals.totalBudget)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Budget
                            </Typography>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                        <Card sx={{ p: 2, textAlign: 'center', backgroundColor: '#e0f2f1' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00695c' }}>
                                {formatCurrency(totals.totalSpent)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Spent
                            </Typography>
                        </Card>
                    </Grid>
                </Grid>
            </Slide>

            {/* Active Filters */}
            <Slide direction="up" in timeout={1600}>
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Object.entries(filters).map(([key, value]) => (
                        <Chip
                            key={key}
                            label={`↑ ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value} X`}
                            onDelete={() => removeFilter(key)}
                            color="primary"
                            variant="outlined"
                            sx={{
                                borderRadius: '16px',
                                fontWeight: 500
                            }}
                        />
                    ))}
                </Box>
            </Slide>

            {/* Main Report Table */}
            <Slide direction="up" in timeout={1800}>
                <Card sx={{ 
                    borderRadius: '8px',
                    background: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0',
                    overflow: 'visible',
                    position: 'relative'
                }}>
                    <TableContainer 
                        component={Paper} 
                        elevation={0} 
                        sx={{ 
                            borderRadius: '8px',
                            maxHeight: '70vh',
                            overflow: 'auto',
                            position: 'relative',
                            '& .MuiTableHead-root': {
                                position: 'sticky',
                                top: 0,
                                zIndex: 10,
                                backgroundColor: '#1976d2'
                            }
                        }}
                    >
                        <Table sx={{ minWidth: 1400 }} stickyHeader>
                            <TableHead>
                                <TableRow sx={{ 
                                    backgroundColor: '#1976d2',
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 1,
                                    '& .MuiTableCell-head': {
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '0.875rem',
                                        textTransform: 'none',
                                        letterSpacing: '0.3px',
                                        padding: '12px 8px',
                                        borderBottom: 'none',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1
                                    }
                                }}>
                                    <TableCell sx={{ 
                                        width: '25%',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            Project Name
                                            <ArrowUpwardIcon sx={{ color: 'white', fontSize: '1rem' }} />
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '15%',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            Department
                                            <IconButton size="small" sx={{ color: 'white' }}>
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '8%',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        Quarter
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '10%',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        Status
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '8%', 
                                        textAlign: 'right',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        Progress %
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '12%', 
                                        textAlign: 'right',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        Budget
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '12%', 
                                        textAlign: 'right',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        Spent
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '12%', 
                                        textAlign: 'right',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        Remaining
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '10%',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        Start Date
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '10%',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        End Date
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.map((row) => (
                                    <TableRow 
                                        key={row.id}
                                        sx={{ 
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5',
                                            },
                                            '&:last-child td': {
                                                borderBottom: 0
                                            },
                                            '& .MuiTableCell-root': {
                                                padding: '12px 8px',
                                                borderBottom: '1px solid #e0e0e0',
                                                fontSize: '0.875rem'
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PlayIcon sx={{ color: theme.palette.primary.main, fontSize: '1rem' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                    {row.projectName}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {row.department}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {row.quarter}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.status}
                                                size="small"
                                                sx={{
                                                    backgroundColor: getStatusColor(row.status),
                                                    color: 'white',
                                                    fontWeight: 500,
                                                    fontSize: '0.75rem'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {formatPercentage(row.progressPercentage)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {formatCurrency(row.budget)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {formatCurrency(row.spent)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {formatCurrency(row.remaining)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {row.startDate}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {row.endDate}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                
                                {/* Summary Row */}
                                <TableRow sx={{ 
                                    backgroundColor: '#f8f9fa',
                                    '& .MuiTableCell-root': {
                                        fontWeight: 'bold',
                                        borderTop: '2px solid #1976d2',
                                        padding: '16px 8px',
                                        fontSize: '0.875rem',
                                        borderBottom: 'none'
                                    }
                                }}>
                                    <TableCell colSpan={4}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            TOTAL
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {formatPercentage(totals.averageProgress)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {formatCurrency(totals.totalBudget)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {formatCurrency(totals.totalSpent)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {formatCurrency(totals.totalBudget - totals.totalSpent)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell colSpan={2}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            -
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Slide>
        </Box>
    );
};

export default QuarterlyImplementationReport;
















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
    CardContent,
    Divider,
    Grid
} from '@mui/material';
import {
    PictureAsPdf as PdfIcon,
    TableChart as ExcelIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    PlayArrow as PlayIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import apiService from '../api';
import { formatCurrency } from '../utils/helpers';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PerformanceManagementReport = () => {
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [totals, setTotals] = useState({
        count: 0,
        averageCompletion: 0,
        absorptionPercentage: 0,
        fyTargetAdp: 0,
        fyActual: 0
    });
    const [filters, setFilters] = useState({
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
                const response = await apiService.reports.getPerformanceManagementReport();
                setReportData(response.data || []);
                setTotals(response.summary || {
                    count: 0,
                    averageCompletion: 0,
                    absorptionPercentage: 0,
                    fyTargetAdp: 0,
                    fyActual: 0
                });
            } catch (err) {
                console.error('Error fetching performance management report:', err);
                setError('Failed to load performance management report data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatPercentage = (value) => {
        return `${value.toFixed(1)}%`;
    };

    const formatNumber = (value) => {
        return value.toFixed(1);
    };

    const handleExportPDF = () => {
        setExportingPDF(true);
        try {
            const doc = new jsPDF('landscape', 'pt', 'a4');
            
            // Add title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Performance Management Report', 40, 40);
            
            // Add subtitle
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('Department performance metrics and financial targets analysis', 40, 60);
            
            // Add generation date
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 80);
            
            // Prepare table data
            const headers = [
                'Department',
                'Ward',
                'Status',
                'Type',
                '% Complete',
                'Absorption %',
                'FY Target (ADP)',
                'FY Actual'
            ];
            
            const data = reportData.map(row => [
                row.department,
                row.ward || '-',
                row.status || '-',
                `Count: ${row.projectCount}`,
                `${row.completionPercentage.toFixed(1)}%`,
                `${row.absorptionPercentage.toFixed(2)}%`,
                row.fyTargetAdp.toFixed(1),
                row.fyActual.toFixed(1)
            ]);
            
            // Add summary row
            data.push([
                'TOTAL',
                '-',
                '-',
                `Count: ${totals.count}`,
                `${totals.averageCompletion.toFixed(1)}%`,
                `Absorbed: ${totals.absorptionPercentage.toFixed(1)}%`,
                totals.fyTargetAdp.toFixed(1),
                totals.fyActual.toFixed(1)
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
                    4: { halign: 'right' }, // % Complete
                    5: { halign: 'right' }, // Absorption %
                    6: { halign: 'right' }, // FY Target (ADP)
                    7: { halign: 'right' }  // FY Actual
                },
                margin: { top: 100, left: 40, right: 40 }
            });
            
            // Save the PDF
            doc.save(`performance-management-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
                'Department': row.department,
                'Ward': row.ward || '-',
                'Status': row.status || '-',
                'Type': `Count: ${row.projectCount}`,
                'Completion %': `${row.completionPercentage.toFixed(1)}%`,
                'Absorption %': `${row.absorptionPercentage.toFixed(2)}%`,
                'FY Target (ADP)': row.fyTargetAdp,
                'FY Actual': row.fyActual
            }));
            
            // Add summary row
            excelData.push({
                'Department': 'TOTAL',
                'Ward': '-',
                'Status': '-',
                'Type': `Count: ${totals.count}`,
                'Completion %': `${totals.averageCompletion.toFixed(1)}%`,
                'Absorption %': `Absorbed: ${totals.absorptionPercentage.toFixed(1)}%`,
                'FY Target (ADP)': totals.fyTargetAdp,
                'FY Actual': totals.fyActual
            });
            
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            
            // Set column widths
            const columnWidths = [
                { wch: 40 }, // Department
                { wch: 15 }, // Ward
                { wch: 15 }, // Status
                { wch: 12 }, // Type
                { wch: 12 }, // Completion %
                { wch: 12 }, // Absorption %
                { wch: 15 }, // FY Target (ADP)
                { wch: 12 }  // FY Actual
            ];
            worksheet['!cols'] = columnWidths;
            
            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Performance Management Report');
            
            // Save the Excel file
            XLSX.writeFile(workbook, `performance-management-report-${new Date().toISOString().split('T')[0]}.xlsx`);
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
                const response = await apiService.reports.getPerformanceManagementReport();
                setReportData(response.data || []);
                setTotals(response.summary || {
                    count: 0,
                    averageCompletion: 0,
                    absorptionPercentage: 0,
                    fyTargetAdp: 0,
                    fyActual: 0
                });
            } catch (err) {
                console.error('Error fetching performance management report:', err);
                setError('Failed to load performance management report data. Please try again.');
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
                        Performance Management Report
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
                        Department performance metrics and financial targets analysis
                    </Typography>
                </Box>
            </Fade>

            {/* Export Controls */}
            <Slide direction="up" in timeout={1000}>
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

            {/* Active Filters */}
            <Slide direction="up" in timeout={1200}>
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Object.entries(filters).map(([key, value]) => (
                        <Chip
                            key={key}
                            label={`↑ ${key.charAt(0).toUpperCase() + key.slice(1)} X`}
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
            <Slide direction="up" in timeout={1400}>
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
                        <Table sx={{ minWidth: 1200 }} stickyHeader>
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
                                            Project
                                            <IconButton size="small" sx={{ color: 'white' }}>
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '10%',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            Ward
                                            <IconButton size="small" sx={{ color: 'white' }}>
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '10%',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            Status
                                            <IconButton size="small" sx={{ color: 'white' }}>
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '10%',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        Type
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '10%', 
                                        textAlign: 'right',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        % Comple...
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '10%', 
                                        textAlign: 'right',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        Absorption ...
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '15%', 
                                        textAlign: 'right',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        FY Target (ADP)
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '10%', 
                                        textAlign: 'right',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        FY Actual
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
                                                    Dept.: {row.department} ({row.projectCount})
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {row.ward || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {row.status || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                Count: {row.projectCount}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {formatPercentage(row.completionPercentage)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {formatPercentage(row.absorptionPercentage)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {formatNumber(row.fyTargetAdp)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {formatNumber(row.fyActual)}
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
                                    <TableCell colSpan={3}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            TOTAL
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            Count: {totals.count}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {formatPercentage(totals.averageCompletion)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            Absorbed: {formatPercentage(totals.absorptionPercentage)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {formatNumber(totals.fyTargetAdp)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'right' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {totals.fyActual.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
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

export default PerformanceManagementReport;
















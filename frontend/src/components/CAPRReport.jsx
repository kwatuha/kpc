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
    Collapse,
    TableSortLabel
} from '@mui/material';
import {
    PictureAsPdf as PdfIcon,
    TableChart as ExcelIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    PlayArrow as PlayIcon,
    MoreVert as MoreVertIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    ArrowUpward as ArrowUpwardIcon
} from '@mui/icons-material';
import apiService from '../api';
import { formatCurrency } from '../utils/helpers';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const CAPRReport = () => {
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reportData, setReportData] = useState([]);
    const [groupedData, setGroupedData] = useState({});
    const [expandedGroups, setExpandedGroups] = useState({});
    const [filters, setFilters] = useState({
        subCounty: 'asc',
        status: 'asc'
    });
    const [exportingPDF, setExportingPDF] = useState(false);
    const [exportingExcel, setExportingExcel] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiService.reports.getCAPRReport();
                setReportData(response.data || []);
                
                // Group data by SubCounty and Status
                const grouped = groupDataBySubCountyAndStatus(response.data || []);
                setGroupedData(grouped);
                
                // Initialize expanded state for all groups
                const expanded = {};
                Object.keys(grouped).forEach(subCounty => {
                    expanded[subCounty] = {};
                    Object.keys(grouped[subCounty]).forEach(status => {
                        expanded[subCounty][status] = true; // Start expanded
                    });
                });
                setExpandedGroups(expanded);
            } catch (err) {
                console.error('Error fetching CAPR report:', err);
                setError('Failed to load CAPR report data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const groupDataBySubCountyAndStatus = (data) => {
        const grouped = {};
        data.forEach(item => {
            const subCounty = item.subCounty || 'Unknown';
            const status = item.status || 'Unknown';
            
            if (!grouped[subCounty]) {
                grouped[subCounty] = {};
            }
            if (!grouped[subCounty][status]) {
                grouped[subCounty][status] = [];
            }
            grouped[subCounty][status].push(item);
        });
        return grouped;
    };

    const toggleGroup = (subCounty, status) => {
        setExpandedGroups(prev => ({
            ...prev,
            [subCounty]: {
                ...prev[subCounty],
                [status]: !prev[subCounty][status]
            }
        }));
    };

    const handleExportPDF = () => {
        setExportingPDF(true);
        try {
            const doc = new jsPDF('landscape', 'pt', 'a4');
            
            // Add title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('CAPR Report', 40, 40);
            
            // Add subtitle
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('County Annual Performance Report - Preventive Programme Analysis', 40, 60);
            
            // Add generation date
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 80);
            
            // Prepare table data
            const headers = [
                'Programme',
                'Objectives',
                'CIDP Outcome',
                'CIDP KPI',
                'CIDP Targets',
                'Y5 Target',
                'Output KPI',
                'ADP/FY',
                'FY Baseline'
            ];
            
            const data = [];
            Object.keys(groupedData).forEach(subCounty => {
                Object.keys(groupedData[subCounty]).forEach(status => {
                    const items = groupedData[subCounty][status];
                    items.forEach(item => {
                        data.push([
                            item.programme,
                            item.objectives,
                            item.cidpOutcome,
                            item.cidpKpi,
                            item.cidpTargets,
                            item.y5Target,
                            item.outputKpi,
                            item.adpFy,
                            item.fyBaseline
                        ]);
                    });
                });
            });
            
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
                margin: { top: 100, left: 40, right: 40 }
            });
            
            // Save the PDF
            doc.save(`capr-report-${new Date().toISOString().split('T')[0]}.pdf`);
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
            const excelData = [];
            Object.keys(groupedData).forEach(subCounty => {
                Object.keys(groupedData[subCounty]).forEach(status => {
                    const items = groupedData[subCounty][status];
                    items.forEach(item => {
                        excelData.push({
                            'SubCounty': subCounty,
                            'Status': status,
                            'Programme': item.programme,
                            'Objectives': item.objectives,
                            'CIDP Outcome': item.cidpOutcome,
                            'CIDP KPI': item.cidpKpi,
                            'CIDP Targets': item.cidpTargets,
                            'Y5 Target': item.y5Target,
                            'Output KPI': item.outputKpi,
                            'ADP/FY': item.adpFy,
                            'FY Baseline': item.fyBaseline
                        });
                    });
                });
            });
            
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            
            // Set column widths
            const columnWidths = [
                { wch: 20 }, // SubCounty
                { wch: 15 }, // Status
                { wch: 25 }, // Programme
                { wch: 40 }, // Objectives
                { wch: 20 }, // CIDP Outcome
                { wch: 20 }, // CIDP KPI
                { wch: 30 }, // CIDP Targets
                { wch: 12 }, // Y5 Target
                { wch: 20 }, // Output KPI
                { wch: 15 }, // ADP/FY
                { wch: 12 }  // FY Baseline
            ];
            worksheet['!cols'] = columnWidths;
            
            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'CAPR Report');
            
            // Save the Excel file
            XLSX.writeFile(workbook, `capr-report-${new Date().toISOString().split('T')[0]}.xlsx`);
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
                const response = await apiService.reports.getCAPRReport();
                setReportData(response.data || []);
                
                const grouped = groupDataBySubCountyAndStatus(response.data || []);
                setGroupedData(grouped);
                
                const expanded = {};
                Object.keys(grouped).forEach(subCounty => {
                    expanded[subCounty] = {};
                    Object.keys(grouped[subCounty]).forEach(status => {
                        expanded[subCounty][status] = true;
                    });
                });
                setExpandedGroups(expanded);
            } catch (err) {
                console.error('Error fetching CAPR report:', err);
                setError('Failed to load CAPR report data. Please try again.');
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
                        CAPR Report
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
                        County Annual Performance Report - Preventive Programme Analysis
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
                                        width: '15%',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            Programme
                                            <ArrowUpwardIcon sx={{ color: 'white', fontSize: '1rem' }} />
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '20%',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            Objectives
                                            <IconButton size="small" sx={{ color: 'white' }}>
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '12%',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            CIDP Outc...
                                            <IconButton size="small" sx={{ color: 'white' }}>
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ 
                                        width: '12%',
                                        backgroundColor: '#1976d2',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 2
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            CIDP KPI
                                            <IconButton size="small" sx={{ color: 'white' }}>
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
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
                                            CIDP Targets
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            Y5 Target ...
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
                                            Output KPI
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            ADP/FY
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
                                            FY Baseline
                                            <IconButton size="small" sx={{ color: 'white' }}>
                                                <MoreVertIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(groupedData).map((subCounty) => (
                                    <React.Fragment key={subCounty}>
                                        {/* SubCounty Group Header */}
                                        <TableRow sx={{ 
                                            backgroundColor: '#e3f2fd',
                                            '& .MuiTableCell-root': {
                                                fontWeight: 'bold',
                                                borderBottom: '2px solid #1976d2',
                                                padding: '12px 8px',
                                                fontSize: '0.875rem'
                                            }
                                        }}>
                                            <TableCell colSpan={9}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => {
                                                            const statusKeys = Object.keys(groupedData[subCounty]);
                                                            statusKeys.forEach(status => {
                                                                toggleGroup(subCounty, status);
                                                            });
                                                        }}
                                                    >
                                                        {Object.values(expandedGroups[subCounty] || {}).some(expanded => expanded) ? 
                                                            <ExpandLessIcon /> : <ExpandMoreIcon />
                                                        }
                                                    </IconButton>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                        ▲ SubCounty: {subCounty} ({Object.values(groupedData[subCounty]).reduce((sum, arr) => sum + arr.length, 0)})
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                        
                                        {Object.keys(groupedData[subCounty]).map((status) => (
                                            <React.Fragment key={`${subCounty}-${status}`}>
                                                {/* Status Group Header */}
                                                <TableRow sx={{ 
                                                    backgroundColor: '#f5f5f5',
                                                    '& .MuiTableCell-root': {
                                                        fontWeight: 'bold',
                                                        borderBottom: '1px solid #e0e0e0',
                                                        padding: '12px 8px',
                                                        fontSize: '0.875rem'
                                                    }
                                                }}>
                                                    <TableCell colSpan={9}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <IconButton 
                                                                size="small" 
                                                                onClick={() => toggleGroup(subCounty, status)}
                                                            >
                                                                {expandedGroups[subCounty]?.[status] ? 
                                                                    <ExpandLessIcon /> : <ExpandMoreIcon />
                                                                }
                                                            </IconButton>
                                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                                ▲ Status: {status} ({groupedData[subCounty][status].length})
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                                
                                                {/* Data Rows */}
                                                <Collapse in={expandedGroups[subCounty]?.[status] || false} timeout="auto" unmountOnExit>
                                                    {groupedData[subCounty][status].map((item, index) => (
                                                        <TableRow 
                                                            key={`${subCounty}-${status}-${index}`}
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
                                                                        {item.programme}
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                                                    {item.objectives}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {item.cidpOutcome}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {item.cidpKpi}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {item.cidpTargets}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {item.y5Target}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {item.outputKpi}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {item.adpFy}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Typography variant="body2">
                                                                    {item.fyBaseline}
                                                                </Typography>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </Collapse>
                                            </React.Fragment>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </Slide>
        </Box>
    );
};

export default CAPRReport;
















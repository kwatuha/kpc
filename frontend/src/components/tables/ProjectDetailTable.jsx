import React, { useState, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
    TablePagination,
    Chip,
    Box,
    Typography,
    IconButton,
    Tooltip,
    Collapse,
    TableFooter,
    LinearProgress,
    Fade
} from '@mui/material';
import {
    ExpandMore,
    ExpandLess,
    TrendingUp,
    TrendingDown,
    Warning,
    CheckCircle,
    Schedule,
    AttachMoney,
    Business
} from '@mui/icons-material';
import { getProjectStatusBackgroundColor } from '../../utils/projectStatusColors';

const ProjectDetailTable = ({ 
    data, 
    columns, 
    title, 
    onRowClick,
    showDepartmentGrouping = false,
    exportable = true 
}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('');
    const [order, setOrder] = useState('asc');
    const [expandedRows, setExpandedRows] = useState({});

    // Handle sorting
    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Handle pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Handle row expansion
    const handleExpandRow = (rowId) => {
        setExpandedRows(prev => ({
            ...prev,
            [rowId]: !prev[rowId]
        }));
    };

    // Sort data
    const sortedData = useMemo(() => {
        if (!orderBy) return data;
        
        return [...data].sort((a, b) => {
            let aValue = a[orderBy];
            let bValue = b[orderBy];
            
            // Handle numeric values
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return order === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            // Handle string values
            aValue = String(aValue || '').toLowerCase();
            bValue = String(bValue || '').toLowerCase();
            
            if (aValue < bValue) return order === 'asc' ? -1 : 1;
            if (aValue > bValue) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, orderBy, order]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const start = page * rowsPerPage;
        return sortedData.slice(start, start + rowsPerPage);
    }, [sortedData, page, rowsPerPage]);

    // Render status chip
    const renderStatusChip = (status) => (
        <Chip
            label={status}
            size="small"
            sx={{
                backgroundColor: getProjectStatusBackgroundColor(status),
                color: 'white',
                fontWeight: 600,
                fontSize: '0.6875rem',
                height: '20px',
                '& .MuiChip-label': {
                    px: 1,
                    py: 0
                }
            }}
        />
    );

    // Render progress bar
    const renderProgressBar = (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: '90px' }}>
            <LinearProgress
                variant="determinate"
                value={value}
                sx={{
                    flexGrow: 1,
                    height: 5,
                    borderRadius: 2.5,
                    backgroundColor: 'rgba(0,0,0,0.08)',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: value >= 80 ? '#4caf50' : value >= 50 ? '#ff9800' : '#f44336',
                        borderRadius: 2.5
                    }
                }}
            />
            <Typography variant="caption" sx={{ fontWeight: 600, minWidth: '32px', fontSize: '0.6875rem' }}>
                {typeof value === 'number' ? value.toFixed(2) : value}%
            </Typography>
        </Box>
    );

    // Render currency
    const renderCurrency = (amount) => {
        const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        if (numAmount >= 1000000) {
            return (
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.primary' }}>
                    KSh {(numAmount / 1000000).toFixed(1)}M
                </Typography>
            );
        } else if (numAmount >= 1000) {
            return (
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.primary' }}>
                    KSh {(numAmount / 1000).toFixed(0)}K
                </Typography>
            );
        } else {
            return (
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.primary' }}>
                    KSh {numAmount?.toLocaleString() || '0'}
                </Typography>
            );
        }
    };

    // Render cell content based on column type
    const renderCellContent = (row, column) => {
        const value = row[column.id];
        
        // Use custom format function if provided
        if (column.format && typeof column.format === 'function') {
            return column.format(value);
        }
        
        switch (column.type) {
            case 'status':
                return renderStatusChip(value);
            case 'progress':
                return renderProgressBar(value);
            case 'currency':
                return renderCurrency(value);
            case 'risk':
                const riskValue = String(value || '').toLowerCase();
                const riskColor = riskValue === 'high' ? '#f44336' : riskValue === 'medium' ? '#ff9800' : '#4caf50';
                return (
                    <Chip
                        label={value || 'Low'}
                        size="small"
                        sx={{
                            backgroundColor: riskColor,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            height: '20px',
                            '& .MuiChip-label': {
                                px: 1,
                                py: 0
                            }
                        }}
                    />
                );
            case 'number':
                return (
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8125rem', color: 'text.primary' }}>
                        {value?.toLocaleString() || '0'}
                    </Typography>
                );
            default:
                return (
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                        {value || '-'}
                    </Typography>
                );
        }
    };

    return (
        <Fade in timeout={800}>
            <Paper sx={{ 
                width: '100%', 
                overflow: 'hidden',
                borderRadius: '8px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}>
                {/* Table Header */}
                <Box sx={{ 
                    p: 1.25, 
                    borderBottom: '2px solid rgba(25, 118, 210, 0.15)',
                    background: 'linear-gradient(90deg, rgba(25, 118, 210, 0.05) 0%, rgba(255,255,255,0.95) 100%)'
                }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9375rem', mb: 0.25 }}>
                        {title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {data.length} {data.length === 1 ? 'record' : 'records'}
                    </Typography>
                </Box>

                <TableContainer sx={{ maxHeight: 450 }}>
                    <Table stickyHeader size="small" sx={{ '& .MuiTableCell-root': { py: 0.5 } }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'rgba(25, 118, 210, 0.08)' }}>
                                {showDepartmentGrouping && (
                                    <TableCell sx={{ 
                                        fontWeight: 700, 
                                        minWidth: '40px',
                                        py: 0.75,
                                        fontSize: '0.75rem',
                                        backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                    }}>
                                        Expand
                                    </TableCell>
                                )}
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        sx={{ 
                                            fontWeight: 700,
                                            minWidth: column.minWidth || '100px',
                                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                            py: 0.75,
                                            fontSize: '0.75rem',
                                            color: 'text.primary',
                                            borderBottom: '2px solid rgba(25, 118, 210, 0.2)'
                                        }}
                                    >
                                        <TableSortLabel
                                            active={orderBy === column.id}
                                            direction={orderBy === column.id ? order : 'asc'}
                                            onClick={() => handleSort(column.id)}
                                            sx={{ 
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                                '& .MuiTableSortLabel-icon': {
                                                    fontSize: '0.875rem'
                                                }
                                            }}
                                        >
                                            {column.label}
                                        </TableSortLabel>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedData.map((row, index) => (
                                <React.Fragment key={row.id || index}>
                                    <TableRow 
                                        hover
                                        onClick={() => onRowClick?.(row)}
                                        sx={{ 
                                            cursor: onRowClick ? 'pointer' : 'default',
                                            py: 0.5,
                                            '&:hover': {
                                                backgroundColor: 'rgba(25, 118, 210, 0.06)',
                                                transform: 'scale(1.001)',
                                                transition: 'all 0.2s ease'
                                            },
                                            '&:nth-of-type(even)': {
                                                backgroundColor: 'rgba(0,0,0,0.02)'
                                            },
                                            '&:nth-of-type(even):hover': {
                                                backgroundColor: 'rgba(25, 118, 210, 0.08)'
                                            }
                                        }}
                                    >
                                        {showDepartmentGrouping && (
                                            <TableCell sx={{ py: 0.5 }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleExpandRow(row.id);
                                                    }}
                                                    sx={{ 
                                                        p: 0.5,
                                                        '& .MuiSvgIcon-root': { fontSize: '1rem' }
                                                    }}
                                                >
                                                    {expandedRows[row.id] ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </TableCell>
                                        )}
                                        {columns.map((column) => (
                                            <TableCell 
                                                key={column.id}
                                                sx={{ 
                                                    py: 0.75,
                                                    fontSize: '0.8125rem',
                                                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                                                }}
                                            >
                                                {renderCellContent(row, column)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    
                                    {/* Expandable row content for department grouping */}
                                    {showDepartmentGrouping && expandedRows[row.id] && (
                                        <TableRow>
                                            <TableCell colSpan={columns.length + 1} sx={{ py: 0 }}>
                                                <Collapse in={expandedRows[row.id]} timeout="auto" unmountOnExit>
                                                    <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                                            Projects in {row.department}
                                                        </Typography>
                                                        {/* Render sub-projects here */}
                                                        <Typography variant="body2" color="text.secondary">
                                                            Individual project details would be displayed here
                                                        </Typography>
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        borderTop: '1px solid rgba(0,0,0,0.08)',
                        backgroundColor: 'rgba(0,0,0,0.02)',
                        minHeight: '48px',
                        '& .MuiTablePagination-toolbar': {
                            minHeight: '48px',
                            paddingLeft: 1.5,
                            paddingRight: 1.5
                        },
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontSize: '0.75rem',
                            margin: 0
                        },
                        '& .MuiTablePagination-select': {
                            fontSize: '0.75rem',
                            paddingTop: 0.5,
                            paddingBottom: 0.5
                        },
                        '& .MuiIconButton-root': {
                            padding: 0.5,
                            '& .MuiSvgIcon-root': {
                                fontSize: '1.125rem'
                            }
                        }
                    }}
                />
            </Paper>
        </Fade>
    );
};

export default ProjectDetailTable;

import React, { useState, useEffect, useMemo } from 'react';
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
    Button,
    IconButton,
    Tooltip,
    Stack
} from '@mui/material';
import { tokens } from '../pages/dashboard/theme';
import { TrendingUp, Assessment, PieChart, BarChart, Timeline, Business, AttachMoney, CheckCircle, Warning, Speed, TrendingDown, Schedule, FilterList, ShowChart, Analytics, GetApp, PictureAsPdf, Print, Refresh, FileDownload, TaskAlt, Percent } from '@mui/icons-material';

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
import ProjectDetailTable from './tables/ProjectDetailTable';
import DepartmentProjectsModal from './modals/DepartmentProjectsModal';
import YearProjectsModal from './modals/YearProjectsModal';
import { 
    overviewTableColumns, 
    financialTableColumns, 
    analyticsTableColumns,
    transformOverviewData,
    transformFinancialData,
    transformAnalyticsData
} from './tables/TableConfigs';

// Import jsPDF and autoTable for PDF export
// Note: jspdf-autotable must be imported as side effect to extend jsPDF prototype
import 'jspdf-autotable';
import jsPDF from 'jspdf';

const ReportingView = () => {
    const theme = useTheme();

    const [dashboardData, setDashboardData] = useState({
        projectStatus: [],
        projectProgress: [],
        projectTypes: [],
        budgetAllocation: [],
        statusDistribution: []
    });
    const [trendsData, setTrendsData] = useState({
        projectPerformance: [],
        financialTrends: [],
        departmentTrends: [],
        statusTrends: [],
        yearRange: { start: 0, end: 0, years: [] }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        department: '',
        status: '',
        projectType: '',
        year: '',
        cidpPeriod: '',
        financialYear: '',
        startDate: '',
        endDate: '',
        projectStatus: '',
        section: '',
        subCounty: '',
        ward: '',
        globalSearch: ''
    });
    const [activeTab, setActiveTab] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [yearModalOpen, setYearModalOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    // Helper function to clean filters - remove empty strings, null, and undefined values
    const cleanFilters = (filters) => {
        const cleaned = {};
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            // Only include non-empty values
            if (value !== '' && value !== null && value !== undefined) {
                cleaned[key] = value;
            }
        });
        return cleaned;
    };

    // API Integration Functions
    const fetchProjectStatusData = async (filters) => {
        try {
            // Clean filters and pass to the API call to ensure KPI cards reflect filtered data
            const cleanedFilters = cleanFilters(filters);
            const response = await projectService.analytics.getProjectStatusCounts(cleanedFilters);
            console.log('ReportingView - Raw status data from API:', response);
            // Group statuses by normalized categories
            const grouped = groupStatusesByNormalized(response, 'status', 'count');
            console.log('ReportingView - Normalized grouped status data:', grouped);
            const result = grouped.map(item => ({
                name: item.name,
                value: item.value,
                color: getProjectStatusBackgroundColor(item.name)
            }));
            console.log('ReportingView - Final status data for chart:', result);
            return result;
        } catch (error) {
            console.error('Error fetching project status data:', error);
            return [];
        }
    };

    const fetchProjectTypesData = async (filters) => {
        try {
            // Clean filters and pass to the API call to ensure KPI cards reflect filtered data
            const cleanedFilters = cleanFilters(filters);
            const response = await projectService.analytics.getProjectsByDirectorateCounts(cleanedFilters);
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
            const cleanedFilters = cleanFilters(filters);
            const response = await reportsService.getFinancialStatusByProjectStatus(cleanedFilters);
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
    };

    const fetchProjectProgressData = async (filters) => {
        try {
            // Check if filtering by a normalized status
            const normalizedStatuses = ['Completed', 'Ongoing', 'Not started', 'Stalled', 'Under Procurement', 'Suspended', 'Other'];
            const statusFilter = filters.projectStatus || filters.status;
            const isNormalizedStatus = statusFilter && normalizedStatuses.includes(statusFilter);
            
            if (isNormalizedStatus) {
                // First, get all original statuses from the database (without any filters to get raw statuses)
                const allStatusesResponse = await reportsService.getProjectStatusSummary({});
                const allOriginalStatuses = allStatusesResponse.map(item => item.name);
                
                console.log('ReportingView - All original statuses from database:', allOriginalStatuses);
                
                // Find which original statuses normalize to the selected normalized status
                const matchingOriginalStatuses = allOriginalStatuses.filter(originalStatus => {
                    if (!originalStatus) return false;
                    const normalized = normalizeProjectStatus(originalStatus);
                    const matches = normalized === statusFilter;
                    if (matches) {
                        console.log(`ReportingView - Status "${originalStatus}" normalizes to "${normalized}" (matches filter: ${statusFilter})`);
                    } else {
                        console.log(`ReportingView - Status "${originalStatus}" normalizes to "${normalized}" (does NOT match filter: ${statusFilter})`);
                    }
                    return matches;
                });
                
                console.log(`ReportingView - Normalized status "${statusFilter}" maps to original statuses:`, matchingOriginalStatuses);
                
                if (matchingOriginalStatuses.length === 0) {
                    // No matching original statuses found, try using the normalized status directly as fallback
                    console.warn(`ReportingView - No original statuses found that normalize to "${statusFilter}", trying direct filter as fallback`);
                    try {
                        const fallbackFilters = { ...filters };
                        fallbackFilters.status = statusFilter;
                        delete fallbackFilters.projectStatus;
                        const cleanedFallbackFilters = cleanFilters(fallbackFilters);
                        const fallbackResponse = await reportsService.getDepartmentSummaryReport(cleanedFallbackFilters);
                        console.log(`ReportingView - Fallback direct filter returned ${fallbackResponse.length} departments`);
                        return fallbackResponse.map(dept => ({
                            department: dept.departmentAlias || dept.departmentName,
                            departmentName: dept.departmentName,
                            departmentAlias: dept.departmentAlias,
                            percentCompleted: dept.percentCompleted || 0,
                            percentBudgetContracted: dept.percentBudgetContracted || 0,
                            percentContractSumPaid: dept.percentContractSumPaid || 0,
                            percentAbsorptionRate: dept.percentAbsorptionRate || 0,
                            allocatedBudget: dept.allocatedBudget || 0,
                            contractSum: dept.contractSum || 0,
                            amountPaid: dept.amountPaid || 0,
                            numProjects: dept.numProjects || 0
                        }));
                    } catch (fallbackError) {
                        console.error(`ReportingView - Fallback filter also failed:`, fallbackError);
                        return [];
                    }
                }
                
                // Fetch data for each original status and combine results
                const allDepartmentData = [];
                const departmentMap = new Map(); // Use Map to aggregate by department
                
                for (const originalStatus of matchingOriginalStatuses) {
                    // Create new filters object without the normalized status, and use the original status
                    const statusFilters = { ...filters };
                    // Remove normalized status filters
                    delete statusFilters.projectStatus;
                    delete statusFilters.status;
                    // Add the original status for this API call
                    statusFilters.status = originalStatus;
                    
                    try {
                        const cleanedStatusFilters = cleanFilters(statusFilters);
                        const response = await reportsService.getDepartmentSummaryReport(cleanedStatusFilters);
                        
                        // Aggregate data by department
                        response.forEach(dept => {
                            const deptKey = dept.departmentAlias || dept.departmentName;
                            if (!departmentMap.has(deptKey)) {
                                departmentMap.set(deptKey, {
                                    department: dept.departmentAlias || dept.departmentName,
                                    departmentName: dept.departmentName,
                                    departmentAlias: dept.departmentAlias,
                                    percentCompleted: 0,
                                    percentBudgetContracted: 0,
                                    percentContractSumPaid: 0,
                                    percentAbsorptionRate: 0,
                                    allocatedBudget: 0,
                                    contractSum: 0,
                                    amountPaid: 0,
                                    numProjects: 0
                                });
                            }
                            
                            const existing = departmentMap.get(deptKey);
                            existing.numProjects += dept.numProjects || 0;
                            existing.allocatedBudget += parseFloat(dept.allocatedBudget) || 0;
                            existing.contractSum += parseFloat(dept.contractSum) || 0;
                            existing.amountPaid += parseFloat(dept.amountPaid) || 0;
                            
                            // Recalculate percentages based on aggregated values
                            if (existing.numProjects > 0) {
                                // Note: percentCompleted calculation would need project-level data
                                // For now, we'll use weighted average or keep the latest value
                                existing.percentCompleted = dept.percentCompleted || 0;
                            }
                            if (existing.contractSum > 0) {
                                existing.percentContractSumPaid = (existing.amountPaid / existing.contractSum) * 100;
                                existing.percentAbsorptionRate = (existing.amountPaid / existing.contractSum) * 100;
                            }
                            existing.percentBudgetContracted = dept.percentBudgetContracted || 100.0;
                        });
                    } catch (error) {
                        console.error(`Error fetching data for status "${originalStatus}":`, error);
                        // Continue with other statuses even if one fails
                    }
                }
                
                // Convert Map to array
                return Array.from(departmentMap.values());
            } else {
                // Not a normalized status, use normal filtering
                const cleanedFilters = cleanFilters(filters);
                const response = await reportsService.getDepartmentSummaryReport(cleanedFilters);
                return response.map(dept => ({
                    department: dept.departmentAlias || dept.departmentName,
                    departmentName: dept.departmentName,
                    departmentAlias: dept.departmentAlias,
                    percentCompleted: dept.percentCompleted || 0,
                    percentBudgetContracted: dept.percentBudgetContracted || 0,
                    percentContractSumPaid: dept.percentContractSumPaid || 0,
                    percentAbsorptionRate: dept.percentAbsorptionRate || 0,
                    allocatedBudget: dept.allocatedBudget || 0,
                    contractSum: dept.contractSum || 0,
                    amountPaid: dept.amountPaid || 0,
                    numProjects: dept.numProjects || 0
                }));
            }
        } catch (error) {
            console.error('Error fetching project progress data:', error);
            return [];
        }
    };

    // Calculate financial summary metrics from department data
    const calculateFinancialSummary = (departmentData, totalProjectsCount) => {
        // If there are no projects, return zeros for all financial metrics
        if (!departmentData || departmentData.length === 0 || totalProjectsCount === 0) {
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
            const cleanedFilters = cleanFilters(filters);
            const response = await reportsService.getProjectStatusSummary(cleanedFilters);
            // Group statuses by normalized categories
            const grouped = groupStatusesByNormalized(response, 'name', 'value');
            return grouped.map(item => ({
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
            let filteredProjectStatus = filters.projectStatus || filters.status
                ? projectStatusData.filter(item => {
                    if (filters.projectStatus) return item.name === filters.projectStatus;
                    if (filters.status) return item.name === filters.status;
                    return true;
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
            
            // Apply global search filter if provided
            // Check if search term matches any normalized status
            const normalizedStatuses = ['Completed', 'Ongoing', 'Not started', 'Stalled', 'Under Procurement', 'Suspended', 'Other'];
            let detectedStatus = null;
            if (filters.globalSearch && !filters.projectStatus && !filters.status) {
                // Only detect status from global search if no explicit status filter is set
                const searchTerm = filters.globalSearch.toLowerCase().trim();
                
                // Check if search term matches any normalized status (case-insensitive)
                for (const status of normalizedStatuses) {
                    if (status.toLowerCase() === searchTerm || 
                        status.toLowerCase().includes(searchTerm) ||
                        searchTerm.includes(status.toLowerCase())) {
                        detectedStatus = status;
                        break;
                    }
                }
            }
            
            // Apply global search to department data
            if (filters.globalSearch) {
                const searchTerm = filters.globalSearch.toLowerCase().trim();
                filteredProjectProgress = filteredProjectProgress.filter(item => {
                    const departmentMatch = (item.department || '').toLowerCase().includes(searchTerm) ||
                                          (item.departmentName || '').toLowerCase().includes(searchTerm) ||
                                          (item.departmentAlias || '').toLowerCase().includes(searchTerm);
                    const projectCountMatch = (item.numProjects || 0).toString().includes(searchTerm);
                    return departmentMatch || projectCountMatch;
                });
            }
            
            console.log('ReportingView - Department filter debug:', {
                filterValue: filters.department,
                globalSearch: filters.globalSearch,
                detectedStatus: detectedStatus,
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
            
            // Apply status filter (explicit filter takes precedence over global search detected status)
            const statusFilterValue = filters.projectStatus || filters.status || detectedStatus;
            let filteredBudgetAllocation = statusFilterValue
                ? budgetAllocationData.filter(item => item.name === statusFilterValue)
                : budgetAllocationData;
            
            let filteredStatusDistribution = statusFilterValue
                ? statusDistributionData.filter(item => item.name === statusFilterValue)
                : statusDistributionData;
            
            // Apply status filter to project status data (explicit filter takes precedence)
            if (statusFilterValue) {
                filteredProjectStatus = filteredProjectStatus.filter(item => item.name === statusFilterValue);
            }

            // Ensure all data has correct colors and verify normalization
            filteredProjectStatus = filteredProjectStatus.map(item => {
                // Double-check that status is normalized (should only be one of the 7 categories)
                const validStatuses = ['Completed', 'Ongoing', 'Not started', 'Stalled', 'Under Procurement', 'Suspended', 'Other'];
                const isNormalized = validStatuses.includes(item.name);
                if (!isNormalized) {
                    console.warn(`ReportingView - Status "${item.name}" is not normalized! Normalizing now...`);
                    const normalized = normalizeProjectStatus(item.name);
                    console.log(`ReportingView - Normalized "${item.name}" to "${normalized}"`);
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
            console.log('ReportingView - Final verified normalized status data:', filteredProjectStatus);

            // Ensure budget allocation data is normalized and has correct colors
            filteredBudgetAllocation = filteredBudgetAllocation.map(item => {
                // Double-check that status is normalized (should only be one of the 7 categories)
                const validStatuses = ['Completed', 'Ongoing', 'Not started', 'Stalled', 'Under Procurement', 'Suspended', 'Other'];
                const isNormalized = validStatuses.includes(item.name);
                if (!isNormalized) {
                    console.warn(`ReportingView - Budget allocation status "${item.name}" is not normalized! Normalizing now...`);
                    const normalized = normalizeProjectStatus(item.name);
                    console.log(`ReportingView - Normalized "${item.name}" to "${normalized}"`);
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
            console.log('ReportingView - Final verified normalized budget allocation data:', filteredBudgetAllocation);

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
        loadTrendsData();
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

    const handleClearFilters = () => {
        setFilters({
            department: '',
            status: '',
            projectType: '',
            year: '',
            cidpPeriod: '',
            financialYear: '',
            startDate: '',
            endDate: '',
            projectStatus: '',
            section: '',
            subCounty: '',
            ward: '',
            globalSearch: ''
        });
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleDepartmentClick = (departmentData) => {
        setSelectedDepartment(departmentData);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedDepartment(null);
    };

    const handleYearClick = (yearData) => {
        setSelectedYear(yearData);
        setYearModalOpen(true);
    };

    const handleCloseYearModal = () => {
        setYearModalOpen(false);
        setSelectedYear(null);
    };

    // Export functions
    const getCurrentTableData = () => {
        if (activeTab === 0) {
            return transformOverviewData(dashboardData.projectProgress.map(dept => ({ 
                id: dept.departmentId || dept.department,
                department: dept.departmentName || dept.department,
                departmentAlias: dept.departmentAlias || dept.department,
                percentCompleted: Math.round((parseFloat(dept.percentCompleted) || 0) * 100) / 100,
                healthScore: dept.healthScore || 0,
                numProjects: dept.numProjects || 0,
                allocatedBudget: dept.allocatedBudget || 0,
                amountPaid: dept.amountPaid || 0
            })));
        } else if (activeTab === 1) {
            return dashboardData.projectProgress.map((dept, index) => ({ 
                id: dept.departmentId || dept.department || `dept-${index}`,
                rowNumber: index + 1,
                department: dept.departmentName || dept.department,
                departmentAlias: dept.departmentAlias || dept.department,
                allocatedBudget: parseFloat(dept.allocatedBudget) || 0,
                contractSum: parseFloat(dept.contractSum) || 0,
                amountPaid: parseFloat(dept.amountPaid) || 0,
                absorptionRate: Math.round((parseFloat(dept.percentAbsorptionRate) || 0) * 100) / 100,
                remainingBudget: (parseFloat(dept.allocatedBudget) || 0) - (parseFloat(dept.amountPaid) || 0)
            }));
        } else if (activeTab === 2) {
            return transformAnalyticsData(dashboardData.projectProgress);
        } else if (activeTab === 3) {
            return trendsData.projectPerformance.map((year, index) => ({
                id: year.year,
                rowNumber: index + 1,
                year: year.year,
                totalProjects: year.totalProjects,
                completedProjects: year.completedProjects,
                completionRate: year.completionRate + '%',
                avgDuration: Math.round(year.avgDuration) + ' days',
                growthRate: year.growthRate + '%',
                totalBudget: 'KSh ' + (trendsData.financialTrends[index]?.totalBudget ? 
                    (parseFloat(trendsData.financialTrends[index].totalBudget) / 1000000).toFixed(1) + 'M' : '0M'),
                absorptionRate: trendsData.financialTrends[index]?.absorptionRate ? 
                    parseFloat(trendsData.financialTrends[index].absorptionRate).toFixed(1) + '%' : '0%'
            }));
        }
        return [];
    };

    const getCurrentTableColumns = () => {
        if (activeTab === 0) return overviewTableColumns;
        if (activeTab === 1) return financialTableColumns;
        if (activeTab === 2) return analyticsTableColumns;
        if (activeTab === 3) return [
            { id: 'rowNumber', label: '#' },
            { id: 'year', label: 'Year' },
            { id: 'totalProjects', label: 'Total Projects' },
            { id: 'completedProjects', label: 'Completed' },
            { id: 'completionRate', label: 'Completion Rate' },
            { id: 'avgDuration', label: 'Avg Duration' },
            { id: 'growthRate', label: 'Growth Rate' },
            { id: 'totalBudget', label: 'Total Budget' },
            { id: 'absorptionRate', label: 'Absorption Rate' }
        ];
        return [];
    };

    const handleExportExcel = async () => {
        try {
            const data = getCurrentTableData();
            const columns = getCurrentTableColumns();
            
            if (data.length === 0) {
                alert('No data to export');
                return;
            }

            const dataToExport = data.map(item => {
                const row = {};
                columns.forEach(col => {
                    row[col.label] = item[col.id] !== undefined ? item[col.id] : '';
                });
                return row;
            });

            // Dynamic import for xlsx
            const XLSX = await import('xlsx');
            // Create workbook and worksheet
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
            
            // Generate filename based on active tab
            const tabNames = ['Overview', 'Financial', 'Analytics', 'Yearly Trends'];
            const filename = `Project_Dashboard_${tabNames[activeTab]}_${new Date().toISOString().split('T')[0]}.xlsx`;
            
            XLSX.writeFile(workbook, filename);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Failed to export to Excel. Please try again.');
        }
    };

    const handleExportPDF = () => {
        try {
            const data = getCurrentTableData();
            const columns = getCurrentTableColumns();
            
            if (data.length === 0) {
                alert('No data to export');
                return;
            }

            const doc = new jsPDF();
            const headers = columns.map(col => col.label);
            const tableData = data.map(item => 
                columns.map(col => {
                    const value = item[col.id];
                    return value !== undefined && value !== null ? String(value) : '';
                })
            );

            // Check if autoTable is available
            if (typeof doc.autoTable !== 'function') {
                throw new Error('autoTable plugin failed to load. Please ensure jspdf-autotable is installed.');
            }

            doc.autoTable({
                head: [headers],
                body: tableData,
                styles: { fontSize: 8, cellPadding: 3 },
                headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' }
            });

            const tabNames = ['Overview', 'Financial', 'Analytics', 'Yearly Trends'];
            const filename = `Project_Dashboard_${tabNames[activeTab]}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            alert('Failed to export to PDF. Please try again.');
        }
    };

    const handlePrint = () => {
        window.print();
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
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.05), rgba(66, 165, 245, 0.05))',
                transform: 'translate(-50%, -50%)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                    '0%, 100%': { opacity: 0.3, transform: 'translate(-50%, -50%) scale(1)' },
                    '50%': { opacity: 0.1, transform: 'translate(-50%, -50%) scale(1.2)' }
                }
            }
        }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary', position: 'relative', zIndex: 1 }}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7, position: 'relative', zIndex: 1 }}>
                No data available for the selected filters.
            </Typography>
        </Box>
    );

    // Enhanced KPI Cards Component - More Compact and Space-Efficient
    const KPICard = ({ title, value, icon, color, subtitle, progress }) => (
        <Card sx={{ 
            height: '100%',
            minHeight: '90px',
            borderRadius: '8px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: `1px solid ${color}20`,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
                boxShadow: `0 6px 24px ${color}25`,
                border: `1px solid ${color}40`,
                transform: 'translateY(-3px)',
                '& .kpi-icon': {
                    transform: 'scale(1.1) rotate(5deg)'
                }
            },
            '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: `linear-gradient(90deg, ${color}, ${color}dd, ${color}aa)`,
                borderRadius: '8px 8px 0 0'
            }
        }}>
            <CardContent sx={{ p: 1.25, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ 
                            fontWeight: 600, 
                            color: 'rgba(0, 0, 0, 0.7)', 
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'block',
                            mb: 0.25
                        }}>
                            {title}
                        </Typography>
                        <Typography variant="h5" sx={{ 
                            fontWeight: 'bold', 
                            color: color, 
                            fontSize: '1.5rem', 
                            lineHeight: 1.2,
                            mb: 0
                        }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: `${color}15`,
                        color: color,
                        transition: 'all 0.25s ease',
                        flexShrink: 0,
                        ml: 1,
                        '& svg': {
                            fontSize: '1.1rem'
                        }
                    }} className="kpi-icon">
                        {icon}
                    </Box>
                </Box>
                {subtitle && (
                    <Typography variant="caption" sx={{ 
                        color: 'rgba(0, 0, 0, 0.55)', 
                        fontSize: '0.65rem', 
                        display: 'block',
                        mt: 0.25,
                        lineHeight: 1.3
                    }}>
                        {subtitle}
                    </Typography>
                )}
                {progress !== undefined && (
                    <Box sx={{ 
                        mt: 0.75, 
                        height: 4, 
                        borderRadius: 2,
                        backgroundColor: 'rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <Box sx={{ 
                            height: '100%', 
                            width: `${Math.min(progress, 100)}%`, 
                            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                            borderRadius: 2,
                            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: `0 0 8px ${color}40`
                        }} />
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    // Calculate KPIs from dashboard data
    // Calculate totalProjects from status distribution to match "Project Count Distribution by Status"
    // This ensures consistency across the dashboard
    const totalProjects = dashboardData.projectStatus.reduce((sum, item) => sum + (item.value || 0), 0);
    const completedProjects = dashboardData.projectStatus.find(item => item.name === 'Completed')?.value || 0;
    const inProgressProjects = dashboardData.projectStatus.find(item => item.name === 'Ongoing')?.value || 0;
    const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    
    // Calculate total budget from budgetAllocation, fallback to allocatedBudget from projectProgress
    let totalBudget = 0;
    if (dashboardData.budgetAllocation && Array.isArray(dashboardData.budgetAllocation) && dashboardData.budgetAllocation.length > 0) {
        totalBudget = dashboardData.budgetAllocation.reduce((sum, item) => {
            const value = parseFloat(item?.value) || 0;
            return sum + (isNaN(value) ? 0 : value);
        }, 0);
    }
    
    // Fallback to allocatedBudget from projectProgress if budgetAllocation is empty or invalid
    if (totalBudget === 0 && dashboardData.projectProgress && Array.isArray(dashboardData.projectProgress) && dashboardData.projectProgress.length > 0) {
        totalBudget = dashboardData.projectProgress.reduce((sum, dept) => {
            const value = parseFloat(dept?.allocatedBudget) || 0;
            return sum + (isNaN(value) ? 0 : value);
        }, 0);
    }
    const budgetFormatted = totalBudget >= 1000000 ? `${(totalBudget / 1000000).toFixed(1)}M` : `${(totalBudget / 1000).toFixed(0)}K`;

    // Calculate financial summary from department data - use useMemo to ensure it updates when filtered data changes
    // IMPORTANT: Use totalProjects to ensure financial metrics are zero when there are no projects
    const financialSummary = useMemo(() => {
        const summary = calculateFinancialSummary(dashboardData.projectProgress, totalProjects);
        // Debug logging to verify calculations
        console.log('Financial Summary Debug:', {
            departmentData: dashboardData.projectProgress,
            totalProjects: totalProjects,
            totalContracted: summary.totalContracted,
            totalPaid: summary.totalPaid,
            absorptionRate: summary.absorptionRate,
            filterGlobalSearch: filters.globalSearch,
            filteredDataLength: dashboardData.projectProgress?.length || 0
        });
        return summary;
    }, [dashboardData.projectProgress, totalProjects, filters.globalSearch]);
    
    const formatCurrency = (amount) => {
        const numAmount = parseFloat(amount) || 0;
        if (isNaN(numAmount) || numAmount === 0) {
            return 'KSh 0';
        }
        if (numAmount >= 1000000) {
            return `KSh ${(numAmount / 1000000).toFixed(1)}M`;
        } else if (numAmount >= 1000) {
            return `KSh ${(numAmount / 1000).toFixed(0)}K`;
        } else {
            return `KSh ${numAmount.toLocaleString()}`;
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
    const delayedProjects = 0; // Delayed projects - can be calculated from other statuses if needed
    const stalledProjects = dashboardData.projectStatus.find(item => item.name === 'Stalled')?.value || 0;
    const suspendedProjects = dashboardData.projectStatus.find(item => item.name === 'Suspended')?.value || 0;
    // Health Score: percentage of projects that are either completed or ongoing (capped at 100%)
    const healthScoreRaw = totalProjects > 0 ? Math.round(((completedProjects + inProgressProjects) / totalProjects) * 100) : 0;
    const healthScore = Math.min(healthScoreRaw, 100); // Cap at 100%

    if (isLoading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 'calc(100vh - 100px)',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Animated background elements */}
                <Box sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.1), rgba(66, 165, 245, 0.1))',
                    animation: 'float 3s ease-in-out infinite',
                    '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-20px)' }
                    }
                }} />
                <Box sx={{
                    position: 'absolute',
                    bottom: '20%',
                    right: '10%',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, rgba(76, 175, 80, 0.1), rgba(129, 199, 132, 0.1))',
                    animation: 'float 3s ease-in-out infinite 1.5s',
                    '@keyframes float': {
                        '0%, 100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-20px)' }
                    }
                }} />
                
                <CircularProgress 
                    size={60} 
                    thickness={4} 
                    sx={{ 
                        color: 'primary.main', 
                        mb: 2,
                        animation: 'pulse 2s ease-in-out infinite',
                        '@keyframes pulse': {
                            '0%, 100%': { opacity: 1 },
                            '50%': { opacity: 0.7 }
                        }
                    }} 
                />
                <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.5px',
                    mb: 1
                }}>
                    Loading dashboard...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                    Preparing your analytics
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 'calc(100vh - 100px)',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                p: 3
            }}>
                <Alert 
                    severity="error" 
                    sx={{ 
                        maxWidth: '500px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(244, 67, 54, 0.15)',
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
                        Dashboard Error
                    </Typography>
                    <Typography variant="body2">
                        {error}
                    </Typography>
                </Alert>
            </Box>
        );
    }

    return (
        // `kimes-print-page` opts this region into the global print stylesheet
        // (src/index.css) so window.print() / "Save as PDF" never leaks the
        // tree sidebar, AppBar, ribbon, etc. into the printed report.
        <Box className="kimes-print-page" sx={{ 
            p: { xs: 0.75, sm: 1 }, 
            maxWidth: '100%', 
            overflowX: 'hidden',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh'
        }}>
            {/* Header Section with Inline Filters */}
            <Fade in timeout={800}>
                <Box sx={{ 
                    mb: 1, 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between',
                    gap: 1.5,
                    flexWrap: { xs: 'wrap', md: 'nowrap' }
                }}>
                    {/* Title Section - Left */}
                    <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 auto' }, minWidth: 0 }}>
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
                                fontSize: '0.7rem',
                                mt: 0.25,
                                display: 'block'
                            }}
                        >
                            Comprehensive project analytics and insights
                        </Typography>
                    </Box>

                    {/* Filters Section - Right */}
                    <Box sx={{ 
                        flex: { xs: '1 1 100%', md: '0 0 auto' },
                        minWidth: { xs: '100%', sm: '300px', md: '400px' },
                        maxWidth: { xs: '100%', md: '600px' }
                    }}>
                        <DashboardFilters 
                            filters={filters} 
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            onRefresh={handleRefresh}
                            isLoading={isLoading}
                        />
                    </Box>
                </Box>
            </Fade>

            {/* Tabbed Dashboard Interface */}
            <Box sx={{ mt: 0 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '12px 12px 0 0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        minHeight: '40px',
                        pt: 1,
                        borderBottom: 'none',
                        position: 'relative',
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '1px',
                            background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.08) 50%, transparent 100%)'
                        },
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            minHeight: '40px',
                            py: 0.5,
                            color: 'text.secondary',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            borderRadius: '12px 12px 0 0',
                            mb: -1,
                            zIndex: 1,
                            '&:hover': {
                                color: 'primary.main',
                                backgroundColor: 'rgba(25, 118, 210, 0.06)',
                                transform: 'translateY(-2px)'
                            }
                        },
                        '& .Mui-selected': {
                            color: 'primary.main',
                            fontWeight: '700',
                            backgroundColor: 'white',
                            boxShadow: '0 -4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
                            borderTop: '2px solid',
                            borderLeft: '2px solid',
                            borderRight: '2px solid',
                            borderColor: 'rgba(0,0,0,0.06)',
                            borderBottom: 'none',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '3px',
                                background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                                borderRadius: '12px 12px 0 0'
                            },
                            '&::after': {
                                display: 'none'
                            }
                        },
                        '& .MuiTabs-indicator': {
                            display: 'none'
                        }
                    }}
                >
                    <Tab 
                        label="Overview" 
                        icon={<Assessment sx={{ fontSize: '1rem' }} />} 
                        iconPosition="start"
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.75,
                            px: 1.5,
                            '& .MuiTab-iconWrapper': {
                                marginRight: '6px !important'
                            }
                        }}
                    />
                    <Tab 
                        label="Financial" 
                        icon={<AttachMoney sx={{ fontSize: '1rem' }} />} 
                        iconPosition="start"
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.75,
                            px: 1.5,
                            '& .MuiTab-iconWrapper': {
                                marginRight: '6px !important'
                            }
                        }}
                    />
                    <Tab 
                        label="Analytics" 
                        icon={<TrendingUp sx={{ fontSize: '1rem' }} />} 
                        iconPosition="start"
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.75,
                            px: 1.5,
                            '& .MuiTab-iconWrapper': {
                                marginRight: '6px !important'
                            }
                        }}
                    />
                    <Tab 
                        label="Yearly Trends" 
                        icon={<ShowChart sx={{ fontSize: '1rem' }} />} 
                        iconPosition="start"
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.75,
                            px: 1.5,
                            '& .MuiTab-iconWrapper': {
                                marginRight: '6px !important'
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
                    p: 1
                }}>
                    <>
                    {activeTab === 0 && (
                        <Grid container spacing={0.75}>
                            {/* Enhanced Overview Tab Layout */}
                            
                            {/* KPI Cards - 2x3 Grid with Improved Information Flow */}
                            <Grid item xs={12}>
                                <Fade in timeout={1000}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {/* Row 1: Project Overview - Both are project counts */}
                                        <Grid container spacing={1}>
                                            <Grid item xs={12} sm={6}>
                                                <KPICard
                                                    title="Total Projects"
                                                    value={totalProjects}
                                                    icon={<Assessment />}
                                                    color="#1976d2"
                                                    subtitle="Across all departments"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <KPICard
                                                    title="Completed Projects"
                                                    value={completedProjects}
                                                    icon={<TaskAlt />}
                                                    color="#2e7d32"
                                                    subtitle="Projects finished"
                                                />
                                            </Grid>
                                        </Grid>
                                        {/* Row 2: Performance & Financial Commitment */}
                                        <Grid container spacing={1}>
                                            <Grid item xs={12} sm={6}>
                                                <KPICard
                                                    title="Completion Rate"
                                                    value={`${completionRate}%`}
                                                    icon={<Percent />}
                                                    color="#2e7d32"
                                                    subtitle="Projects completed"
                                                    progress={completionRate}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <KPICard
                                                    title="Total Contracted"
                                                    value={formatCurrency(financialSummary.totalContracted)}
                                                    icon={<Business />}
                                                    color="#1976d2"
                                                    subtitle="Contract sum"
                                                />
                                            </Grid>
                                        </Grid>
                                        {/* Row 3: Financial Execution Flow - Paid → Utilization */}
                                        <Grid container spacing={1}>
                                            <Grid item xs={12} sm={6}>
                                                <KPICard
                                                    title="Total Paid"
                                                    value={formatCurrency(financialSummary.totalPaid)}
                                                    icon={<CheckCircle />}
                                                    color="#4caf50"
                                                    subtitle="Amount disbursed"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <KPICard
                                                    title="Budget Utilization"
                                                    value={`${financialSummary.absorptionRate.toFixed(2)}%`}
                                                    icon={<AttachMoney />}
                                                    color="#ff9800"
                                                    subtitle="Absorption rate"
                                                    progress={financialSummary.absorptionRate}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Fade>
                            </Grid>

                            {/* Middle Row: Chart (Left) + Status Count (Right) */}
                            <Grid item xs={12} lg={6}>
                                <Fade in timeout={1200}>
                                    <Card sx={{ 
                                        height: 'calc(3 * 105px + 2 * 8px + 40px)', // Match 3 KPI cards height + extra 40px to prevent scrollbar: 3 cards (~105px each) + 2 gaps (8px each) + 40px = ~371px
                                        borderRadius: '8px',
                                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'visible',
                                        '&:hover': {
                                            boxShadow: '0 12px 40px rgba(25, 118, 210, 0.15)',
                                            transform: 'translateY(-2px)',
                                            border: '1px solid rgba(25, 118, 210, 0.3)',
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '3px',
                                            background: 'linear-gradient(90deg, #1976d2, #42a5f5, #64b5f6)',
                                            borderRadius: '8px 8px 0 0'
                                        }
                                    }}>
                                        <CardHeader
                                            title={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <PieChart sx={{ color: 'primary.main', fontSize: '0.875rem' }} />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.8125rem' }}>
                                                        Project Status Distribution
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ pb: 0.25, px: 1, pt: 0.75 }}
                                        />
                                        <CardContent sx={{ flexGrow: 1, p: 1, pt: 0, pb: 0.75, display: 'flex', flexDirection: 'column' }}>
                                            <Box sx={{ 
                                                flex: 1,
                                                width: '100%',
                                                overflow: 'visible',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
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

                            {/* Right Column: Status Count & Issues Summary */}
                            <Grid item xs={12} lg={6}>
                                <Fade in timeout={1400}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: { xs: 'column', lg: 'row' }, 
                                        gap: 0.75, 
                                        height: 'calc(3 * 105px + 2 * 8px + 40px)', // Match 3 KPI cards height + extra 40px to prevent scrollbar: 3 cards (~105px each) + 2 gaps (8px each) + 40px = ~371px
                                    }}>
                                    {/* Project Count Distribution by Status */}
                                    <Card sx={{ 
                                        borderRadius: '8px',
                                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        flex: { xs: '1 1 auto', lg: '1 1 70%' },
                                        minHeight: 0,
                                        height: '100%',
                                        width: { xs: '100%', lg: '70%' },
                                        '&:hover': {
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                            border: '1px solid rgba(25, 118, 210, 0.2)'
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            background: 'linear-gradient(90deg, #1976d2, #42a5f5, #64b5f6)',
                                            borderRadius: '8px 8px 0 0'
                                        }
                                    }}>
                                        <CardHeader
                                            title={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <FilterList sx={{ color: 'primary.main', fontSize: '0.85rem' }} />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.85)', fontSize: '0.7rem' }}>
                                                        Project Count by Status
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ pb: 0.3, px: 0.6, pt: 0.5 }}
                                        />
                                        <CardContent sx={{ p: 0.75, pt: 0, pb: 0.75, height: '100%', overflow: 'auto' }}>
                                            <Box sx={{ 
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 0.6,
                                                width: '100%'
                                            }}>
                                                {dashboardData.projectStatus
                                                    .filter(statusItem => statusItem.name !== 'Stalled' && statusItem.name !== 'Suspended')
                                                    .map((statusItem) => {
                                                    const isActive = filters.projectStatus === statusItem.name || filters.status === statusItem.name;
                                                    const statusColor = getProjectStatusBackgroundColor(statusItem.name);
                                                    const totalProjects = dashboardData.projectStatus.reduce((sum, item) => sum + (item.value || 0), 0);
                                                    const percentage = totalProjects > 0 ? ((statusItem.value || 0) / totalProjects * 100).toFixed(1) : 0;
                                                    
                                                    return (
                                                        <Box
                                                            key={statusItem.name}
                                                            onClick={() => {
                                                                if (isActive) {
                                                                    handleFilterChange('projectStatus', '');
                                                                    handleFilterChange('status', '');
                                                                } else {
                                                                    handleFilterChange('projectStatus', statusItem.name);
                                                                    handleFilterChange('status', statusItem.name);
                                                                }
                                                            }}
                                                            sx={{
                                                                p: 1,
                                                                borderRadius: '6px',
                                                                background: isActive 
                                                                    ? `linear-gradient(135deg, ${statusColor}, ${statusColor}dd)`
                                                                    : `linear-gradient(135deg, ${statusColor}12, ${statusColor}08)`,
                                                                border: `2px solid ${isActive ? statusColor : `${statusColor}35`}`,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                minHeight: '50px',
                                                                '&:hover': {
                                                                    transform: 'translateX(4px)',
                                                                    boxShadow: `0 4px 12px ${statusColor}40`,
                                                                    border: `2px solid ${statusColor}`,
                                                                    background: `linear-gradient(135deg, ${statusColor}20, ${statusColor}15)`,
                                                                },
                                                                '&::before': {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    left: 0,
                                                                    top: 0,
                                                                    bottom: 0,
                                                                    width: '3px',
                                                                    background: `linear-gradient(180deg, ${statusColor}, ${statusColor}dd)`,
                                                                    opacity: isActive ? 1 : 0.5,
                                                                    transition: 'opacity 0.2s ease'
                                                                }
                                                            }}
                                                        >
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, ml: 0.5 }}>
                                                                <Typography 
                                                                    variant="body2" 
                                                                    sx={{ 
                                                                        color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(0, 0, 0, 0.75)', 
                                                                        fontSize: '0.7rem', 
                                                                        fontWeight: 700,
                                                                        textTransform: 'uppercase',
                                                                        letterSpacing: '0.5px',
                                                                        textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                                                                        mb: 0.25
                                                                    }}
                                                                >
                                                                    {statusItem.name}
                                                                </Typography>
                                                                <Typography 
                                                                    variant="caption" 
                                                                    sx={{ 
                                                                        color: isActive ? 'rgba(255,255,255,0.8)' : 'rgba(0, 0, 0, 0.55)', 
                                                                        fontSize: '0.65rem', 
                                                                        fontWeight: 600,
                                                                        textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                                                                    }}
                                                                >
                                                                    {percentage}% of total
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 0.5 }}>
                                                                <Typography 
                                                                    variant="h5" 
                                                                    sx={{ 
                                                                        fontWeight: 'bold', 
                                                                        color: isActive ? 'white' : statusColor, 
                                                                        fontSize: '1.5rem',
                                                                        textShadow: isActive ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
                                                                        lineHeight: 1
                                                                    }}
                                                                >
                                                                    {statusItem.value || 0}
                                                                </Typography>
                                                                {isActive && (
                                                                    <Chip 
                                                                        label="Active" 
                                                                        size="small" 
                                                                        sx={{ 
                                                                            height: '16px',
                                                                            fontSize: '0.6rem',
                                                                            backgroundColor: 'rgba(255,255,255,0.25)',
                                                                            color: 'white',
                                                                            fontWeight: 700,
                                                                            border: '1px solid rgba(255,255,255,0.3)',
                                                                            mt: 0.25,
                                                                            '& .MuiChip-label': { px: 0.5, py: 0 }
                                                                        }} 
                                                                    />
                                                                )}
                                                            </Box>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    color: 'rgba(0, 0, 0, 0.5)', 
                                                    fontSize: '0.6rem', 
                                                    display: 'block', 
                                                    mt: 1, 
                                                    textAlign: 'center',
                                                    fontStyle: 'italic'
                                                }}
                                            >
                                                Click status to filter
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                    
                                    {/* Issues Summary */}
                                    <Card sx={{ 
                                        borderRadius: '8px',
                                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        backdropFilter: 'blur(10px)',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        flex: { xs: '1 1 auto', lg: '1 1 30%' },
                                        minHeight: 0,
                                        height: '100%',
                                        width: { xs: '100%', lg: '30%' },
                                        '&:hover': {
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                            border: '1px solid rgba(244, 67, 54, 0.2)'
                                        },
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            background: 'linear-gradient(90deg, #f44336, #e91e63)',
                                            borderRadius: '8px 8px 0 0'
                                        }
                                    }}>
                                        <CardHeader
                                            title={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Warning sx={{ color: 'error.main', fontSize: '0.85rem' }} />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'rgba(0, 0, 0, 0.85)', fontSize: '0.7rem' }}>
                                                        Issues Summary
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ pb: 0.3, px: 0.6, pt: 0.5 }}
                                        />
                                        <CardContent sx={{ p: 0.75, pt: 0, pb: 0.75, height: '100%', overflow: 'auto' }}>
                                            <Box sx={{ 
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 0.6,
                                                width: '100%'
                                            }}>
                                                {/* Stalled - Clickable */}
                                                <Box 
                                                    onClick={() => {
                                                        const isActive = filters.projectStatus === 'Stalled' || filters.status === 'Stalled';
                                                        if (isActive) {
                                                            handleFilterChange('projectStatus', '');
                                                            handleFilterChange('status', '');
                                                        } else {
                                                            handleFilterChange('projectStatus', 'Stalled');
                                                            handleFilterChange('status', 'Stalled');
                                                        }
                                                    }}
                                                    sx={{ 
                                                        textAlign: 'center', 
                                                        p: 1, 
                                                        bgcolor: (filters.projectStatus === 'Stalled' || filters.status === 'Stalled') 
                                                            ? 'rgba(255, 152, 0, 0.25)' 
                                                            : 'rgba(255, 152, 0, 0.1)', 
                                                        borderRadius: '6px',
                                                        border: (filters.projectStatus === 'Stalled' || filters.status === 'Stalled')
                                                            ? '2px solid #e65100'
                                                            : '1px solid rgba(255, 152, 0, 0.3)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        '&:hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
                                                            border: '2px solid #e65100',
                                                            bgcolor: 'rgba(255, 152, 0, 0.2)',
                                                        },
                                                        '&::before': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            left: 0,
                                                            top: 0,
                                                            bottom: 0,
                                                            width: '3px',
                                                            background: 'linear-gradient(180deg, #e65100, #ff9800)',
                                                            opacity: (filters.projectStatus === 'Stalled' || filters.status === 'Stalled') ? 1 : 0.5,
                                                            transition: 'opacity 0.2s ease'
                                                        }
                                                    }}
                                                >
                                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#e65100', mb: 0.25, fontSize: '1.5rem' }}>
                                                        {stalledProjects}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.7)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                                        Stalled
                                                    </Typography>
                                                </Box>
                                                {/* Suspended - Clickable */}
                                                <Box 
                                                    onClick={() => {
                                                        const isActive = filters.projectStatus === 'Suspended' || filters.status === 'Suspended';
                                                        if (isActive) {
                                                            handleFilterChange('projectStatus', '');
                                                            handleFilterChange('status', '');
                                                        } else {
                                                            handleFilterChange('projectStatus', 'Suspended');
                                                            handleFilterChange('status', 'Suspended');
                                                        }
                                                    }}
                                                    sx={{ 
                                                        textAlign: 'center', 
                                                        p: 1, 
                                                        bgcolor: (filters.projectStatus === 'Suspended' || filters.status === 'Suspended')
                                                            ? 'rgba(233, 30, 99, 0.25)' 
                                                            : 'rgba(233, 30, 99, 0.1)', 
                                                        borderRadius: '6px',
                                                        border: (filters.projectStatus === 'Suspended' || filters.status === 'Suspended')
                                                            ? '2px solid #c2185b'
                                                            : '1px solid rgba(233, 30, 99, 0.3)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        '&:hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
                                                            border: '2px solid #c2185b',
                                                            bgcolor: 'rgba(233, 30, 99, 0.2)',
                                                        },
                                                        '&::before': {
                                                            content: '""',
                                                            position: 'absolute',
                                                            left: 0,
                                                            top: 0,
                                                            bottom: 0,
                                                            width: '3px',
                                                            background: 'linear-gradient(180deg, #c2185b, #e91e63)',
                                                            opacity: (filters.projectStatus === 'Suspended' || filters.status === 'Suspended') ? 1 : 0.5,
                                                            transition: 'opacity 0.2s ease'
                                                        }
                                                    }}
                                                >
                                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#c2185b', mb: 0.25, fontSize: '1.5rem' }}>
                                                        {suspendedProjects}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.7)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                                        Suspended
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                    </Box>
                                </Fade>
                            </Grid>

                        {/* Overview Detail Table */}
                        <Grid item xs={12}>
                            <Box sx={{ 
                                mt: 2,
                                pt: 2,
                                pb: 2,
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '12px',
                                border: '1px solid rgba(25, 118, 210, 0.15)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                                position: 'relative',
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
                                {/* Table Header with Action Buttons */}
                                <Box sx={{ 
                                    px: 1.25, 
                                    py: 1,
                                    borderBottom: '2px solid rgba(25, 118, 210, 0.15)',
                                    background: 'linear-gradient(90deg, rgba(25, 118, 210, 0.05) 0%, rgba(255,255,255,0.95) 100%)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9375rem', mb: 0.25 }}>
                                            Department Overview Details
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                            {transformOverviewData(dashboardData.projectProgress.map(dept => ({ 
                                                id: dept.departmentId || dept.department,
                                                department: dept.departmentName || dept.department,
                                                departmentAlias: dept.departmentAlias || dept.department,
                                                percentCompleted: Math.round((parseFloat(dept.percentCompleted) || 0) * 100) / 100,
                                                healthScore: dept.healthScore || 0,
                                                numProjects: dept.numProjects || 0,
                                                allocatedBudget: dept.allocatedBudget || 0,
                                                amountPaid: dept.amountPaid || 0
                                            }))).length} {transformOverviewData(dashboardData.projectProgress.map(dept => ({ 
                                                id: dept.departmentId || dept.department,
                                                department: dept.departmentName || dept.department,
                                                departmentAlias: dept.departmentAlias || dept.department,
                                                percentCompleted: Math.round((parseFloat(dept.percentCompleted) || 0) * 100) / 100,
                                                healthScore: dept.healthScore || 0,
                                                numProjects: dept.numProjects || 0,
                                                allocatedBudget: dept.allocatedBudget || 0,
                                                amountPaid: dept.amountPaid || 0
                                            }))).length === 1 ? 'record' : 'records'}
                                        </Typography>
                                    </Box>
                                    {/* Action Buttons (suppressed in print) */}
                                    <Stack direction="row" spacing={0.5} className="kimes-noprint">
                                        <Tooltip title="Export to Excel">
                                            <IconButton
                                                size="small"
                                                onClick={handleExportExcel}
                                                sx={{
                                                    color: '#2e7d32',
                                                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                                    border: '1px solid rgba(46, 125, 50, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(46, 125, 50, 0.15)',
                                                        border: '1px solid rgba(46, 125, 50, 0.3)',
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <FileDownload sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Export to PDF">
                                            <IconButton
                                                size="small"
                                                onClick={handleExportPDF}
                                                sx={{
                                                    color: '#d32f2f',
                                                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                                    border: '1px solid rgba(211, 47, 47, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(211, 47, 47, 0.15)',
                                                        border: '1px solid rgba(211, 47, 47, 0.3)',
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <PictureAsPdf sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Print">
                                            <IconButton
                                                size="small"
                                                onClick={handlePrint}
                                                sx={{
                                                    color: '#1976d2',
                                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                    border: '1px solid rgba(25, 118, 210, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(25, 118, 210, 0.15)',
                                                        border: '1px solid rgba(25, 118, 210, 0.3)',
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <Print sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Refresh Data">
                                            <IconButton
                                                size="small"
                                                onClick={handleRefresh}
                                                disabled={isLoading}
                                                sx={{
                                                    color: '#ff9800',
                                                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                                    border: '1px solid rgba(255, 152, 0, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 152, 0, 0.15)',
                                                        border: '1px solid rgba(255, 152, 0, 0.3)',
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    '&:disabled': {
                                                        opacity: 0.5
                                                    },
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <Refresh sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Box>
                                <ProjectDetailTable
                                    data={transformOverviewData(dashboardData.projectProgress.map(dept => ({ 
                                        id: dept.departmentId || dept.department,
                                        department: dept.departmentName || dept.department,
                                        departmentAlias: dept.departmentAlias || dept.department,
                                        percentCompleted: Math.round((parseFloat(dept.percentCompleted) || 0) * 100) / 100,
                                        healthScore: dept.healthScore || 0,
                                        numProjects: dept.numProjects || 0,
                                        allocatedBudget: dept.allocatedBudget || 0,
                                        amountPaid: dept.amountPaid || 0
                                    })))}
                                    columns={overviewTableColumns}
                                    title=""
                                    onRowClick={(row) => handleDepartmentClick(row)}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                    )}

                    {activeTab === 1 && (
                        <Grid container spacing={1}>
                            {/* Financial Tab Content */}
                            
                            {/* Financial Summary Cards */}
                            <Grid item xs={12} md={4}>
                                <Fade in timeout={1200}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: 1.5, 
                                        height: '400px',
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
                                            value={`${financialSummary.absorptionRate.toFixed(2)}%`}
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
                                        height: '340px',
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
                                            borderRadius: '8px 8px 0 0'
                                        }
                                    }}>
                                        <CardHeader
                                            title={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <BarChart sx={{ color: 'warning.main', fontSize: '1rem' }} />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.8125rem' }}>
                                                        Budget Allocation by Status
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ pb: 0.25, px: 1, pt: 0.75 }}
                                        />
                                        <CardContent sx={{ flexGrow: 1, p: 1, pt: 0 }}>
                                            <Box sx={{ height: '280px', minWidth: '500px' }}>
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
                                        height: '340px',
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
                                            borderRadius: '8px 8px 0 0'
                                        }
                                    }}>
                                        <CardHeader
                                            title={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AttachMoney sx={{ color: 'success.main', fontSize: '1rem' }} />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.8125rem' }}>
                                                        Budget Performance by Department
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ pb: 0.25, px: 1, pt: 0.75 }}
                                        />
                                        <CardContent sx={{ flexGrow: 1, p: 1, pt: 0 }}>
                                            <Box sx={{ height: '280px', minWidth: '300px' }}>
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
                            
                            {/* Visual Separator */}
                            <Grid item xs={12}>
                                <Box sx={{ 
                                    mt: 2.5, 
                                    mb: 1.5,
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Divider 
                                        sx={{ 
                                            flex: 1,
                                            borderWidth: 2,
                                            borderColor: 'success.main',
                                            opacity: 0.3,
                                            '&::before, &::after': {
                                                borderWidth: 2
                                            }
                                        }} 
                                    />
                                    <Box sx={{
                                        px: 2,
                                        py: 0.75,
                                        backgroundColor: 'success.main',
                                        borderRadius: '20px',
                                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)'
                                    }}>
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                fontWeight: 700,
                                                color: 'white',
                                                fontSize: '0.8125rem',
                                                letterSpacing: '0.5px',
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            Detailed View
                                        </Typography>
                                    </Box>
                                    <Divider 
                                        sx={{ 
                                            flex: 1,
                                            borderWidth: 2,
                                            borderColor: 'success.main',
                                            opacity: 0.3,
                                            '&::before, &::after': {
                                                borderWidth: 2
                                            }
                                        }} 
                                    />
                                    {/* Action Buttons (suppressed in print) */}
                                    <Stack direction="row" spacing={0.5} sx={{ ml: 1 }} className="kimes-noprint">
                                        <Tooltip title="Export to Excel">
                                            <IconButton
                                                size="small"
                                                onClick={handleExportExcel}
                                                sx={{
                                                    color: '#2e7d32',
                                                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                                    border: '1px solid rgba(46, 125, 50, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(46, 125, 50, 0.15)',
                                                        border: '1px solid rgba(46, 125, 50, 0.3)',
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <FileDownload sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Export to PDF">
                                            <IconButton
                                                size="small"
                                                onClick={handleExportPDF}
                                                sx={{
                                                    color: '#d32f2f',
                                                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                                    border: '1px solid rgba(211, 47, 47, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(211, 47, 47, 0.15)',
                                                        border: '1px solid rgba(211, 47, 47, 0.3)',
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <PictureAsPdf sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Print">
                                            <IconButton
                                                size="small"
                                                onClick={handlePrint}
                                                sx={{
                                                    color: '#1976d2',
                                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                    border: '1px solid rgba(25, 118, 210, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(25, 118, 210, 0.15)',
                                                        border: '1px solid rgba(25, 118, 210, 0.3)',
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <Print sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Refresh Data">
                                            <IconButton
                                                size="small"
                                                onClick={handleRefresh}
                                                disabled={isLoading}
                                                sx={{
                                                    color: '#ff9800',
                                                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                                    border: '1px solid rgba(255, 152, 0, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 152, 0, 0.15)',
                                                        border: '1px solid rgba(255, 152, 0, 0.3)',
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    '&:disabled': {
                                                        opacity: 0.5
                                                    },
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <Refresh sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Box>
                            </Grid>

                            {/* Financial Detail Table */}
                            <Grid item xs={12}>
                                <Box sx={{ 
                                    mt: 0,
                                    pt: 2,
                                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(76, 175, 80, 0.1)'
                                }}>
                                    <ProjectDetailTable
                                        data={dashboardData.projectProgress.map((dept, index) => ({ 
                                            id: dept.departmentId || dept.department || `dept-${index}`,
                                            rowNumber: index + 1,
                                            department: dept.departmentName || dept.department,
                                            departmentAlias: dept.departmentAlias || dept.department,
                                            allocatedBudget: parseFloat(dept.allocatedBudget) || 0,
                                            contractSum: parseFloat(dept.contractSum) || 0,
                                            amountPaid: parseFloat(dept.amountPaid) || 0,
                                            absorptionRate: Math.round((parseFloat(dept.percentAbsorptionRate) || 0) * 100) / 100,
                                            remainingBudget: (parseFloat(dept.allocatedBudget) || 0) - (parseFloat(dept.amountPaid) || 0)
                                        }))}
                                        columns={financialTableColumns}
                                        title="Financial Details by Department"
                                        onRowClick={(row) => handleDepartmentClick(row)}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    )}

                    {activeTab === 2 && (
                        <Grid container spacing={2}>
                            {/* Analytics Tab Content */}
                            
                            {/* Project Progress (Line/Bar Combo Chart) */}
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
                                        {/* Budget Efficiency */}
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
                                            <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.75rem' }}>
                                                        Budget Efficiency
                                                    </Typography>
                                                    <AttachMoney sx={{ color: '#4caf50', fontSize: '1.2rem' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
                                                        {financialSummary.absorptionRate.toFixed(2)}%
                                                    </Typography>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={financialSummary.absorptionRate} 
                                                        sx={{ 
                                                            height: 6, 
                                                            borderRadius: 3,
                                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                                            '& .MuiLinearProgress-bar': {
                                                                backgroundColor: financialSummary.absorptionRate >= 80 ? '#4caf50' : financialSummary.absorptionRate >= 60 ? '#ff9800' : '#f44336',
                                                                borderRadius: 3
                                                            }
                                                        }} 
                                                    />
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                                                        {financialSummary.absorptionRate >= 80 ? 'Excellent' : financialSummary.absorptionRate >= 60 ? 'Good' : 'Needs Attention'}
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
                                                            {Math.round((stalledProjects + suspendedProjects) / totalProjects * 100)}%
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                            Issues (Stalled + Suspended)
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
                                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
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
                                                {suspendedProjects}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                Suspended
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Fade>
                </Grid>
                
                {/* Visual Separator */}
                <Grid item xs={12}>
                    <Box sx={{ 
                        mt: 2.5, 
                        mb: 1.5,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Divider 
                            sx={{ 
                                flex: 1,
                                borderWidth: 2,
                                borderColor: 'info.main',
                                opacity: 0.3,
                                '&::before, &::after': {
                                    borderWidth: 2
                                }
                            }} 
                        />
                        <Box sx={{
                            px: 2,
                            py: 0.75,
                            backgroundColor: 'info.main',
                            borderRadius: '20px',
                            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)'
                        }}>
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    fontWeight: 700,
                                    color: 'white',
                                    fontSize: '0.8125rem',
                                    letterSpacing: '0.5px',
                                    textTransform: 'uppercase'
                                }}
                            >
                                Detailed View
                            </Typography>
                        </Box>
                        <Divider 
                            sx={{ 
                                flex: 1,
                                borderWidth: 2,
                                borderColor: 'info.main',
                                opacity: 0.3,
                                '&::before, &::after': {
                                    borderWidth: 2
                                }
                            }} 
                        />
                        {/* Action Buttons (suppressed in print) */}
                        <Stack direction="row" spacing={0.5} sx={{ ml: 1 }} className="kimes-noprint">
                            <Tooltip title="Export to Excel">
                                <IconButton
                                    size="small"
                                    onClick={handleExportExcel}
                                    sx={{
                                        color: '#2e7d32',
                                        backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                        border: '1px solid rgba(46, 125, 50, 0.2)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(46, 125, 50, 0.15)',
                                            border: '1px solid rgba(46, 125, 50, 0.3)',
                                            transform: 'translateY(-1px)'
                                        },
                                        width: '32px',
                                        height: '32px'
                                    }}
                                >
                                    <FileDownload sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Export to PDF">
                                <IconButton
                                    size="small"
                                    onClick={handleExportPDF}
                                    sx={{
                                        color: '#d32f2f',
                                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                        border: '1px solid rgba(211, 47, 47, 0.2)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(211, 47, 47, 0.15)',
                                            border: '1px solid rgba(211, 47, 47, 0.3)',
                                            transform: 'translateY(-1px)'
                                        },
                                        width: '32px',
                                        height: '32px'
                                    }}
                                >
                                    <PictureAsPdf sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Print">
                                <IconButton
                                    size="small"
                                    onClick={handlePrint}
                                    sx={{
                                        color: '#1976d2',
                                        backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                        border: '1px solid rgba(25, 118, 210, 0.2)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(25, 118, 210, 0.15)',
                                            border: '1px solid rgba(25, 118, 210, 0.3)',
                                            transform: 'translateY(-1px)'
                                        },
                                        width: '32px',
                                        height: '32px'
                                    }}
                                >
                                    <Print sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Refresh Data">
                                <IconButton
                                    size="small"
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                    sx={{
                                        color: '#ff9800',
                                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                        border: '1px solid rgba(255, 152, 0, 0.2)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 152, 0, 0.15)',
                                            border: '1px solid rgba(255, 152, 0, 0.3)',
                                            transform: 'translateY(-1px)'
                                        },
                                        '&:disabled': {
                                            opacity: 0.5
                                        },
                                        width: '32px',
                                        height: '32px'
                                    }}
                                >
                                    <Refresh sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>
                </Grid>

                {/* Analytics Detail Table */}
                <Grid item xs={12}>
                    <Box sx={{ 
                        mt: 0,
                        pt: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '8px',
                        border: '1px solid rgba(33, 150, 243, 0.1)'
                    }}>
                        <ProjectDetailTable
                            data={transformAnalyticsData(dashboardData.projectProgress)}
                            columns={analyticsTableColumns}
                            title="Department Analytics Details"
                            onRowClick={(row) => handleDepartmentClick(row)}
                        />
                    </Box>
                </Grid>
            </Grid>
                    )}

                    {activeTab === 3 && (
                        <Grid container spacing={1}>
                            {/* Annual Trends Tab Content */}
                            
                            {/* Project Performance Overview */}
                            <Grid item xs={12} md={8}>
                                <Fade in timeout={2000}>
                                    <Card sx={{ 
                                        height: '400px',
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
                                            borderRadius: '8px 8px 0 0'
                                        }
                                    }}>
                                        <CardHeader
                                            title={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <ShowChart sx={{ color: 'primary.main', fontSize: '1rem' }} />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.8125rem' }}>
                                                        Project Performance Trends ({trendsData.yearRange.start || 'N/A'}-{trendsData.yearRange.end || 'N/A'})
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ pb: 0.25, px: 1, pt: 0.75 }}
                                        />
                                        <CardContent sx={{ flexGrow: 1, p: 1, pt: 0 }}>
                                            <Box sx={{ height: '340px', minWidth: '600px' }}>
                                                {trendsData.projectPerformance.length > 0 ? (
                                                    <LineBarComboChart
                                                        title=""
                                                        data={trendsData.projectPerformance}
                                                        barKeys={['totalProjects', 'completedProjects']}
                                                        lineKeys={['completionRate']}
                                                        xAxisKey="year"
                                                        yAxisLabelLeft="Project Count"
                                                        yAxisLabelRight="Completion Rate (%)"
                                                    />
                                                ) : (
                                                    renderNoDataCard("Project Performance Trends")
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Fade>
                            </Grid>

                            {/* Department Performance Summary */}
                            <Grid item xs={12} md={4}>
                                <Fade in timeout={2400}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: 1, 
                                        height: '400px',
                                        justifyContent: 'space-between'
                                    }}>
                                        {/* Total Projects Over Time */}
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
                                                borderRadius: '8px 8px 0 0'
                                            }
                                        }}>
                                            <CardContent sx={{ p: 1.25, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.7rem' }}>
                                                        Total Projects
                                                    </Typography>
                                                    <Business sx={{ color: '#1976d2', fontSize: '1rem' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.25, fontSize: '1.25rem' }}>
                                                        {trendsData.projectPerformance.reduce((sum, item) => sum + (item.totalProjects || 0), 0)}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                        {trendsData.yearRange.start && trendsData.yearRange.end 
                                                            ? `From ${trendsData.yearRange.start} to ${trendsData.yearRange.end}`
                                                            : 'All available years'
                                                        }
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>

                                        {/* Average Completion Rate */}
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
                                                borderRadius: '8px 8px 0 0'
                                            }
                                        }}>
                                            <CardContent sx={{ p: 1.25, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.7rem' }}>
                                                        Avg Completion Rate
                                                    </Typography>
                                                    <CheckCircle sx={{ color: '#4caf50', fontSize: '1rem' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.25, fontSize: '1.25rem' }}>
                                                        {trendsData.projectPerformance.length > 0 ? 
                                                            (trendsData.projectPerformance.reduce((sum, item) => sum + parseFloat(item.completionRate || 0), 0) / trendsData.projectPerformance.length).toFixed(1) + '%' 
                                                            : '0%'
                                                        }
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                        Over 5 years
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>

                                        {/* Total Budget Over Time */}
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
                                                borderRadius: '8px 8px 0 0'
                                            }
                                        }}>
                                            <CardContent sx={{ p: 1.25, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '0.7rem' }}>
                                                        Total Budget
                                                    </Typography>
                                                    <AttachMoney sx={{ color: '#ff9800', fontSize: '1rem' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.25, fontSize: '1.25rem' }}>
                                                        {formatCurrency(trendsData.financialTrends.reduce((sum, item) => sum + parseFloat(item.totalBudget || 0), 0))}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                                                        Over 5 years
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Box>
                                </Fade>
                            </Grid>

                            {/* Financial Performance Trends */}
                            <Grid item xs={12}>
                                <Fade in timeout={2200}>
                                    <Card sx={{ 
                                        height: '400px',
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
                                            borderRadius: '8px 8px 0 0'
                                        }
                                    }}>
                                        <CardHeader
                                            title={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <AttachMoney sx={{ color: 'success.main', fontSize: '1rem' }} />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '0.8125rem' }}>
                                                        Financial Performance Trends
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ pb: 0.25, px: 1, pt: 0.75 }}
                                        />
                                        <CardContent sx={{ flexGrow: 1, p: 1, pt: 0 }}>
                                            <Box sx={{ height: '340px', minWidth: '700px' }}>
                                                {trendsData.financialTrends.length > 0 ? (
                                                    <LineBarComboChart
                                                        title=""
                                                        data={trendsData.financialTrends}
                                                        barKeys={['totalBudget', 'totalExpenditure']}
                                                        lineKeys={['absorptionRate']}
                                                        xAxisKey="year"
                                                        yAxisLabelLeft="Budget Amount (KSh)"
                                                        yAxisLabelRight="Absorption Rate (%)"
                                                    />
                                                ) : (
                                                    renderNoDataCard("Financial Trends")
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Fade>
                            </Grid>

                            {/* Visual Separator */}
                            <Grid item xs={12}>
                                <Box sx={{ 
                                    mt: 1.5, 
                                    mb: 1,
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2
                                }}>
                                    <Divider 
                                        sx={{ 
                                            flex: 1,
                                            borderWidth: 2,
                                            borderColor: 'primary.main',
                                            opacity: 0.3,
                                            '&::before, &::after': {
                                                borderWidth: 2
                                            }
                                        }} 
                                    />
                                    <Box sx={{
                                        px: 2,
                                        py: 0.75,
                                        backgroundColor: 'primary.main',
                                        borderRadius: '20px',
                                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)'
                                    }}>
                                        <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                                fontWeight: 700,
                                                color: 'white',
                                                fontSize: '0.8125rem',
                                                letterSpacing: '0.5px',
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            Detailed View
                                        </Typography>
                                    </Box>
                                    <Divider 
                                        sx={{ 
                                            flex: 1,
                                            borderWidth: 2,
                                            borderColor: 'primary.main',
                                            opacity: 0.3,
                                            '&::before, &::after': {
                                                borderWidth: 2
                                            }
                                        }} 
                                    />
                                    {/* Action Buttons (suppressed in print) */}
                                    <Stack direction="row" spacing={0.5} sx={{ ml: 1 }} className="kimes-noprint">
                                        <Tooltip title="Export to Excel">
                                            <IconButton
                                                size="small"
                                                onClick={handleExportExcel}
                                                sx={{
                                                    color: '#2e7d32',
                                                    backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                                    border: '1px solid rgba(46, 125, 50, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(46, 125, 50, 0.15)',
                                                        border: '1px solid rgba(46, 125, 50, 0.3)',
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <FileDownload sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Export to PDF">
                                            <IconButton
                                                size="small"
                                                onClick={handleExportPDF}
                                                sx={{
                                                    color: '#d32f2f',
                                                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                                    border: '1px solid rgba(211, 47, 47, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(211, 47, 47, 0.15)',
                                                        border: '1px solid rgba(211, 47, 47, 0.3)',
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <PictureAsPdf sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Print">
                                            <IconButton
                                                size="small"
                                                onClick={handlePrint}
                                                sx={{
                                                    color: '#1976d2',
                                                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                                    border: '1px solid rgba(25, 118, 210, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(25, 118, 210, 0.15)',
                                                        border: '1px solid rgba(25, 118, 210, 0.3)',
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <Print sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Refresh Data">
                                            <IconButton
                                                size="small"
                                                onClick={handleRefresh}
                                                disabled={isLoading}
                                                sx={{
                                                    color: '#ff9800',
                                                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                                    border: '1px solid rgba(255, 152, 0, 0.2)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 152, 0, 0.15)',
                                                        border: '1px solid rgba(255, 152, 0, 0.3)',
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    '&:disabled': {
                                                        opacity: 0.5
                                                    },
                                                    width: '32px',
                                                    height: '32px'
                                                }}
                                            >
                                                <Refresh sx={{ fontSize: '0.9rem' }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Box>
                            </Grid>

                            {/* Yearly Trends Detail Report */}
                            <Grid item xs={12}>
                                <Box sx={{ 
                                    mt: 0,
                                    pt: 1.5,
                                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(25, 118, 210, 0.1)'
                                }}>
                                    <ProjectDetailTable
                                        data={trendsData.projectPerformance.map((year, index) => ({
                                            id: year.year,
                                            rowNumber: index + 1,
                                            year: year.year,
                                            totalProjects: year.totalProjects,
                                            completedProjects: year.completedProjects,
                                            completionRate: year.completionRate + '%',
                                            avgDuration: Math.round(year.avgDuration) + ' days',
                                            growthRate: year.growthRate + '%',
                                            totalBudget: 'KSh ' + (trendsData.financialTrends[index]?.totalBudget ? 
                                                (parseFloat(trendsData.financialTrends[index].totalBudget) / 1000000).toFixed(1) + 'M' : '0M'),
                                            absorptionRate: trendsData.financialTrends[index]?.absorptionRate ? 
                                                parseFloat(trendsData.financialTrends[index].absorptionRate).toFixed(1) + '%' : '0%'
                                        }))}
                                        columns={[
                                            {
                                                id: 'rowNumber',
                                                label: '#',
                                                minWidth: 60,
                                                type: 'number'
                                            },
                                            {
                                                id: 'year',
                                                label: 'Year',
                                                minWidth: 80,
                                                type: 'text'
                                            },
                                            {
                                                id: 'totalProjects',
                                                label: 'Total Projects',
                                                minWidth: 120,
                                                type: 'number'
                                            },
                                            {
                                                id: 'completedProjects',
                                                label: 'Completed',
                                                minWidth: 100,
                                                type: 'number'
                                            },
                                            {
                                                id: 'completionRate',
                                                label: 'Completion Rate',
                                                minWidth: 130,
                                                type: 'text'
                                            },
                                            {
                                                id: 'avgDuration',
                                                label: 'Avg Duration',
                                                minWidth: 120,
                                                type: 'text'
                                            },
                                            {
                                                id: 'growthRate',
                                                label: 'Growth Rate',
                                                minWidth: 100,
                                                type: 'text'
                                            },
                                            {
                                                id: 'totalBudget',
                                                label: 'Total Budget',
                                                minWidth: 140,
                                                type: 'text'
                                            },
                                            {
                                                id: 'absorptionRate',
                                                label: 'Absorption Rate',
                                                minWidth: 130,
                                                type: 'text'
                                            }
                                        ]}
                                        title="Yearly Performance Details"
                                        onRowClick={(row) => handleYearClick(row)}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                    </>
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
            
            {/* Department Projects Modal */}
            <DepartmentProjectsModal
                open={modalOpen}
                onClose={handleCloseModal}
                departmentData={selectedDepartment}
                statusFilter={filters.projectStatus || filters.status}
            />

            {/* Year Projects Modal */}
            <YearProjectsModal
                open={yearModalOpen}
                onClose={handleCloseYearModal}
                yearData={selectedYear}
            />
        </Box>
    );
};

export default ReportingView;
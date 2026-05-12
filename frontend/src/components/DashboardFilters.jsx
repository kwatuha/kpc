// src/components/DashboardFilters.jsx

import React, { useState, useEffect } from 'react';
// Normalized status options for filters
const NORMALIZED_STATUSES = [
    { name: 'Completed' },
    { name: 'Ongoing' },
    { name: 'Not started' },
    { name: 'Stalled' },
    { name: 'Under Procurement' },
    { name: 'Suspended' },
    { name: 'Other' }
];
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    IconButton,
    Typography,
    Collapse,
    Paper,
    Grid,
    InputAdornment
} from '@mui/material';
import { Clear as ClearIcon, KeyboardArrowUp, KeyboardArrowDown, Search } from '@mui/icons-material';
import reportsService from '../api/reportsService';
import regionalService from '../api/regionalService';
import { DEFAULT_COUNTY, DEFAULT_SUBCOUNTY } from '../configs/appConfig';

const DashboardFilters = ({ filters, onFilterChange, onClearFilters }) => {
    const [open, setOpen] = useState(false); // Collapsed by default to save space
    const [searchInput, setSearchInput] = useState(filters.globalSearch || ''); // Local state for input
    const [filterOptions, setFilterOptions] = useState({
        departments: [],
        projectTypes: [],
        projectStatuses: [],
        financialYears: [],
        sections: [],
        subCounties: [],
        wards: []
    });
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [availableSubCounties, setAvailableSubCounties] = useState([]);
    const [availableWards, setAvailableWards] = useState([]);

    const handleToggleCollapse = () => {
        setOpen(!open);
    };

    // Update local search input when filters change externally
    useEffect(() => {
        setSearchInput(filters.globalSearch || '');
    }, [filters.globalSearch]);

    const handleSearch = () => {
        onFilterChange('globalSearch', searchInput.trim());
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClearSearch = () => {
        setSearchInput('');
        onFilterChange('globalSearch', '');
    };

    // Fetch filter options on component mount
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                setIsLoadingOptions(true);
                console.log('Fetching filter options...');
                const options = await reportsService.getFilterOptions();
                console.log('Filter options received:', options);
                setFilterOptions(options);
                
                // Load sub-counties for the default county
                await loadSubCountiesForCounty(DEFAULT_COUNTY.countyId);
                
                // Load wards for the default sub-county using the same logic as sub-county changes
                console.log('Loading initial wards for default sub-county:', DEFAULT_SUBCOUNTY.name);
                await loadWardsForSubCountyByName(DEFAULT_SUBCOUNTY.name);
            } catch (error) {
                console.error('Error fetching filter options:', error);
                // Keep empty arrays as fallback
            } finally {
                setIsLoadingOptions(false);
            }
        };

        fetchFilterOptions();
    }, []);

    // Load sub-counties for a specific county
    const loadSubCountiesForCounty = async (countyId) => {
        try {
            const response = await regionalService.getSubCountiesData({ countyId });
            setAvailableSubCounties(response.subCounties || []);
        } catch (error) {
            console.error('Error fetching sub-counties:', error);
            setAvailableSubCounties([]);
        }
    };

    // Load wards for a specific sub-county by name
    const loadWardsForSubCountyByName = async (subCountyName) => {
        try {
            console.log('=== WARD LOADING DEBUG ===');
            console.log('Loading wards for sub-county name:', subCountyName);
            console.log('API Query: regionalService.getWardsData({ subCounty: "' + subCountyName + '" })');
            
            const response = await regionalService.getWardsData({ subCounty: subCountyName });
            console.log('Wards response with name:', response);
            const wards = response.wards || [];
            console.log('Wards count from API:', wards.length);
            
            // Show sample ward data to verify structure
            if (wards.length > 0) {
                console.log('Sample ward data:', wards[0]);
                console.log('All ward sub-county names:', wards.map(w => w.subcountyName));
            }
            
            // Filter wards by sub-county name as a fallback if API doesn't filter
            const filteredWards = wards.filter(ward => 
                ward.subcountyName === subCountyName
            );
            console.log('Filtered wards count:', filteredWards.length);
            console.log('Filtered ward names:', filteredWards.map(w => w.wardName));
            console.log('=== END WARD LOADING DEBUG ===');
            
            setAvailableWards(filteredWards);
        } catch (error) {
            console.error('Error fetching wards with subCounty name:', error);
            setAvailableWards([]);
        }
    };

    // Load wards for a specific sub-county by ID
    const loadWardsForSubCounty = async (subCountyId) => {
        try {
            console.log('Loading wards for sub-county ID:', subCountyId);
            // Try with subCountyId first, then fallback to subCounty name
            const response = await regionalService.getWardsData({ subCountyId });
            console.log('Wards response:', response);
            const wards = response.wards || [];
            console.log('Wards count from API:', wards.length);
            
            // Filter wards by sub-county name as a fallback if API doesn't filter
            const subCountyName = availableSubCounties.find(sc => sc.subcountyId === subCountyId)?.subcountyName;
            if (subCountyName) {
                const filteredWards = wards.filter(ward => 
                    ward.subcountyName === subCountyName
                );
                console.log('Filtered wards count:', filteredWards.length);
                setAvailableWards(filteredWards);
            } else {
                setAvailableWards(wards);
            }
        } catch (error) {
            console.error('Error fetching wards with subCountyId:', error);
            // Try with subCounty name as fallback
            try {
                const subCountyName = availableSubCounties.find(sc => sc.subcountyId === subCountyId)?.subcountyName;
                if (subCountyName) {
                    console.log('Trying with sub-county name:', subCountyName);
                    const response = await regionalService.getWardsData({ subCounty: subCountyName });
                    console.log('Wards response with name:', response);
                    const wards = response.wards || [];
                    // Filter wards by sub-county name as a fallback if API doesn't filter
                    const filteredWards = wards.filter(ward => 
                        ward.subcountyName === subCountyName
                    );
                    console.log('Filtered wards count with name:', filteredWards.length);
                    setAvailableWards(filteredWards);
                } else {
                    setAvailableWards([]);
                }
            } catch (nameError) {
                console.error('Error fetching wards with subCounty name:', nameError);
                setAvailableWards([]);
            }
        }
    };

    // Handle sub-county change
    const handleSubCountyChange = (subCountyName) => {
        console.log('Sub-county changed to:', subCountyName);
        onFilterChange('subCounty', subCountyName);
        onFilterChange('ward', ''); // Clear ward selection
        
        if (!subCountyName) {
            console.log('No sub-county selected, clearing wards');
            setAvailableWards([]);
            return;
        }
        
        // Load wards for the selected sub-county
        loadWardsForSubCountyByName(subCountyName);
    };

    // Debug logging
    console.log('DashboardFilters render - filterOptions:', filterOptions);
    console.log('DashboardFilters render - isLoadingOptions:', isLoadingOptions);
    console.log('DashboardFilters render - filters:', filters);
    console.log('DashboardFilters render - availableSubCounties:', availableSubCounties);
    console.log('DashboardFilters render - availableWards:', availableWards);
    console.log('DashboardFilters render - availableWards length:', availableWards.length);
    console.log('DashboardFilters render - current subCounty filter:', filters.subCounty);

    // Check if there are active filters
    const hasActiveFilters = filters.cidpPeriod || filters.financialYear || filters.startDate || filters.endDate || 
                             filters.projectType || filters.projectStatus || filters.department || filters.section || 
                             filters.subCounty || filters.ward || filters.globalSearch;

    // Create a summary of active filters for the collapsed view
    const getFilterSummary = () => {
        const activeFilters = [];
        if (filters.cidpPeriod) activeFilters.push(`CIDP: ${filters.cidpPeriod}`);
        if (filters.financialYear) activeFilters.push(`Year: ${filters.financialYear}`);
        if (filters.projectType) activeFilters.push(`Type: ${filters.projectType}`);
        if (filters.projectStatus) activeFilters.push(`Status: ${filters.projectStatus}`);
        if (filters.department) activeFilters.push(`Dept: ${filters.department}`);
        if (filters.section) activeFilters.push(`Section: ${filters.section}`);
        if (filters.subCounty) activeFilters.push(`Sub-County: ${filters.subCounty}`);
        if (filters.ward) activeFilters.push(`Ward: ${filters.ward}`);
        if (filters.startDate) activeFilters.push(`From: ${filters.startDate}`);
        if (filters.endDate) activeFilters.push(`To: ${filters.endDate}`);
        return activeFilters.length > 0 ? activeFilters.join(' • ') : '';
    };

    return (
        <Paper 
            elevation={1}
            sx={{ 
                mb: 1, 
                borderRadius: 2, 
                p: open ? 0.75 : 0.5,
                transition: 'all 0.3s ease'
            }}
        >
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: open ? 1 : 0,
                gap: 1
            }}>
                {!open && (
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        flex: 1,
                        minWidth: 0
                    }}>
                        {/* Global Search Field */}
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search projects, departments, or keywords..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={handleSearchKeyPress}
                            sx={{
                                flex: 1,
                                '& .MuiOutlinedInput-root': {
                                    height: '32px',
                                    fontSize: '0.8125rem',
                                    backgroundColor: 'background.paper'
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton
                                            size="small"
                                            onClick={handleSearch}
                                            edge="start"
                                            sx={{ 
                                                fontSize: 14,
                                                color: 'primary.main',
                                                '&:hover': {
                                                    backgroundColor: 'primary.light',
                                                    color: 'primary.contrastText'
                                                }
                                            }}
                                        >
                                            <Search sx={{ fontSize: 16 }} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                endAdornment: (searchInput || filters.globalSearch) && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={handleClearSearch}
                                            edge="end"
                                            sx={{ fontSize: 14 }}
                                        >
                                            <ClearIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        {/* Active Filters Summary (if any) */}
                        {getFilterSummary() && (
                            <Box sx={{ 
                                display: { xs: 'none', sm: 'flex' },
                                alignItems: 'center',
                                ml: 1,
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                backgroundColor: 'primary.light',
                                maxWidth: '300px'
                            }}>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        fontSize: '0.7rem',
                                        color: 'primary.contrastText',
                                        fontWeight: 500,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {getFilterSummary()}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: open ? 'auto' : 0, flexShrink: 0 }}>
                    {open && (
                        <IconButton
                            onClick={onClearFilters}
                            disabled={!hasActiveFilters && !filters.globalSearch}
                            size="small"
                            sx={{
                                backgroundColor: (hasActiveFilters || filters.globalSearch) ? 'error.light' : 'grey.200',
                                color: (hasActiveFilters || filters.globalSearch) ? 'white' : 'grey.500',
                                height: '28px',
                                width: '28px',
                                '&:hover': {
                                    backgroundColor: (hasActiveFilters || filters.globalSearch) ? 'error.main' : 'grey.300'
                                }
                            }}
                        >
                            <ClearIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    )}
                    <IconButton 
                        onClick={handleToggleCollapse} 
                        size="small" 
                        sx={{ 
                            height: '28px', 
                            width: '28px',
                            color: 'text.secondary'
                        }}
                    >
                        {open ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}
                    </IconButton>
                </Box>
            </Box>

            <Collapse in={open}>
                <Grid container spacing={0.75} alignItems="center">
                    {/* County Display */}
                    <Grid item xs={6} sm={3} md={2}>
                        <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="county-label" sx={{ fontSize: '0.8125rem' }}>County</InputLabel>
                            <Select
                                labelId="county-label"
                                value={DEFAULT_COUNTY.name}
                                label="County"
                                disabled={true}
                                sx={{ 
                                    height: '32px', 
                                    fontSize: '0.8125rem',
                                    '& .MuiSelect-select': {
                                        py: 0.5
                                    }
                                }}
                            >
                                <MenuItem value={DEFAULT_COUNTY.name} sx={{ fontSize: '0.8125rem' }}>
                                    {DEFAULT_COUNTY.name}
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* CIDP Period */}
                    <Grid item xs={6} sm={3} md={2}>
                        <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="cidp-period-label" sx={{ fontSize: '0.8125rem' }}>CIDP Period</InputLabel>
                            <Select
                                labelId="cidp-period-label"
                                value={filters.cidpPeriod || ''}
                                onChange={(e) => onFilterChange('cidpPeriod', e.target.value)}
                                label="CIDP Period"
                                sx={{ 
                                    height: '32px', 
                                    fontSize: '0.8125rem',
                                    '& .MuiSelect-select': {
                                        py: 0.5
                                    }
                                }}
                            >
                                <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>All</MenuItem>
                                <MenuItem value="CIDP 2023-2027" sx={{ fontSize: '0.8125rem' }}>CIDP 2023-2027</MenuItem>
                                <MenuItem value="CIDP 2018-2022" sx={{ fontSize: '0.8125rem' }}>CIDP 2018-2022</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Financial Year */}
                    <Grid item xs={6} sm={3} md={2}>
                        <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="financial-year-label" sx={{ fontSize: '0.8125rem' }}>Financial Year</InputLabel>
                            <Select
                                labelId="financial-year-label"
                                value={filters.financialYear || ''}
                                onChange={(e) => onFilterChange('financialYear', e.target.value)}
                                label="Financial Year"
                                disabled={isLoadingOptions}
                                sx={{ 
                                    height: '32px', 
                                    fontSize: '0.8125rem',
                                    '& .MuiSelect-select': {
                                        py: 0.5
                                    }
                                }}
                            >
                                <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>All</MenuItem>
                                {filterOptions.financialYears.map((year) => (
                                    <MenuItem key={year.id} value={year.id} sx={{ fontSize: '0.8125rem' }}>
                                        {year.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Start Date */}
                    <Grid item xs={6} sm={3} md={2}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Start Date"
                            type="date"
                            value={filters.startDate || ''}
                            onChange={(e) => onFilterChange('startDate', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                    height: '32px',
                                    fontSize: '0.8125rem'
                                } 
                            }}
                        />
                    </Grid>

                    {/* End Date */}
                    <Grid item xs={6} sm={3} md={2}>
                        <TextField
                            fullWidth
                            size="small"
                            label="End Date"
                            type="date"
                            value={filters.endDate || ''}
                            onChange={(e) => onFilterChange('endDate', e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{ 
                                '& .MuiOutlinedInput-root': { 
                                    height: '32px',
                                    fontSize: '0.8125rem'
                                } 
                            }}
                        />
                    </Grid>

                    {/* Project Type */}
                    <Grid item xs={6} sm={3} md={2}>
                        <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="project-type-label" sx={{ fontSize: '0.8125rem' }}>Project Type</InputLabel>
                            <Select
                                labelId="project-type-label"
                                value={filters.projectType || ''}
                                onChange={(e) => onFilterChange('projectType', e.target.value)}
                                label="Project Type"
                                disabled={isLoadingOptions}
                                sx={{ 
                                    height: '32px', 
                                    fontSize: '0.8125rem',
                                    '& .MuiSelect-select': {
                                        py: 0.5
                                    }
                                }}
                            >
                                <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>All</MenuItem>
                                {filterOptions.projectTypes.map((type) => (
                                    <MenuItem key={type.name} value={type.name} sx={{ fontSize: '0.8125rem' }}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Project Status */}
                    <Grid item xs={6} sm={3} md={2}>
                        <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="project-status-label" sx={{ fontSize: '0.8125rem' }}>Status</InputLabel>
                            <Select
                                labelId="project-status-label"
                                value={filters.projectStatus || ''}
                                onChange={(e) => onFilterChange('projectStatus', e.target.value)}
                                label="Status"
                                disabled={isLoadingOptions}
                                sx={{ 
                                    height: '32px', 
                                    fontSize: '0.8125rem',
                                    '& .MuiSelect-select': {
                                        py: 0.5
                                    }
                                }}
                            >
                                <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>All</MenuItem>
                                {NORMALIZED_STATUSES.map((status) => (
                                    <MenuItem key={status.name} value={status.name} sx={{ fontSize: '0.8125rem' }}>
                                        {status.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Department */}
                    <Grid item xs={6} sm={3} md={2}>
                        <FormControl fullWidth size="small" sx={{ minWidth: 140 }}>
                            <InputLabel id="department-label" sx={{ fontSize: '0.8125rem' }}>Department</InputLabel>
                            <Select
                                labelId="department-label"
                                value={filters.department || ''}
                                onChange={(e) => onFilterChange('department', e.target.value)}
                                label="Department"
                                disabled={isLoadingOptions}
                                sx={{ 
                                    height: '32px', 
                                    fontSize: '0.8125rem',
                                    '& .MuiSelect-select': {
                                        py: 0.5
                                    }
                                }}
                            >
                                <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>All</MenuItem>
                                {filterOptions.departments.map((dept) => (
                                    <MenuItem key={dept.name} value={dept.name} sx={{ fontSize: '0.8125rem' }}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Section */}
                    <Grid item xs={6} sm={3} md={2}>
                        <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="section-label" sx={{ fontSize: '0.8125rem' }}>Section</InputLabel>
                            <Select
                                labelId="section-label"
                                value={filters.section || ''}
                                onChange={(e) => onFilterChange('section', e.target.value)}
                                label="Section"
                                disabled={isLoadingOptions}
                                sx={{ 
                                    height: '32px', 
                                    fontSize: '0.8125rem',
                                    '& .MuiSelect-select': {
                                        py: 0.5
                                    }
                                }}
                            >
                                <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>All</MenuItem>
                                {filterOptions.sections.map((section) => (
                                    <MenuItem key={section.name} value={section.name} sx={{ fontSize: '0.8125rem' }}>
                                        {section.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Sub-County */}
                    <Grid item xs={6} sm={3} md={2}>
                        <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="sub-county-label" sx={{ fontSize: '0.8125rem' }}>Sub-County</InputLabel>
                            <Select
                                labelId="sub-county-label"
                                value={filters.subCounty || ''}
                                onChange={(e) => handleSubCountyChange(e.target.value)}
                                label="Sub-County"
                                disabled={isLoadingOptions}
                                sx={{ 
                                    height: '32px', 
                                    fontSize: '0.8125rem',
                                    '& .MuiSelect-select': {
                                        py: 0.5
                                    }
                                }}
                            >
                                <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>All</MenuItem>
                                {availableSubCounties.map((subCounty) => (
                                    <MenuItem key={subCounty.subcountyId} value={subCounty.subcountyName} sx={{ fontSize: '0.8125rem' }}>
                                        {subCounty.subcountyName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Ward */}
                    <Grid item xs={6} sm={3} md={2}>
                        <FormControl fullWidth size="small" sx={{ minWidth: 120 }}>
                            <InputLabel id="ward-label" sx={{ fontSize: '0.8125rem' }}>Ward</InputLabel>
                            <Select
                                labelId="ward-label"
                                value={filters.ward || ''}
                                onChange={(e) => onFilterChange('ward', e.target.value)}
                                label="Ward"
                                disabled={isLoadingOptions || availableWards.length === 0}
                                sx={{ 
                                    height: '32px', 
                                    fontSize: '0.8125rem',
                                    '& .MuiSelect-select': {
                                        py: 0.5
                                    }
                                }}
                            >
                                <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>All</MenuItem>
                                {availableWards.map((ward) => (
                                    <MenuItem key={ward.wardId} value={ward.wardName} sx={{ fontSize: '0.8125rem' }}>
                                        {ward.wardName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Collapse>
        </Paper>
    );
};

export default DashboardFilters;
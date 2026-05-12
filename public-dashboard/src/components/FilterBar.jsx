import React, { useState, useEffect } from 'react';
import {
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Search,
  Clear
} from '@mui/icons-material';
import { getDepartments, getSubCounties, getWardStats } from '../services/publicApi';

const FilterBar = ({ 
  financialYears, 
  selectedFinYear, 
  onFinYearChange,
  onFiltersChange,
  finYearId 
}) => {
  const [departments, setDepartments] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedSubcounty, setSelectedSubcounty] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [projectSearch, setProjectSearch] = useState('');

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    // Update wards when subcounty changes
    if (selectedSubcounty) {
      fetchWardsForSubcounty(selectedSubcounty);
    } else {
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedSubcounty, finYearId]);

  useEffect(() => {
    // Apply filters whenever any filter changes
    const filters = {
      department: selectedDepartment,
      subcounty: selectedSubcounty,
      ward: selectedWard,
      status: selectedStatus,
      projectSearch: projectSearch.trim()
    };
    onFiltersChange(filters);
  }, [selectedDepartment, selectedSubcounty, selectedWard, selectedStatus, projectSearch]); // Remove onFiltersChange from dependencies to prevent infinite loops

  const fetchMetadata = async () => {
    try {
      setLoading(true);
      const [deptData, subcountyData] = await Promise.all([
        getDepartments(),
        getSubCounties()
      ]);
      
      setDepartments(deptData || []);
      setSubcounties(subcountyData || []);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWardsForSubcounty = async (subcountyId) => {
    try {
      const wardData = await getWardStats(finYearId || null);
      // Filter wards by subcounty ID
      const filteredWards = (wardData || []).filter(ward => {
        const wardSubcountyId = ward.subcounty_id || ward.subcountyId;
        return wardSubcountyId && (wardSubcountyId.toString() === subcountyId.toString() || wardSubcountyId === subcountyId);
      });
      setWards(filteredWards);
    } catch (err) {
      console.error('Error fetching wards:', err);
      setWards([]);
    }
  };

  const handleClearFilters = () => {
    setSelectedDepartment('');
    setSelectedSubcounty('');
    setSelectedWard('');
    setSelectedStatus('');
    setProjectSearch('');
  };

  const hasActiveFilters = selectedDepartment || selectedSubcounty || selectedWard || selectedStatus || projectSearch.trim();

  const statuses = ['Completed', 'Ongoing', 'Not Started', 'Under Procurement', 'Stalled', 'Suspended'];

  return (
    <Paper sx={{ mb: 1.5, borderRadius: 2, p: 0.75 }} elevation={1}>
      <Grid container spacing={0.75} alignItems="center">
        {/* Financial Year Dropdown */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="financial-year-label" sx={{ fontSize: '0.8125rem' }}>Year</InputLabel>
            <Select
              labelId="financial-year-label"
              value={selectedFinYear === null ? 'all' : (selectedFinYear?.id || '')}
              label="Year"
              onChange={(e) => {
                if (e.target.value === 'all') {
                  onFinYearChange(null); // null means "All"
                } else {
                  const fy = financialYears.find(f => f.id === e.target.value);
                  onFinYearChange(fy);
                }
              }}
              sx={{ height: '32px', fontSize: '0.8125rem' }}
            >
              <MenuItem value="all" sx={{ fontSize: '0.8125rem' }}>
                All Years
              </MenuItem>
              {financialYears.map((fy) => (
                <MenuItem key={fy.id} value={fy.id} sx={{ fontSize: '0.8125rem' }}>
                  {fy.name} ({fy.project_count || 0})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Department Filter */}
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="department-label" sx={{ fontSize: '0.8125rem' }}>Department</InputLabel>
            <Select
              labelId="department-label"
              value={selectedDepartment}
              label="Department"
              onChange={(e) => setSelectedDepartment(e.target.value)}
              sx={{ height: '32px', fontSize: '0.8125rem' }}
            >
              <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>
                All
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.departmentId || dept.id} value={dept.departmentId || dept.id} sx={{ fontSize: '0.8125rem' }}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Subcounty Filter */}
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="subcounty-label" sx={{ fontSize: '0.8125rem' }}>Subcounty</InputLabel>
            <Select
              labelId="subcounty-label"
              value={selectedSubcounty}
              label="Subcounty"
              onChange={(e) => setSelectedSubcounty(e.target.value)}
              sx={{ height: '32px', fontSize: '0.8125rem' }}
            >
              <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>
                All
              </MenuItem>
              {subcounties.map((subcounty) => (
                <MenuItem key={subcounty.subcountyId || subcounty.id} value={subcounty.subcountyId || subcounty.id} sx={{ fontSize: '0.8125rem' }}>
                  {subcounty.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Ward Filter */}
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth size="small" disabled={!selectedSubcounty}>
            <InputLabel id="ward-label" sx={{ fontSize: '0.8125rem' }}>Ward</InputLabel>
            <Select
              labelId="ward-label"
              value={selectedWard}
              label="Ward"
              onChange={(e) => setSelectedWard(e.target.value)}
              sx={{ height: '32px', fontSize: '0.8125rem' }}
            >
              <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>
                All
              </MenuItem>
              {wards.map((ward) => (
                <MenuItem key={ward.wardId || ward.id || ward.ward_id} value={ward.wardId || ward.id || ward.ward_id} sx={{ fontSize: '0.8125rem' }}>
                  {ward.name || ward.ward_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Status Filter */}
        <Grid item xs={6} sm={3} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel id="status-label" sx={{ fontSize: '0.8125rem' }}>Status</InputLabel>
            <Select
              labelId="status-label"
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
              sx={{ height: '32px', fontSize: '0.8125rem' }}
            >
              <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>
                All
              </MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status} value={status} sx={{ fontSize: '0.8125rem' }}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Project Search */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search projects..."
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                height: '32px',
                fontSize: '0.8125rem'
              } 
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 14, color: 'text.secondary' }} />
                </InputAdornment>
              ),
              endAdornment: projectSearch && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setProjectSearch('')}
                    edge="end"
                    sx={{ fontSize: 14 }}
                  >
                    <Clear sx={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* Clear Filters Button */}
        <Grid item xs={12} sm={6} md={1} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', md: 'center' } }}>
          <IconButton
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            size="small"
            sx={{
              backgroundColor: hasActiveFilters ? 'error.light' : 'grey.200',
              color: hasActiveFilters ? 'white' : 'grey.500',
              height: '32px',
              width: '32px',
              '&:hover': {
                backgroundColor: hasActiveFilters ? 'error.main' : 'grey.300'
              }
            }}
          >
            <Clear sx={{ fontSize: 16 }} />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FilterBar;

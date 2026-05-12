// src/components/FilterPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  useTheme,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import apiService from '../api';
import { tokens } from '../pages/dashboard/theme';

const initialFilters = {
  county: 'All',
  subCounty: 'All',
  gender: 'All',
  minAge: '',
  maxAge: '',
  occupation: 'All',
  educationLevel: 'All',
  malariaStatus: 'All',
  dengueStatus: 'All',
  mosquitoNetUse: 'All',
  minRainfall: '',
  maxRainfall: '',
  minTemp: '',
  maxTemp: '',
  minHouseholdSize: '',
  maxHouseholdSize: '',
  healthcareAccess: 'All',
  searchIndividualId: '',
};

function FilterPanel({ onApplyFilters }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isLight = theme.palette.mode === 'light';
  
  const [filters, setFilters] = useState(initialFilters);
  const [filterOptions, setFilterOptions] = useState({});
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const options = await apiService.getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleApply = () => {
    onApplyFilters({ ...filters });
  };

  const handleReset = () => {
    setFilters(initialFilters);
    onApplyFilters(initialFilters);
  };

  if (loadingOptions) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading Filters...</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Quick filters row */}
      <Box sx={{ mb: 1.5 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth
              label="Search Individual ID"
              name="searchIndividualId"
              value={filters.searchIndividualId}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>County</InputLabel>
              <Select name="county" value={filters.county} onChange={handleChange} label="County">
                <MenuItem value="All">All</MenuItem>
                {filterOptions.counties?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Sub-County</InputLabel>
              <Select name="subCounty" value={filters.subCounty} onChange={handleChange} label="Sub-County">
                <MenuItem value="All">All</MenuItem>
                {filterOptions.subCounties?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>Gender</InputLabel>
              <Select name="gender" value={filters.gender} onChange={handleChange} label="Gender">
                <MenuItem value="All">All</MenuItem>
                {filterOptions.genders?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField fullWidth label="Min Age" name="minAge" type="number" value={filters.minAge} onChange={handleChange} size="small" />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField fullWidth label="Max Age" name="maxAge" type="number" value={filters.maxAge} onChange={handleChange} size="small" />
          </Grid>
          <Grid item xs={12} md="auto">
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ ml: { xs: 0, md: 'auto' } }}>
              <Button variant="contained" onClick={handleApply} startIcon={<FilterListIcon />} size="small"
                sx={{ backgroundColor: isLight ? colors.blueAccent[600] : colors.blueAccent[700], '&:hover': { backgroundColor: isLight ? colors.blueAccent[700] : colors.blueAccent[600] } }}
              >Apply</Button>
              <Button variant="outlined" onClick={handleReset} startIcon={<ClearAllIcon />} size="small"
                sx={{ borderColor: isLight ? theme.palette.divider : colors.grey[400], color: isLight ? theme.palette.text.primary : colors.grey[100] }}
              >Reset</Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Accordion
        sx={{ 
          mb: 3, 
          borderRadius: '12px',
          boxShadow: isLight ? '0 1px 8px rgba(0,0,0,0.06)' : 3,
          backgroundColor: isLight ? theme.palette.background.paper : colors.primary[400],
          border: `1px solid ${isLight ? theme.palette.grey[300] : colors.blueAccent[700]}`,
        }}
      >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: isLight ? colors.blueAccent[900] : '#fff' }} />}
        aria-controls="filter-panel-content"
        id="filter-panel-header"
        sx={{ 
          backgroundColor: isLight ? colors.blueAccent[100] : colors.blueAccent[700],
          color: isLight ? colors.blueAccent[900] : '#fff',
          '&:hover': { backgroundColor: isLight ? colors.blueAccent[200] : colors.blueAccent[600] },
          '&.Mui-expanded': { backgroundColor: isLight ? colors.blueAccent[100] : colors.blueAccent[700] },
          borderBottom: `1px solid ${isLight ? '#e0e7ff' : 'transparent'}`,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
        }}
      >
        <FilterListIcon sx={{ mr: 1, color: isLight ? colors.blueAccent[900] : '#fff' }} />
        <Typography variant="h6" sx={{ color: isLight ? colors.blueAccent[900] : '#fff', fontWeight: 'bold' }}>Filter Data</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ 
        p: 2, 
        backgroundColor: isLight ? theme.palette.background.paper : colors.primary[400],
        borderTop: `2px solid ${isLight ? '#e0e7ff' : colors.blueAccent[700]}`,
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px'
      }}>
        <Grid container spacing={1}>
          {/* Search by Individual ID */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Individual ID"
              name="searchIndividualId"
              value={filters.searchIndividualId}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>

          {/* Geographic Filters */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ minWidth: '140px' }}>
              <InputLabel>County</InputLabel>
              <Select
                name="county"
                value={filters.county}
                onChange={handleChange}
                label="County"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.counties?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ minWidth: '140px' }}>
              <InputLabel>Sub-County</InputLabel>
              <Select
                name="subCounty"
                value={filters.subCounty}
                onChange={handleChange}
                label="Sub-County"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.subCounties?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Demographic Filters */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ minWidth: '120px' }}>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={filters.gender}
                onChange={handleChange}
                label="Gender"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.genders?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Age"
              name="minAge"
              type="number"
              value={filters.minAge}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Age"
              name="maxAge"
              type="number"
              value={filters.maxAge}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ minWidth: '140px' }}>
              <InputLabel>Occupation</InputLabel>
              <Select
                name="occupation"
                value={filters.occupation}
                onChange={handleChange}
                label="Occupation"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.occupations?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ minWidth: '160px' }}>
              <InputLabel>Education Level</InputLabel>
              <Select
                name="educationLevel"
                value={filters.educationLevel}
                onChange={handleChange}
                label="Education Level"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.educationLevels?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Health Status Filters */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ minWidth: '140px' }}>
              <InputLabel>Malaria Status</InputLabel>
              <Select
                name="malariaStatus"
                value={filters.malariaStatus}
                onChange={handleChange}
                label="Malaria Status"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.malariaStatuses?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ minWidth: '140px' }}>
              <InputLabel>Dengue Status</InputLabel>
              <Select
                name="dengueStatus"
                value={filters.dengueStatus}
                onChange={handleChange}
                label="Dengue Status"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.dengueStatuses?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ minWidth: '160px' }}>
              <InputLabel>Mosquito Net Use</InputLabel>
              <Select
                name="mosquitoNetUse"
                value={filters.mosquitoNetUse}
                onChange={handleChange}
                label="Mosquito Net Use"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.mosquitoNetUses?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Environmental Filters */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Rainfall (mm)"
              name="minRainfall"
              type="number"
              value={filters.minRainfall}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Rainfall (mm)"
              name="maxRainfall"
              type="number"
              value={filters.maxRainfall}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Temp (°C)"
              name="minTemp"
              type="number"
              value={filters.minTemp}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Temp (°C)"
              name="maxTemp"
              type="number"
              value={filters.maxTemp}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>

          {/* Household Filters */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Min Household Size"
              name="minHouseholdSize"
              type="number"
              value={filters.minHouseholdSize}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Max Household Size"
              name="maxHouseholdSize"
              type="number"
              value={filters.maxHouseholdSize}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined" size="small" sx={{ minWidth: '160px' }}>
              <InputLabel>Healthcare Access</InputLabel>
              <Select
                name="healthcareAccess"
                value={filters.healthcareAccess}
                onChange={handleChange}
                label="Healthcare Access"
              >
                <MenuItem value="All">All</MenuItem>
                {filterOptions.healthcareAccessOptions?.map((option) => (
                  <MenuItem key={option} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12} display="flex" justifyContent="flex-end" gap={1.5}>
            <Button
              variant="contained"
              onClick={handleApply}
              startIcon={<FilterListIcon />}
              sx={{ 
                backgroundColor: isLight ? colors.blueAccent[600] : colors.blueAccent[700],
                color: '#fff',
                borderColor: isLight ? colors.blueAccent[600] : colors.blueAccent[700],
                '&:hover': { backgroundColor: isLight ? colors.blueAccent[700] : colors.blueAccent[600], borderColor: isLight ? colors.blueAccent[700] : colors.blueAccent[600] },
                fontWeight: 'bold',
                borderRadius: '8px',
                px: 3,
                py: 1.5,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              onClick={handleReset}
              startIcon={<ClearAllIcon />}
              sx={{
                borderColor: isLight ? theme.palette.divider : colors.grey[400],
                color: isLight ? theme.palette.text.primary : colors.grey[100],
                '&:hover': { backgroundColor: isLight ? theme.palette.action.hover : colors.primary[500], borderColor: isLight ? theme.palette.text.primary : colors.grey[100], color: isLight ? theme.palette.text.primary : colors.grey[100] },
                fontWeight: 'bold',
                borderRadius: '8px',
                px: 3,
                py: 1.5
              }}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
    </>
  );
}

export default FilterPanel;
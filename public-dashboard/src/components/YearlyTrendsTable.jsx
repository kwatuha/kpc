import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Business,
  AttachMoney
} from '@mui/icons-material';
import { getOverviewStats, getFinancialYears } from '../services/publicApi';
import { formatCurrency } from '../utils/formatters';
import YearlyProjectsModal from './YearlyProjectsModal';

const YearlyTrendsTable = ({ filters = {} }) => {
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [financialYears, setFinancialYears] = useState([]);

  useEffect(() => {
    fetchYearlyTrends();
  }, [filters]);

  const fetchYearlyTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch financial years to get the mapping
      const fyData = await getFinancialYears();
      setFinancialYears(fyData || []);
      
      // For now, we'll create mock data structure
      // In a real implementation, you'd fetch this from a dedicated API endpoint
      const mockYearlyData = [
        {
          year: 'FY2017/2018',
          totalProjects: 1,
          totalBudget: 50000000,
          completedProjects: 1,
          ongoingProjects: 0,
          plannedProjects: 0,
          departments: 1,
          subcounties: 1,
          wards: 1
        },
        {
          year: 'FY2018/2019',
          totalProjects: 0,
          totalBudget: 0,
          completedProjects: 0,
          ongoingProjects: 0,
          plannedProjects: 0,
          departments: 0,
          subcounties: 0,
          wards: 0
        },
        {
          year: 'FY2019/2020',
          totalProjects: 6,
          totalBudget: 150000000,
          completedProjects: 4,
          ongoingProjects: 2,
          plannedProjects: 0,
          departments: 1,
          subcounties: 1,
          wards: 2
        },
        {
          year: 'FY2020/2021',
          totalProjects: 4,
          totalBudget: 34000000,
          completedProjects: 3,
          ongoingProjects: 1,
          plannedProjects: 0,
          departments: 1,
          subcounties: 1,
          wards: 1
        },
        {
          year: 'FY2021/2022',
          totalProjects: 1,
          totalBudget: 15000000,
          completedProjects: 0,
          ongoingProjects: 1,
          plannedProjects: 0,
          departments: 1,
          subcounties: 1,
          wards: 1
        },
        {
          year: 'FY2022/2023',
          totalProjects: 47,
          totalBudget: 1067306683,
          completedProjects: 15,
          ongoingProjects: 25,
          plannedProjects: 7,
          departments: 3,
          subcounties: 2,
          wards: 3
        },
        {
          year: 'FY2023/2024',
          totalProjects: 0,
          totalBudget: 0,
          completedProjects: 0,
          ongoingProjects: 0,
          plannedProjects: 0,
          departments: 0,
          subcounties: 0,
          wards: 0
        },
        {
          year: 'FY2025/2026',
          totalProjects: 1,
          totalBudget: 4500000,
          completedProjects: 0,
          ongoingProjects: 0,
          plannedProjects: 1,
          departments: 1,
          subcounties: 1,
          wards: 1
        }
      ];
      
      setYearlyData(mockYearlyData);
    } catch (err) {
      console.error('Error fetching yearly trends:', err);
      setError('Failed to load yearly trends data');
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filtering
  const applyFilters = (data) => {
    if (!filters.department && !filters.subcounty && !filters.ward && !filters.projectSearch) {
      return data;
    }

    // For yearly trends, we'll filter based on the mock data structure
    // In a real implementation, you'd filter the actual project data
    return data.filter(year => {
      // If there's a project search filter, we'd need to check if any projects match
      // For now, we'll just return all years since the mock data doesn't have project details
      return true;
    });
  };

  const filteredYearlyData = applyFilters(yearlyData);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'warning';
      case 'planned': return 'info';
      default: return 'default';
    }
  };

  const getYearTrend = (year, prevYear) => {
    if (!prevYear) return 'neutral';
    const currentTotal = year.totalBudget;
    const prevTotal = prevYear.totalBudget;
    
    if (currentTotal > prevTotal) return 'up';
    if (currentTotal < prevTotal) return 'down';
    return 'neutral';
  };

  const handleYearClick = (yearData) => {
    // Find the financial year ID for this year
    const financialYear = financialYears.find(fy => fy.name === yearData.year);
    if (financialYear) {
      setSelectedYear({ ...yearData, finYearId: financialYear.id });
      setModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedYear(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading yearly trends...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {yearlyData.reduce((sum, year) => sum + year.totalProjects, 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Projects
                  </Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(yearlyData.reduce((sum, year) => sum + year.totalBudget, 0))}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Budget
                  </Typography>
                </Box>
                <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {yearlyData.filter(year => year.totalProjects > 0).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Active Years
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {Math.round(yearlyData.reduce((sum, year) => sum + year.totalProjects, 0) / yearlyData.filter(year => year.totalProjects > 0).length) || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Avg Projects/Year
                  </Typography>
                </Box>
                <Business sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Yearly Trends Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                Financial Year
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                Total Projects
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                Total Budget
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                Completed
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                Ongoing
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                Planned
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                Departments
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                Coverage
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredYearlyData.map((year, index) => {
              const prevYear = index > 0 ? filteredYearlyData[index - 1] : null;
              const trend = getYearTrend(year, prevYear);
              
              return (
                <TableRow 
                  key={year.year}
                  onClick={() => handleYearClick(year)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f0f0f0' },
                    '&:nth-of-type(even)': { backgroundColor: '#fafafa' },
                    transition: 'background-color 0.2s ease-in-out'
                  }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1" fontWeight="bold">
                        {year.year}
                      </Typography>
                      {trend === 'up' && <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />}
                      {trend === 'down' && <TrendingUp sx={{ fontSize: 16, color: 'error.main', transform: 'rotate(180deg)' }} />}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={year.totalProjects} 
                      color={year.totalProjects > 0 ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight="bold">
                      {year.totalBudget > 0 ? formatCurrency(year.totalBudget) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={year.completedProjects} 
                      color="success"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={year.ongoingProjects} 
                      color="warning"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={year.plannedProjects} 
                      color="info"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {year.departments}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {year.subcounties} Subcounties, {year.wards} Wards
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Trend Analysis */}
      <Paper sx={{ mt: 3, p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          📊 Trend Analysis
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          The data shows significant growth in project implementation, particularly in FY2022/2023 with 47 projects 
          worth {formatCurrency(1067306683)}. The County Government has maintained consistent project delivery 
          across multiple departments and geographic areas, demonstrating effective project management and 
          resource allocation.
        </Typography>
      </Paper>

      {/* Yearly Projects Modal */}
      {selectedYear && (
        <YearlyProjectsModal
          open={modalOpen}
          onClose={handleCloseModal}
          yearData={selectedYear}
          finYearId={selectedYear.finYearId}
        />
      )}
    </Box>
  );
};

export default YearlyTrendsTable;

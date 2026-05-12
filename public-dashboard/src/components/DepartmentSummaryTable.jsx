import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  alpha,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Business,
  Visibility,
  TrendingUp
} from '@mui/icons-material';
import DepartmentProjectsModal from './DepartmentProjectsModal';
import { getDepartmentStats } from '../services/publicApi';
import { formatCurrency, getStatusColor } from '../utils/formatters';

const DepartmentSummaryTable = ({ finYearId, filters = {} }) => {
  const theme = useTheme();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchDepartmentStats();
  }, [finYearId, filters]);

  const fetchDepartmentStats = async () => {
    try {
      setLoading(true);
      const data = await getDepartmentStats(finYearId, filters);
      setDepartments(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching department stats:', err);
      setError('Failed to load department statistics');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentClick = (department) => {
    setSelectedDepartment(department);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDepartment(null);
  };

  // Use the normalized status color from formatters

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
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

  if (departments.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Business sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No department data available
        </Typography>
      </Paper>
    );
  }

  // Calculate totals
  const totals = departments.reduce((acc, dept) => ({
    completed: acc.completed + (dept.completed_projects || 0),
    ongoing: acc.ongoing + (dept.ongoing_projects || 0),
    stalled: acc.stalled + (dept.stalled_projects || 0),
    notStarted: acc.notStarted + (dept.not_started_projects || 0),
    underProcurement: acc.underProcurement + (dept.under_procurement_projects || 0),
    suspended: acc.suspended + (dept.suspended_projects || 0),
    other: acc.other + (dept.other_projects || 0),
    total: acc.total + (dept.total_projects || 0),
    budget: acc.budget + (parseFloat(dept.total_budget) || 0)
  }), { completed: 0, ongoing: 0, stalled: 0, notStarted: 0, underProcurement: 0, suspended: 0, other: 0, total: 0, budget: 0 });

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <Business color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Projects per Department
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Click on any department to view detailed project breakdown
        </Typography>
      </Box>

      <TableContainer 
        component={Paper} 
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          '& .MuiTableCell-head': {
            fontWeight: 'bold',
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }
        }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Department</TableCell>
              <TableCell align="center">Completed</TableCell>
              <TableCell align="center">Ongoing</TableCell>
              <TableCell align="center">Stalled</TableCell>
              <TableCell align="center">Not Started</TableCell>
              <TableCell align="center">Under Procurement</TableCell>
              <TableCell align="center">Suspended</TableCell>
              <TableCell align="center">Other</TableCell>
              <TableCell align="center">All Projects</TableCell>
              <TableCell align="right">Total Budget</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((dept, index) => (
              <TableRow
                key={index}
                hover
                sx={{
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    cursor: 'pointer'
                  },
                  '&:last-child td, &:last-child th': { border: 0 }
                }}
              >
                <TableCell 
                  component="th" 
                  scope="row"
                  onClick={() => handleDepartmentClick(dept)}
                  sx={{ 
                    fontWeight: 500,
                    maxWidth: 300,
                    '&:hover': {
                      color: theme.palette.primary.main
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Business sx={{ fontSize: 20, color: 'text.secondary' }} />
                    {dept.department_name}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={dept.completed_projects || 0}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor('Completed'), 0.1),
                      color: getStatusColor('Completed'),
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={dept.ongoing_projects || 0}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor('Ongoing'), 0.1),
                      color: getStatusColor('Ongoing'),
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={dept.stalled_projects || 0}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor('Stalled'), 0.1),
                      color: getStatusColor('Stalled'),
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={dept.not_started_projects || 0}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor('Not Started'), 0.1),
                      color: getStatusColor('Not Started'),
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={dept.under_procurement_projects || 0}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor('Under Procurement'), 0.1),
                      color: getStatusColor('Under Procurement'),
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={dept.suspended_projects || 0}
                    size="small"
                    sx={{
                      backgroundColor: alpha(getStatusColor('Suspended'), 0.1),
                      color: getStatusColor('Suspended'),
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={dept.other_projects || 0}
                    size="small"
                    sx={{
                      backgroundColor: alpha('#9e9e9e', 0.1),
                      color: '#9e9e9e',
                      fontWeight: 'bold'
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body1" fontWeight="bold" color="primary">
                    {dept.total_projects || 0}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="medium" color="success.main">
                    {formatCurrency(dept.total_budget || 0)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Department Projects">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleDepartmentClick(dept)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            
            {/* Totals Row */}
            <TableRow
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '& td': {
                  fontWeight: 'bold',
                  fontSize: '0.95rem'
                }
              }}
            >
              <TableCell component="th" scope="row">
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUp sx={{ color: 'primary.main' }} />
                  Total
                </Box>
              </TableCell>
              <TableCell align="center">{totals.completed}</TableCell>
              <TableCell align="center">{totals.ongoing}</TableCell>
              <TableCell align="center">{totals.stalled}</TableCell>
              <TableCell align="center">{totals.notStarted}</TableCell>
              <TableCell align="center">{totals.underProcurement}</TableCell>
              <TableCell align="center">{totals.suspended}</TableCell>
              <TableCell align="center">{totals.other}</TableCell>
              <TableCell align="center">
                <Typography variant="body1" fontWeight="bold" color="primary">
                  {totals.total}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  {formatCurrency(totals.budget)}
                </Typography>
              </TableCell>
              <TableCell align="center">-</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Department Projects Modal */}
      {selectedDepartment && (
        <DepartmentProjectsModal
          open={modalOpen}
          onClose={handleCloseModal}
          department={selectedDepartment}
          finYearId={finYearId}
        />
      )}
    </>
  );
};

export default DepartmentSummaryTable;


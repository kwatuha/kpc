import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  useTheme,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Pending as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { tokens } from '../../pages/dashboard/theme';

const PaymentRequestsCard = ({ currentUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Mock data for payment requests
  const [paymentRequests] = useState([
    {
      id: 1,
      projectName: 'Water Treatment Plant Construction',
      amount: 45000,
      currency: 'KES',
      status: 'pending',
      submittedDate: '2024-02-10',
      dueDate: '2024-02-25',
      description: 'Payment for Phase 1 completion - Foundation work',
      invoiceNumber: 'INV-2024-001',
      progress: 75,
    },
    {
      id: 2,
      projectName: 'Healthcare Center Renovation',
      amount: 32000,
      currency: 'KES',
      status: 'approved',
      submittedDate: '2024-02-05',
      approvedDate: '2024-02-08',
      description: 'Payment for electrical installation work',
      invoiceNumber: 'INV-2024-002',
      progress: 100,
    },
    {
      id: 3,
      projectName: 'Road Infrastructure Project',
      amount: 28000,
      currency: 'KES',
      status: 'rejected',
      submittedDate: '2024-01-28',
      rejectedDate: '2024-02-01',
      description: 'Payment for road surfacing materials',
      invoiceNumber: 'INV-2024-003',
      progress: 0,
      rejectionReason: 'Incomplete documentation',
    },
    {
      id: 4,
      projectName: 'School Construction',
      amount: 55000,
      currency: 'KES',
      status: 'pending',
      submittedDate: '2024-02-12',
      dueDate: '2024-02-28',
      description: 'Payment for structural work completion',
      invoiceNumber: 'INV-2024-004',
      progress: 60,
    },
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <PendingIcon />;
      case 'approved':
        return <ApprovedIcon />;
      case 'rejected':
        return <RejectedIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return colors.yellowAccent?.[500] || '#ff9800';
      case 'approved':
        return colors.greenAccent?.[500] || '#4caf50';
      case 'rejected':
        return colors.redAccent?.[500] || '#f44336';
      default:
        return colors.grey[400];
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const handleNewRequest = () => {
    console.log('Creating new payment request');
    // TODO: Implement new payment request functionality
  };

  const handleViewRequest = (requestId) => {
    console.log('Viewing payment request:', requestId);
    // TODO: Implement view payment request functionality
  };

  const totalPending = paymentRequests.filter(req => req.status === 'pending').length;
  const totalApproved = paymentRequests.filter(req => req.status === 'approved').length;
  const totalRejected = paymentRequests.filter(req => req.status === 'rejected').length;

  return (
    <Card sx={{ 
      height: '100%',
      borderRadius: 3, 
      bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : colors.primary[50],
      boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}15`,
      border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200]}30`,
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight="bold" color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}>
            Payment Requests
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${totalPending} pending`}
              size="small"
              sx={{ 
                bgcolor: colors.yellowAccent?.[500] || '#ff9800',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewRequest}
              sx={{ 
                bgcolor: colors.blueAccent?.[500] || '#6870fa',
                fontSize: '0.7rem',
                height: 24,
                minWidth: 60,
                '&:hover': { 
                  bgcolor: colors.blueAccent?.[600] || '#535ac8'
                }
              }}
            >
              New
            </Button>
          </Box>
        </Box>

        {/* Summary Stats */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.greenAccent?.[500] || '#4caf50'}30`,
            flex: 1,
            minWidth: 100
          }}>
            <Typography variant="h6" color={colors.greenAccent?.[500] || '#4caf50'} fontWeight="bold">
              {totalApproved}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Approved
            </Typography>
          </Box>
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.yellowAccent?.[500] || '#ff9800'}30`,
            flex: 1,
            minWidth: 100
          }}>
            <Typography variant="h6" color={colors.yellowAccent?.[500] || '#ff9800'} fontWeight="bold">
              {totalPending}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Pending
            </Typography>
          </Box>
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.redAccent?.[500] || '#f44336'}30`,
            flex: 1,
            minWidth: 100
          }}>
            <Typography variant="h6" color={colors.redAccent?.[500] || '#f44336'} fontWeight="bold">
              {totalRejected}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Rejected
            </Typography>
          </Box>
        </Box>

        {/* Payment Requests List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
          {paymentRequests.map((request) => (
            <Box 
              key={request.id}
              sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                border: `1px solid ${getStatusColor(request.status)}30`,
                borderLeft: `4px solid ${getStatusColor(request.status)}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.primary[200],
                  transform: 'translateX(4px)',
                }
              }}
            >
              <Box display="flex" alignItems="flex-start" gap={2}>
                <Avatar 
                  sx={{ 
                    bgcolor: getStatusColor(request.status),
                    width: 40,
                    height: 40,
                    mt: 0.5
                  }}
                >
                  {getStatusIcon(request.status)}
                </Avatar>
                
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold" 
                      color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}
                    >
                      {request.projectName}
                    </Typography>
                    <Chip 
                      label={getStatusText(request.status)} 
                      size="small" 
                      sx={{ 
                        bgcolor: getStatusColor(request.status),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.6rem',
                        height: 18
                      }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color={theme.palette.mode === 'dark' ? colors.grey[200] : colors.grey[700]}
                    sx={{ mb: 1 }}
                  >
                    {request.description}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography 
                        variant="h6" 
                        color={colors.blueAccent?.[500] || '#6870fa'} 
                        fontWeight="bold"
                      >
                        {request.currency} {request.amount.toLocaleString()}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                      >
                        {request.invoiceNumber}
                      </Typography>
                    </Box>
                    
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewRequest(request.id)}
                      sx={{ 
                        borderColor: colors.blueAccent?.[500] || '#6870fa',
                        color: colors.blueAccent?.[500] || '#6870fa',
                        fontSize: '0.6rem',
                        height: 20,
                        minWidth: 50,
                        '&:hover': { 
                          borderColor: colors.blueAccent?.[600] || '#535ac8',
                          bgcolor: colors.blueAccent?.[500] + '10'
                        }
                      }}
                    >
                      View
                    </Button>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography 
                      variant="caption" 
                      color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                    >
                      Submitted: {new Date(request.submittedDate).toLocaleDateString()}
                    </Typography>
                    {request.status === 'pending' && request.dueDate && (
                      <Typography 
                        variant="caption" 
                        color={colors.yellowAccent?.[500] || '#ff9800'}
                        fontWeight="bold"
                      >
                        Due: {new Date(request.dueDate).toLocaleDateString()}
                      </Typography>
                    )}
                    {request.status === 'rejected' && request.rejectionReason && (
                      <Typography 
                        variant="caption" 
                        color={colors.redAccent?.[500] || '#f44336'}
                        fontWeight="bold"
                      >
                        Reason: {request.rejectionReason}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentRequestsCard;












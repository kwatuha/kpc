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
  CheckCircle as PaidIcon,
  Schedule as PendingIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { tokens } from '../../pages/dashboard/theme';

const PaymentHistoryCard = ({ currentUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Mock data for payment history
  const [paymentHistory] = useState([
    {
      id: 1,
      projectName: 'Water Treatment Plant Construction',
      amount: 45000,
      currency: 'KES',
      status: 'paid',
      paymentDate: '2024-02-08',
      invoiceNumber: 'INV-2024-001',
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'TXN-2024-001',
      description: 'Payment for Phase 1 completion - Foundation work',
    },
    {
      id: 2,
      projectName: 'Healthcare Center Renovation',
      amount: 32000,
      currency: 'KES',
      status: 'paid',
      paymentDate: '2024-01-25',
      invoiceNumber: 'INV-2024-002',
      paymentMethod: 'Mobile Money',
      referenceNumber: 'TXN-2024-002',
      description: 'Payment for electrical installation work',
    },
    {
      id: 3,
      projectName: 'Road Infrastructure Project',
      amount: 28000,
      currency: 'KES',
      status: 'paid',
      paymentDate: '2024-01-15',
      invoiceNumber: 'INV-2024-003',
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'TXN-2024-003',
      description: 'Payment for road surfacing materials',
    },
    {
      id: 4,
      projectName: 'School Construction',
      amount: 55000,
      currency: 'KES',
      status: 'paid',
      paymentDate: '2024-01-05',
      invoiceNumber: 'INV-2024-004',
      paymentMethod: 'Bank Transfer',
      referenceNumber: 'TXN-2024-004',
      description: 'Payment for structural work completion',
    },
    {
      id: 5,
      projectName: 'Water Treatment Plant Construction',
      amount: 25000,
      currency: 'KES',
      status: 'paid',
      paymentDate: '2023-12-20',
      invoiceNumber: 'INV-2023-015',
      paymentMethod: 'Mobile Money',
      referenceNumber: 'TXN-2023-015',
      description: 'Payment for initial site preparation',
    },
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <PaidIcon />;
      case 'pending':
        return <PendingIcon />;
      default:
        return <MoneyIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return colors.greenAccent?.[500] || '#4caf50';
      case 'pending':
        return colors.yellowAccent?.[500] || '#ff9800';
      default:
        return colors.grey[400];
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const handleDownloadReceipt = (paymentId) => {
    console.log('Downloading receipt for payment:', paymentId);
    // TODO: Implement download receipt functionality
  };

  const handleViewDetails = (paymentId) => {
    console.log('Viewing payment details:', paymentId);
    // TODO: Implement view payment details functionality
  };

  const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPayments = paymentHistory.length;
  const averagePayment = totalPaid / totalPayments;

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
            Payment History
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${totalPayments} payments`}
              size="small"
              sx={{ 
                bgcolor: colors.greenAccent?.[500] || '#4caf50',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
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
              {new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
                minimumFractionDigits: 0,
              }).format(totalPaid)}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Total Paid
            </Typography>
          </Box>
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100], 
            borderRadius: 2,
            border: `1px solid ${colors.blueAccent?.[500] || '#2196f3'}30`,
            flex: 1,
            minWidth: 100
          }}>
            <Typography variant="h6" color={colors.blueAccent?.[500] || '#2196f3'} fontWeight="bold">
              {totalPayments}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Total Payments
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
              {new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
                minimumFractionDigits: 0,
              }).format(averagePayment)}
            </Typography>
            <Typography variant="caption" color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}>
              Avg Payment
            </Typography>
          </Box>
        </Box>

        {/* Payment History List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }}>
          {paymentHistory.map((payment) => (
            <Box 
              key={payment.id}
              sx={{ 
                p: 2,
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.primary[100],
                border: `1px solid ${getStatusColor(payment.status)}30`,
                borderLeft: `4px solid ${getStatusColor(payment.status)}`,
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
                    bgcolor: getStatusColor(payment.status),
                    width: 40,
                    height: 40,
                    mt: 0.5
                  }}
                >
                  {getStatusIcon(payment.status)}
                </Avatar>
                
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold" 
                      color={theme.palette.mode === 'dark' ? colors.grey[100] : colors.grey[900]}
                    >
                      {payment.projectName}
                    </Typography>
                    <Chip 
                      label={getStatusText(payment.status)} 
                      size="small" 
                      sx={{ 
                        bgcolor: getStatusColor(payment.status),
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
                    {payment.description}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography 
                        variant="h6" 
                        color={colors.greenAccent?.[500] || '#4caf50'} 
                        fontWeight="bold"
                      >
                        {payment.currency} {payment.amount.toLocaleString()}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                      >
                        {payment.invoiceNumber}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography 
                        variant="caption" 
                        color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                      >
                        Paid: {new Date(payment.paymentDate).toLocaleDateString()}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                      >
                        Method: {payment.paymentMethod}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color={theme.palette.mode === 'dark' ? colors.grey[300] : colors.grey[600]}
                      >
                        Ref: {payment.referenceNumber}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box display="flex" gap={1}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownloadReceipt(payment.id)}
                      sx={{ 
                        borderColor: colors.greenAccent?.[500] || '#4caf50',
                        color: colors.greenAccent?.[500] || '#4caf50',
                        fontSize: '0.6rem',
                        height: 20,
                        minWidth: 50,
                        '&:hover': { 
                          borderColor: colors.greenAccent?.[600] || '#388e3c',
                          bgcolor: colors.greenAccent?.[500] + '10'
                        }
                      }}
                    >
                      Receipt
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewDetails(payment.id)}
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
                      Details
                    </Button>
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

export default PaymentHistoryCard;












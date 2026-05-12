import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BankIcon,
  Receipt as ReceiptIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { tokens } from '../../pages/dashboard/theme';

const FinancialSummaryCard = ({ currentUser }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Mock financial summary data
  const financialData = {
    totalEarnings: 450000,
    pendingPayments: 85000,
    completedPayments: 365000,
    monthlyEarnings: 125000,
    averagePayment: 37500,
    paymentSuccessRate: 95,
    onTimePaymentRate: 88,
    totalInvoices: 12,
    paidInvoices: 11,
    pendingInvoices: 1,
    overdueInvoices: 0,
    monthlyGrowth: 15,
    quarterlyGrowth: 25,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return colors.greenAccent?.[500] || '#4caf50';
    if (growth < 0) return colors.redAccent?.[500] || '#f44336';
    return colors.grey[400];
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <TrendingUpIcon />;
    if (growth < 0) return <TrendingDownIcon />;
    return null;
  };

  return (
    <Card sx={{ 
      height: '100%',
      borderRadius: 4, 
      bgcolor: '#ffffff',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
      border: '1px solid rgba(255,255,255,0.2)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #4caf50 0%, #2196f3 50%, #ff9800 100%)',
        borderRadius: '4px 4px 0 0',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: -50,
        right: -50,
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, #e3f2fd 0%, transparent 70%)',
        borderRadius: '50%',
        opacity: 0.3,
        zIndex: 0,
      },
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
        '&::after': {
          opacity: 0.4,
        },
      }
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: colors.greenAccent?.[500] || '#4caf50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MoneyIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="#000000" sx={{ fontSize: '1.2rem' }}>
              Financial Summary
            </Typography>
            <Typography variant="caption" color="#333333" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
              Earnings and payment overview
            </Typography>
          </Box>
        </Box>

        {/* Key Financial Metrics - Horizontal Layout */}
        <Box sx={{
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, 
          gap: 3, 
          mb: 3
        }}>
          <Box sx={{ 
            p: 2.5, 
            bgcolor: '#ffffff',
            background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%)',
            borderRadius: 3,
            border: '2px solid #4caf50',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.25)',
            }
          }}>
            <Typography variant="h4" color="#4caf50" fontWeight="bold">
              {formatCurrency(financialData.totalEarnings)}
            </Typography>
            <Typography variant="caption" color={colors.grey[700]} fontWeight="600">
              Total Earnings
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2.5, 
            bgcolor: '#ffffff',
            background: 'linear-gradient(135deg, #fff3e0 0%, #fef7e0 100%)',
            borderRadius: 3,
            border: '2px solid #ff9800',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(255, 152, 0, 0.25)',
            }
          }}>
            <Typography variant="h4" color="#ff9800" fontWeight="bold">
              {formatCurrency(financialData.pendingPayments)}
            </Typography>
            <Typography variant="caption" color={colors.grey[700]} fontWeight="600">
              Pending Payments
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2.5, 
            bgcolor: '#ffffff',
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%)',
            borderRadius: 3,
            border: '2px solid #2196f3',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(33, 150, 243, 0.25)',
            }
          }}>
            <Typography variant="h4" color="#2196f3" fontWeight="bold">
              {formatCurrency(financialData.monthlyEarnings)}
            </Typography>
            <Typography variant="caption" color={colors.grey[700]} fontWeight="600">
              This Month
            </Typography>
          </Box>
        </Box>

        {/* Bottom Section - Two Column Layout */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          mb: 3
        }}>
          {/* Growth Indicators */}
          <Box sx={{ 
            p: 2.5, 
            bgcolor: '#ffffff',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            borderRadius: 3,
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <Typography variant="subtitle2" fontWeight="bold" color="#333333" mb={2} sx={{ fontSize: '0.95rem' }}>
              Growth Trends
            </Typography>
            
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="#444444" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
                Monthly Growth
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                {getGrowthIcon(financialData.monthlyGrowth)}
                <Typography variant="body2" color={getGrowthColor(financialData.monthlyGrowth)} fontWeight="bold">
                  +{financialData.monthlyGrowth}%
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="#444444" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
                Quarterly Growth
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                {getGrowthIcon(financialData.quarterlyGrowth)}
                <Typography variant="body2" color={getGrowthColor(financialData.quarterlyGrowth)} fontWeight="bold">
                  +{financialData.quarterlyGrowth}%
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Payment Performance */}
          <Box sx={{ 
            p: 2.5, 
            bgcolor: '#ffffff',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            borderRadius: 3,
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
            <Typography variant="subtitle1" fontWeight="bold" color="#333333" mb={2} sx={{ fontSize: '1rem' }}>
              Payment Performance
            </Typography>
            
            {/* Payment Success Rate */}
            <Box mb={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="#444444" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
                  Payment Success Rate
                </Typography>
                <Typography variant="body2" color={colors.greenAccent?.[500] || '#4caf50'} fontWeight="bold">
                  {financialData.paymentSuccessRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={financialData.paymentSuccessRate}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#e9ecef',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: colors.greenAccent?.[500] || '#4caf50',
                    borderRadius: 4,
                  }
                }}
              />
            </Box>

            {/* On-Time Payment Rate */}
            <Box mb={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="#444444" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
                  On-Time Payment Rate
                </Typography>
                <Typography variant="body2" color={colors.blueAccent?.[500] || '#2196f3'} fontWeight="bold">
                  {financialData.onTimePaymentRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={financialData.onTimePaymentRate}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: '#e9ecef',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: colors.blueAccent?.[500] || '#2196f3',
                    borderRadius: 4,
                  }
                }}
              />
            </Box>
          </Box>
        </Box>

      </CardContent>
    </Card>
  );
};

export default FinancialSummaryCard;












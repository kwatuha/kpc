import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../pages/dashboard/theme';
import { Receipt as ReceiptIcon } from '@mui/icons-material';

const InvoiceSummaryCard = ({ user }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Mock data for demonstration
  const [invoiceData, setInvoiceData] = useState({
    paidInvoices: 0,
    pendingInvoices: 0,
    totalInvoices: 0,
    averagePayment: 0,
    overdueInvoices: 0,
    monthlyInvoices: 0,
  });

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setInvoiceData({
        paidInvoices: 45,
        pendingInvoices: 8,
        totalInvoices: 53,
        averagePayment: 125000,
        overdueInvoices: 3,
        monthlyInvoices: 12,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount) => {
    return `Ksh ${amount.toLocaleString()}`;
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
        background: 'linear-gradient(90deg, #ff9800 0%, #ff5722 50%, #e91e63 100%)',
        borderRadius: '4px 4px 0 0',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: -50,
        right: -50,
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, #fff3e0 0%, transparent 70%)',
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
            bgcolor: colors.yellowAccent?.[500] || '#ff9800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ReceiptIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="#000000" sx={{ fontSize: '1.2rem' }}>
              Invoice Summary
            </Typography>
            <Typography variant="caption" color="#333333" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
              Invoice tracking and management
            </Typography>
          </Box>
        </Box>

        {/* Key Invoice Metrics */}
        <Box sx={{
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
          gap: 2, 
          mb: 3
        }}>
          <Box sx={{ 
            p: 2, 
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
            <Typography variant="h5" color="#4caf50" fontWeight="bold">
              {invoiceData.paidInvoices}
            </Typography>
            <Typography variant="caption" color="#444444" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
              Paid Invoices
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
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
            <Typography variant="h5" color="#ff9800" fontWeight="bold">
              {invoiceData.pendingInvoices}
            </Typography>
            <Typography variant="caption" color="#444444" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
              Pending Invoices
            </Typography>
          </Box>
        </Box>

        {/* Additional Metrics */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
          mb: 3
        }}>
          <Box sx={{ 
            p: 2, 
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
            <Typography variant="h5" color="#2196f3" fontWeight="bold">
              {invoiceData.overdueInvoices}
            </Typography>
            <Typography variant="caption" color="#444444" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
              Overdue
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: '#ffffff',
            background: 'linear-gradient(135deg, #f3e5f5 0%, #faf5ff 100%)',
            borderRadius: 3,
            border: '2px solid #9c27b0',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.15)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(156, 39, 176, 0.25)',
            }
          }}>
            <Typography variant="h5" color="#9c27b0" fontWeight="bold">
              {invoiceData.monthlyInvoices}
            </Typography>
            <Typography variant="caption" color="#444444" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
              This Month
            </Typography>
          </Box>
        </Box>

        {/* Summary Stats */}
        <Box sx={{ 
          p: 2, 
          bgcolor: '#ffffff',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          borderRadius: 3,
          border: '1px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <Typography variant="subtitle2" fontWeight="bold" color="#333333" mb={2} sx={{ fontSize: '0.95rem' }}>
            Invoice Summary
          </Typography>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="#444444" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
              Total Invoices
            </Typography>
            <Typography variant="body2" color={colors.blueAccent?.[500] || '#2196f3'} fontWeight="bold">
              {invoiceData.totalInvoices}
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="body2" color="#444444" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
              Average Payment
            </Typography>
            <Typography variant="body2" color={colors.greenAccent?.[500] || '#4caf50'} fontWeight="bold">
              {formatCurrency(invoiceData.averagePayment)}
            </Typography>
          </Box>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="#444444" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
              Payment Rate
            </Typography>
            <Typography variant="body2" color={colors.greenAccent?.[500] || '#4caf50'} fontWeight="bold">
              {Math.round((invoiceData.paidInvoices / invoiceData.totalInvoices) * 100)}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InvoiceSummaryCard;

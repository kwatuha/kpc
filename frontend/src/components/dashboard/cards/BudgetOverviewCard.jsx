import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';

/**
 * Budget Overview Card Component
 * 
 * Financial overview showing budget allocation, spent amounts, 
 * and remaining funds with visual indicators.
 */
const BudgetOverviewCard = ({ user, currency = 'USD' }) => {
  // Mock data - in real implementation, this would come from props or API
  const budget = {
    totalBudget: 2500000,
    spentAmount: 1650000,
    remainingAmount: 850000,
    utilizationRate: 66
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="h2" fontWeight="bold">
            Budget Overview
          </Typography>
          <MoneyIcon color="primary" />
        </Box>
        
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <Box position="relative" display="inline-flex">
            <CircularProgress
              variant="determinate"
              value={budget.utilizationRate}
              size={80}
              thickness={6}
              sx={{
                color: budget.utilizationRate > 80 ? 'warning.main' : 'success.main'
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" component="div" fontWeight="bold">
                {budget.utilizationRate}%
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box textAlign="center" mb={2}>
          <Typography variant="h5" component="div" color="primary" fontWeight="bold">
            {formatCurrency(budget.totalBudget)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Budget
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Box textAlign="center">
            <Typography variant="h6" color="error.main">
              {formatCurrency(budget.spentAmount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Spent
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" color="success.main">
              {formatCurrency(budget.remainingAmount)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Remaining
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BudgetOverviewCard;










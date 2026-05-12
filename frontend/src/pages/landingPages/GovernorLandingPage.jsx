import React from 'react';
import { Box, Typography, Card, CardContent, useTheme } from '@mui/material';
import { tokens } from '../dashboard/theme';
import { useAuth } from '../../context/AuthContext';
import ErrorBoundary from '../../components/ErrorBoundary';

const GovernorLandingPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user } = useAuth();

  return (
    <ErrorBoundary>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: colors.primary[5],
        background: `linear-gradient(135deg, ${colors.primary[5]} 0%, ${colors.primary[4]} 100%)`,
        px: { xs: 1, sm: 1.5, md: 2 }, 
        py: 3 
      }}>
        <Card sx={{ 
          borderRadius: 4,
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[700]} 100%)`
            : `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`,
          boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)'}`,
          p: 4,
          textAlign: 'center'
        }}>
          <CardContent>
            <Typography variant="h3" fontWeight="bold" color={colors.greenAccent[500]} mb={2}>
              Governor Dashboard
            </Typography>
            <Typography variant="h6" color={colors.grey[100]} mb={4}>
              Welcome, {user?.username || 'Governor'}!
            </Typography>
            <Typography variant="body1" color={colors.grey[200]}>
              This is the Governor Landing Page. It will be customized with governor-specific features and content.
            </Typography>
            <Typography variant="body2" color={colors.grey[300]} mt={2}>
              Coming soon...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </ErrorBoundary>
  );
};

export default GovernorLandingPage;


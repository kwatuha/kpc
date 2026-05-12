import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  AdminLandingPage, 
  UserLandingPage, 
  GovernorLandingPage, 
  ContractorLandingPage 
} from './landingPages';
import { Box, CircularProgress, Typography } from '@mui/material';
import { tokens } from './dashboard/theme';
import { useTheme } from '@mui/material';

const DashboardLandingPage = () => {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Show loading state while determining user role
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: colors.primary[5]
      }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: colors.blueAccent[500], mb: 2 }} />
          <Typography variant="h6" color={colors.grey[100]}>
            Loading dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Route to appropriate landing page based on user role
  const roleName = user?.roleName?.toLowerCase() || 'admin';

  // Role-based routing
  // Uncomment these as you build out each landing page
  // if (roleName === 'governor') return <GovernorLandingPage />;
  // if (roleName === 'contractor') return <ContractorLandingPage />;
  // if (roleName === 'user' || roleName === 'employee') return <UserLandingPage />;
  
  // Default to AdminLandingPage for admin and any unmatched roles
  return <AdminLandingPage />;
};

export default DashboardLandingPage;

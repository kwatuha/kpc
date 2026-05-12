import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '50vh',
          p: 3
        }}>
          <Alert 
            severity="error" 
            icon={<ErrorIcon />}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={this.handleRetry}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
            sx={{ maxWidth: 500 }}
          >
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2">
              The dashboard encountered an error. Please try refreshing the page or contact support if the problem persists.
            </Typography>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

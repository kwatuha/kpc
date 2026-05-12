import React from 'react';
import { Card, CardContent, Typography, Grid, Button, Box } from '@mui/material';
import { 
  Add as AddIcon, 
  Assessment as ReportIcon, 
  People as UsersIcon, 
  Assignment as ProjectIcon,
  AttachMoney as BudgetIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

/**
 * Quick Actions Widget Component
 * 
 * Interactive widget with frequently used actions and shortcuts
 * for common dashboard operations.
 */
const QuickActionsWidget = ({ user, actions = [] }) => {
  // Default actions if none provided
  const defaultActions = [
    {
      id: 'add-project',
      label: 'Add Project',
      icon: AddIcon,
      color: 'primary',
      onClick: () => console.log('Add Project clicked')
    },
    {
      id: 'view-reports',
      label: 'View Reports',
      icon: ReportIcon,
      color: 'info',
      onClick: () => console.log('View Reports clicked')
    },
    {
      id: 'manage-users',
      label: 'Manage Users',
      icon: UsersIcon,
      color: 'success',
      onClick: () => console.log('Manage Users clicked')
    },
    {
      id: 'project-overview',
      label: 'Projects',
      icon: ProjectIcon,
      color: 'warning',
      onClick: () => console.log('Projects clicked')
    },
    {
      id: 'budget-management',
      label: 'Budget',
      icon: BudgetIcon,
      color: 'error',
      onClick: () => console.log('Budget clicked')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      color: 'secondary',
      onClick: () => console.log('Settings clicked')
    }
  ];

  const availableActions = actions.length > 0 ? actions : defaultActions;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" fontWeight="bold" mb={2}>
          Quick Actions
        </Typography>
        
        <Grid container spacing={2}>
          {availableActions.map((action) => (
            <Grid item xs={6} sm={4} key={action.id}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<action.icon />}
                onClick={action.onClick}
                color={action.color}
                sx={{
                  height: 64,
                  flexDirection: 'column',
                  gap: 0.5,
                  '& .MuiButton-startIcon': {
                    margin: 0,
                    marginBottom: 0.5
                  }
                }}
              >
                <Box component="span" sx={{ fontSize: '0.75rem', textAlign: 'center' }}>
                  {action.label}
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActionsWidget;










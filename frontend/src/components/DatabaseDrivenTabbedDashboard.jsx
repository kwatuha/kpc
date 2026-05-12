import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { tokens } from '../pages/dashboard/theme';
import { useDatabaseDashboardConfig } from '../hooks/useDatabaseDashboardConfig';

// Import all dashboard components
import ActiveUsersCard from './ActiveUsersCard';
import KpiCard from './KpiCard';
import ProjectTasksCard from './ProjectTasksCard';
import ProjectActivityFeed from './ProjectActivityFeed';
import ProjectAlertsCard from './ProjectAlertsCard';
import TeamDirectoryCard from './TeamDirectoryCard';
import TeamAnnouncementsCard from './TeamAnnouncementsCard';
import RecentConversationsCard from './RecentConversationsCard';
import ChartsDashboard from './dashboard/ChartsDashboard';

// Import dashboard card components
import UserStatsCard from './dashboard/cards/UserStatsCard';
import ProjectMetricsCard from './dashboard/cards/ProjectMetricsCard';
import BudgetOverviewCard from './dashboard/cards/BudgetOverviewCard';

// Contractor-specific components
import ContractorMetricsCard from './contractor/ContractorMetricsCard';
import AssignedTasksCard from './contractor/AssignedTasksCard';
import ProjectCommentsCard from './contractor/ProjectCommentsCard';
import PaymentRequestsCard from './contractor/PaymentRequestsCard';
import PaymentHistoryCard from './contractor/PaymentHistoryCard';
import FinancialSummaryCard from './contractor/FinancialSummaryCard';
import InvoiceSummaryCard from './contractor/InvoiceSummaryCard';

// Enhanced filtered components
import RegionalProjectsCard from './dashboard/enhanced/RegionalProjectsCard';
import BudgetFilteredMetricsCard from './dashboard/enhanced/BudgetFilteredMetricsCard';

const DatabaseDrivenTabbedDashboard = ({ user, dashboardData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [activeTab, setActiveTab] = useState(0);

  const {
    dashboardConfig,
    refreshing,
    refreshDashboardConfig,
    canAccessTab,
    canAccessComponent,
    getTabComponents,
    getAvailableTabs,
    isLoading,
    hasError,
    error,
    tabs,
    components
  } = useDatabaseDashboardConfig(user);

  // Resource Utilization Component
  const ResourceUtilizationCard = () => {
    // Mock data for project assignments
    const projectAssignments = [
      {
        id: 1,
        projectName: "Water Management System",
        projectManager: "John Doe",
        teamMembers: [
          { name: "Alice Smith", role: "Frontend Developer", status: "Active" },
          { name: "Bob Johnson", role: "Backend Developer", status: "Active" },
          { name: "Carol Davis", role: "UI/UX Designer", status: "On Leave" }
        ],
        progress: 75,
        deadline: "2024-03-15"
      },
      {
        id: 2,
        projectName: "Infrastructure Development",
        projectManager: "Jane Wilson",
        teamMembers: [
          { name: "David Brown", role: "Project Engineer", status: "Active" },
          { name: "Eva Martinez", role: "Quality Assurance", status: "Active" },
          { name: "Frank Garcia", role: "DevOps Engineer", status: "Active" }
        ],
        progress: 60,
        deadline: "2024-04-20"
      },
      {
        id: 3,
        projectName: "Health Initiative",
        projectManager: "Mike Chen",
        teamMembers: [
          { name: "Grace Lee", role: "Data Analyst", status: "Active" },
          { name: "Henry Taylor", role: "Mobile Developer", status: "Active" }
        ],
        progress: 45,
        deadline: "2024-05-10"
      }
    ];

    const getStatusColor = (status) => {
      switch (status) {
        case 'Active': return colors.greenAccent?.[500] || '#4caf50';
        case 'On Leave': return colors.yellowAccent?.[500] || '#ff9800';
        case 'Inactive': return colors.redAccent?.[500] || '#f44336';
        default: return colors.grey[500];
      }
    };

    const getProgressColor = (progress) => {
      if (progress >= 75) return colors.greenAccent?.[500] || '#4caf50';
      if (progress >= 50) return colors.blueAccent?.[500] || '#2196f3';
      if (progress >= 25) return colors.yellowAccent?.[500] || '#ff9800';
      return colors.redAccent?.[500] || '#f44336';
    };

    return (
      <Card sx={{ 
        height: '100%',
        borderRadius: 4, 
        bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#ffffff',
        boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)'}`,
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        position: 'relative',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
          : `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${colors.blueAccent?.[500] || '#6870fa'} 0%, ${colors.greenAccent?.[500] || '#4cceac'} 100%)`,
          borderRadius: '4px 4px 0 0',
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 30px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
        }
      }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" alignItems="center" gap={1} mb={3}>
            <PeopleIcon sx={{ 
              color: colors.blueAccent?.[500] || '#6870fa', 
              fontSize: 24 
            }} />
            <Typography variant="h6" fontWeight="bold" color="#000000" sx={{ fontSize: { xs: '1.1rem', md: '1.2rem' } }}>
              Resource Utilization
            </Typography>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {projectAssignments.map((project) => (
              <Box key={project.id} sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[50] }}>
                {/* Project Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="#000000" sx={{ fontSize: '1rem' }}>
                      {project.projectName}
                    </Typography>
                    <Typography variant="body2" color="#333333" sx={{ fontSize: '0.8rem' }}>
                      PM: {project.projectManager}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" color="#444444" sx={{ fontSize: '0.75rem' }}>
                      Deadline: {new Date(project.deadline).toLocaleDateString()}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Typography variant="body2" color={getProgressColor(project.progress)} fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
                        {project.progress}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={project.progress}
                        sx={{
                          width: 60,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: theme.palette.mode === 'dark' ? colors.primary[200] : colors.primary[200],
                          '& .MuiLinearProgress-bar': {
                            bgcolor: getProgressColor(project.progress),
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Team Members */}
                <Box>
                  <Typography variant="subtitle2" color="#333333" fontWeight="600" mb={1} sx={{ fontSize: '0.85rem' }}>
                    Team Members ({project.teamMembers.length})
                  </Typography>
                  <Grid container spacing={1}>
                    {project.teamMembers.map((member, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          bgcolor: '#ffffff',
                          border: `1px solid ${theme.palette.mode === 'dark' ? colors.primary[200] : colors.primary[200]}`,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.05)'}`,
                          }
                        }}>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <PersonIcon sx={{ fontSize: 16, color: colors.blueAccent?.[500] || '#6870fa' }} />
                            <Typography variant="body2" color="#000000" fontWeight="600" sx={{ fontSize: '0.8rem' }}>
                              {member.name}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="#444444" sx={{ fontSize: '0.7rem', display: 'block' }}>
                            {member.role}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                            <Box sx={{ 
                              width: 6, 
                              height: 6, 
                              borderRadius: '50%', 
                              bgcolor: getStatusColor(member.status) 
                            }} />
                            <Typography variant="caption" color={getStatusColor(member.status)} fontWeight="500" sx={{ fontSize: '0.7rem' }}>
                              {member.status}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // Custom Key Performance Metrics Component for Database Dashboard
  const KeyPerformanceMetricsCard = () => (
    <Card sx={{ 
      height: '100%',
      borderRadius: 4, 
      bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#ffffff',
      boxShadow: `0 4px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)'}`,
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      position: 'relative',
      background: theme.palette.mode === 'dark' 
        ? `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[500]} 100%)`
        : `linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)`,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${colors.greenAccent?.[500] || '#4cceac'} 0%, ${colors.blueAccent?.[500] || '#6870fa'} 100%)`,
        borderRadius: '4px 4px 0 0',
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: -50,
        left: -50,
        width: '200px',
        height: '200px',
        background: `radial-gradient(circle, ${colors.greenAccent?.[50] || '#f0fdf4'} 0%, transparent 70%)`,
        borderRadius: '50%',
        opacity: 0.2,
        zIndex: 0,
      },
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 30px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
        '&::after': {
          opacity: 0.3,
        },
      }
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <AnalyticsIcon sx={{ 
            color: colors.greenAccent?.[500] || '#4cceac', 
            fontSize: 24 
          }} />
          <Typography variant="h6" fontWeight="bold" color="#000000" sx={{ fontSize: { xs: '1.1rem', md: '1.2rem' } }}>
            Key Performance Metrics
          </Typography>
        </Box>
        
        {/* Metrics Grid - 2x2 */}
        <Grid container spacing={1.5} sx={{ flex: 1 }}>
          <Grid item xs={6}>
            <Box textAlign="center" sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[50],
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[200] : colors.primary[100],
                transform: 'translateY(-2px)'
              }
            }}>
              <Typography variant="h5" fontWeight="bold" color={colors.blueAccent?.[500] || '#6870fa'}>
                {dashboardData?.metrics?.totalProjects || 24}
              </Typography>
              <Typography variant="caption" color="#444444" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
                Total Projects
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center" sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[50],
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[200] : colors.primary[100],
                transform: 'translateY(-2px)'
              }
            }}>
              <Typography variant="h5" fontWeight="bold" color={colors.greenAccent?.[500] || '#4cceac'}>
                {dashboardData?.metrics?.activeProjects || 8}
              </Typography>
              <Typography variant="caption" color="#444444" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
                Active Projects
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center" sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[50],
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[200] : colors.primary[100],
                transform: 'translateY(-2px)'
              }
            }}>
              <Typography variant="h5" fontWeight="bold" color={colors.blueAccent?.[500] || '#6870fa'}>
                {dashboardData?.metrics?.completedProjects || 4}
              </Typography>
              <Typography variant="caption" color="#444444" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
                Completed
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box textAlign="center" sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[50],
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? colors.primary[200] : colors.primary[100],
                transform: 'translateY(-2px)'
              }
            }}>
              <Typography variant="h5" fontWeight="bold" color={colors.greenAccent?.[500] || '#4cceac'}>
                {dashboardData?.metrics?.pendingApprovals || 3}
              </Typography>
              <Typography variant="caption" color="#444444" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
                Pending Approvals
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Budget Utilization */}
        <Box mt={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" color="#333333" fontWeight="600" sx={{ fontSize: '0.85rem' }}>
              Budget Utilization
            </Typography>
            <Typography variant="subtitle2" color={colors.blueAccent?.[500] || '#6870fa'} fontWeight="bold">
              {dashboardData?.metrics?.budgetUtilization || 75}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={dashboardData?.metrics?.budgetUtilization || 75}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: theme.palette.mode === 'dark' ? colors.primary[300] : colors.primary[200],
              '& .MuiLinearProgress-bar': {
                bgcolor: colors.blueAccent?.[500] || '#6870fa',
                borderRadius: 4,
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );

  // Component mapping - maps component keys to actual React components
  const componentMap = {
    // Card Components
    active_users_card: () => <ActiveUsersCard user={user} />,
    kpi_card: () => <KpiCard label="System KPIs" value={dashboardData?.metrics?.totalProjects || 24} />,
    key_performance_metrics_card: () => <KeyPerformanceMetricsCard />,
    resource_utilization_card: () => <ResourceUtilizationCard />,
    contractor_metrics_card: () => <ContractorMetricsCard user={user} />,
    financial_summary_card: () => <FinancialSummaryCard user={user} />,
    invoice_summary_card: () => <InvoiceSummaryCard user={user} />,
    user_stats_card: () => <UserStatsCard user={user} dashboardData={dashboardData} />,
    project_metrics_card: () => <ProjectMetricsCard user={user} dashboardData={dashboardData} />,
    budget_overview_card: () => <BudgetOverviewCard user={user} dashboardData={dashboardData} />,
    
    // Chart Components
    charts_dashboard: () => <ChartsDashboard user={user} dashboardData={dashboardData} />,
    
    // List Components
    project_tasks_card: () => <ProjectTasksCard user={user} />,
    project_activity_feed: () => <ProjectActivityFeed user={user} />,
    project_alerts_card: () => <ProjectAlertsCard user={user} />,
    team_directory_card: () => <TeamDirectoryCard user={user} />,
    team_announcements_card: () => <TeamAnnouncementsCard user={user} />,
    recent_conversations_card: () => <RecentConversationsCard user={user} />,
    
    // Contractor Components
    assigned_tasks_card: () => <AssignedTasksCard user={user} />,
    project_comments_card: () => <ProjectCommentsCard user={user} />,
    payment_requests_card: () => <PaymentRequestsCard user={user} />,
    payment_history_card: () => <PaymentHistoryCard user={user} />,
    
    // Enhanced Components
    regional_projects_card: () => <RegionalProjectsCard user={user} />,
    budget_filtered_metrics_card: () => <BudgetFilteredMetricsCard user={user} />,
    
    // Table Components (placeholder - these need proper table components)
    users_table: () => (
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Users Management</Typography>
        <Typography variant="body2" color="textSecondary">
          Users table component - integrate with UserManagementPage
        </Typography>
      </Card>
    ),
    projects_table: () => (
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Projects Management</Typography>
        <Typography variant="body2" color="textSecondary">
          Projects table component - integrate with ProjectManagementPage
        </Typography>
      </Card>
    ),
    
    // Widget Components
    quick_actions_widget: () => (
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Typography variant="body2" color="textSecondary">
          Quick actions widget - add common admin actions
        </Typography>
      </Card>
    ),
    
    // Legacy components
    reports_overview: () => (
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Reports Overview</Typography>
        <Typography variant="body2" color="textSecondary">
          Reports overview component
        </Typography>
      </Card>
    ),
    
    // Overview components
    metrics: () => {
      return (
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3, 
              bgcolor: '#ffffff',
              boxShadow: `0 4px 20px rgba(0,0,0,0.04)`,
              border: `1px solid rgba(0,0,0,0.08)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 30px rgba(0,0,0,0.08)`,
              }
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color={colors.blueAccent?.[500] || '#6870fa'} mb={1}>
                  {dashboardData?.metrics?.totalProjects || 24}
                </Typography>
                <Typography variant="h6" color="#000000" mb={1} fontWeight="600">
                  Total Projects
                </Typography>
                <Typography variant="body2" color="#444444" fontWeight="500">
                  Across all categories
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3, 
              bgcolor: '#ffffff',
              boxShadow: `0 4px 20px rgba(0,0,0,0.04)`,
              border: `1px solid rgba(0,0,0,0.08)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 30px rgba(0,0,0,0.08)`,
              }
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color={colors.greenAccent?.[500] || '#4cceac'} mb={1}>
                  {dashboardData?.metrics?.activeProjects || 8}
                </Typography>
                <Typography variant="h6" color="#000000" mb={1} fontWeight="600">
                  Active Projects
                </Typography>
                <Typography variant="body2" color="#444444" fontWeight="500">
                  Currently in progress
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3, 
              bgcolor: '#ffffff',
              boxShadow: `0 4px 20px rgba(0,0,0,0.04)`,
              border: `1px solid rgba(0,0,0,0.08)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 30px rgba(0,0,0,0.08)`,
              }
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color={colors.blueAccent?.[500] || '#6870fa'} mb={1}>
                  {dashboardData?.metrics?.completedProjects || 4}
                </Typography>
                <Typography variant="h6" color="#000000" mb={1} fontWeight="600">
                  Completed
                </Typography>
                <Typography variant="body2" color="#444444" fontWeight="500">
                  Successfully finished
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3, 
              bgcolor: '#ffffff',
              boxShadow: `0 4px 20px rgba(0,0,0,0.04)`,
              border: `1px solid rgba(0,0,0,0.08)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 30px rgba(0,0,0,0.08)`,
              }
            }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" color={colors.redAccent?.[500] || '#db4f4a'} mb={1}>
                  {dashboardData?.metrics?.pendingApprovals || 3}
                </Typography>
                <Typography variant="h6" color="#000000" mb={1} fontWeight="600">
                  Pending
                </Typography>
                <Typography variant="body2" color="#444444" fontWeight="500">
                  Awaiting approval
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      );
    },
    quickStats: () => (
      <Card sx={{ 
        height: '100%',
        borderRadius: 3, 
        bgcolor: '#ffffff',
        boxShadow: `0 4px 20px rgba(0,0,0,0.04)`,
        border: `1px solid rgba(0,0,0,0.08)`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 30px rgba(0,0,0,0.08)`,
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" color="#000000" mb={2}>
            Quick Stats
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="#444444" fontWeight="600" mb={0.5}>
                Budget Utilization
              </Typography>
              <Typography variant="h5" fontWeight="bold" color={colors.blueAccent?.[500] || '#6870fa'}>
                {dashboardData?.metrics?.budgetUtilization || 75}%
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="#444444" fontWeight="600" mb={0.5}>
                Team Members
              </Typography>
              <Typography variant="h5" fontWeight="bold" color={colors.greenAccent?.[500] || '#4cceac'}>
                {dashboardData?.metrics?.teamMembers || 24}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    ),
    recentActivity: () => (
      <Card sx={{ 
        height: '100%',
        borderRadius: 3, 
        bgcolor: '#ffffff',
        boxShadow: `0 4px 20px rgba(0,0,0,0.04)`,
        border: `1px solid rgba(0,0,0,0.08)`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 30px rgba(0,0,0,0.08)`,
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" color="#000000" mb={2}>
            Recent Activity
          </Typography>
          {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
            <List>
              {dashboardData.recentActivity.map((activity, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1 }}>
                  <ListItemIcon>
                    <AssignmentIcon sx={{ color: colors.blueAccent?.[500] || '#6870fa' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.action}
                    secondary={activity.time}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      color: '#000000',
                      fontWeight: 600
                    }}
                    secondaryTypographyProps={{ 
                      variant: 'caption',
                      color: '#666666',
                      fontWeight: 500
                    }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="#666666" fontWeight="500">
              No recent activity
            </Typography>
          )}
        </CardContent>
      </Card>
    ),
    
    // Project components
    tasks: () => <ProjectTasksCard currentUser={user} />,
    activity: () => <ProjectActivityFeed currentUser={user} />,
    alerts: () => <ProjectAlertsCard currentUser={user} />,
    
    // Collaboration components
    teamDirectory: () => <TeamDirectoryCard currentUser={user} />,
    announcements: () => <TeamAnnouncementsCard currentUser={user} />,
    conversations: () => <RecentConversationsCard currentUser={user} />,
    
    // Analytics components
    charts: () => <ChartsDashboard user={user} dashboardData={dashboardData} />,
    
    // Contractor-specific components
    contractorMetrics: () => <ContractorMetricsCard currentUser={user} />,
    assignedTasks: () => <AssignedTasksCard currentUser={user} />,
    projectComments: () => <ProjectCommentsCard currentUser={user} />,
    projectActivity: () => <ProjectActivityFeed currentUser={user} />,
    paymentRequests: () => <PaymentRequestsCard currentUser={user} />,
    paymentHistory: () => <PaymentHistoryCard currentUser={user} />,
    financialSummary: () => <FinancialSummaryCard currentUser={user} />,
    
    // Enhanced filtered components
    regionalProjects: () => <RegionalProjectsCard user={user} />,
    budgetMetrics: () => <BudgetFilteredMetricsCard user={user} />,
    wardProjects: () => <RegionalProjectsCard user={user} />,
    departmentMetrics: () => <BudgetFilteredMetricsCard user={user} />,
  };

  // Tab configuration with icons
  const tabIconMap = {
    overview: <DashboardIcon />,
    projects: <AssignmentIcon />,
    collaboration: <PeopleIcon />,
    team: <PeopleIcon />,
    analytics: <AnalyticsIcon />,
    payments: <MoneyIcon />,
    resource_utilization: <WorkIcon />,
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Default component mappings for each tab when database config is not available
  const defaultTabComponents = {
    overview: ['metrics', 'financial_summary_card', 'key_performance_metrics_card', 'invoice_summary_card', 'quickStats', 'recentActivity'],
    projects: ['tasks', 'activity', 'alerts'],
    collaboration: ['teamDirectory', 'announcements', 'conversations'],
    team: ['teamDirectory', 'announcements', 'conversations'],
    analytics: ['charts'],
    resource_utilization: ['resource_utilization']
  };

  // Render components for a specific tab
  const renderTabContent = (tabKey) => {
    // Special handling for Resource Utilization tab
    if (tabKey === 'resource_utilization') {
      return (
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          <Grid item xs={12}>
            <ResourceUtilizationCard />
          </Grid>
        </Grid>
      );
    }

    // Special handling for Overview tab with custom layout
    if (tabKey === 'overview') {
      return (
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Metrics Row - Full Width */}
          <Grid item xs={12}>
            {componentMap['metrics'] && componentMap['metrics']()}
          </Grid>
          
          {/* Financial Summary and KPI/Invoice in Two Columns */}
          <Grid item xs={12} md={6}>
            {componentMap['financial_summary_card'] && componentMap['financial_summary_card']()}
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12}>
                {componentMap['key_performance_metrics_card'] && componentMap['key_performance_metrics_card']()}
              </Grid>
              <Grid item xs={12}>
                {componentMap['invoice_summary_card'] && componentMap['invoice_summary_card']()}
              </Grid>
            </Grid>
          </Grid>
          
          {/* Quick Stats and Recent Activity */}
          <Grid item xs={12} md={6}>
            {componentMap['quickStats'] && componentMap['quickStats']()}
          </Grid>
          <Grid item xs={12} md={6}>
            {componentMap['recentActivity'] && componentMap['recentActivity']()}
          </Grid>
        </Grid>
      );
    }

    // Try to get components from database config first
    let tabComponents = getTabComponents(tabKey);
    
    // If no components from database, use default mappings
    if (!tabComponents || tabComponents.length === 0) {
      tabComponents = defaultTabComponents[tabKey] || [];
    }
    
    // Filter out quick_actions_widget only
    const filteredComponents = tabComponents.filter(
      componentKey => componentKey !== 'quick_actions_widget'
    );
    
    return (
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {filteredComponents.map((componentKey) => {
          const Component = componentMap[componentKey];
          if (!Component) {
            console.warn(`Component ${componentKey} not found in componentMap`);
            return null;
          }
          
          // For the financial_summary_card, we want it to take full width within its container
          // since it will be placed in a Grid item that's already sized
          let gridProps = { xs: 12 };
          
          return (
            <Grid item {...gridProps} key={componentKey}>
              <Component />
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading dashboard configuration...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (hasError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dashboard Configuration Error
        </Typography>
        <Typography variant="body2">
          {error || 'Failed to load dashboard configuration. Please try refreshing the page.'}
        </Typography>
      </Alert>
    );
  }

  // No tabs available - provide default tabs for admin dashboard
  const defaultTabs = [
    {
      tab_key: 'overview',
      tab_name: 'Overview',
      tab_order: 1
    },
    {
      tab_key: 'projects',
      tab_name: 'Projects',
      tab_order: 2
    },
    {
      tab_key: 'collaboration',
      tab_name: 'Team',
      tab_order: 3
    },
    {
      tab_key: 'analytics',
      tab_name: 'Analytics',
      tab_order: 4
    },
    {
      tab_key: 'resource_utilization',
      tab_name: 'Resource Utilization',
      tab_order: 5
    }
  ];

  const displayTabs = tabs && tabs.length > 0 ? tabs : defaultTabs;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tab Navigation */}
      <Box sx={{ 
        bgcolor: '#ffffff',
        borderRadius: 3,
        mb: 3,
        boxShadow: `0 4px 20px rgba(0,0,0,0.04)`,
        border: `1px solid rgba(0,0,0,0.08)`,
      }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              color: '#555555',
              fontWeight: '600',
              fontSize: '0.95rem',
              textTransform: 'none',
              minHeight: 48,
              borderRadius: '8px 8px 0 0',
              margin: '0 4px',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: colors.blueAccent?.[500] || '#6870fa',
                bgcolor: 'rgba(104, 112, 250, 0.08)',
                transform: 'translateY(-1px)',
              },
              '&.Mui-selected': {
                color: '#ffffff',
                bgcolor: colors.blueAccent?.[500] || '#6870fa',
                fontWeight: '700',
                boxShadow: `0 4px 12px ${colors.blueAccent?.[500] || '#6870fa'}30`,
                '&:hover': {
                  bgcolor: colors.blueAccent?.[600] || '#535ac8',
                  transform: 'translateY(-1px)',
                }
              }
            },
            '& .MuiTabs-indicator': {
              display: 'none'
            }
          }}
        >
          {displayTabs.map((tab, index) => (
            <Tab
              key={tab.tab_key}
              label={tab.tab_name}
              icon={tabIconMap[tab.tab_key]}
              iconPosition="start"
              sx={{ 
                minWidth: 120,
                px: 3,
                py: 1.5
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      {displayTabs.map((tab, index) => (
        <div
          key={tab.tab_key}
          role="tabpanel"
          hidden={activeTab !== index}
          id={`dashboard-tabpanel-${index}`}
          aria-labelledby={`dashboard-tab-${index}`}
        >
          {activeTab === index && (
            <Box sx={{ p: 3 }}>
              {renderTabContent(tab.tab_key)}
            </Box>
          )}
        </div>
      ))}
    </Box>
  );
};

export default DatabaseDrivenTabbedDashboard;

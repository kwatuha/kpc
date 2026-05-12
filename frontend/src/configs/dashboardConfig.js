// Dashboard Configuration for Role-Based Access
export const dashboardConfig = {
  // Define available dashboard components
  components: {
    // Overview Tab Components
    overview: {
      metrics: {
        id: 'metrics',
        name: 'Key Performance Indicators',
        component: 'MetricsGrid',
        required: true,
        permissions: ['view_metrics']
      },
      quickStats: {
        id: 'quickStats',
        name: 'Quick Stats',
        component: 'QuickStatsCard',
        required: false,
        permissions: ['view_quick_stats']
      },
      recentActivity: {
        id: 'recentActivity',
        name: 'Recent Activity',
        component: 'RecentActivityCard',
        required: false,
        permissions: ['view_activity']
      }
    },
    
    // Projects Tab Components
    projects: {
      tasks: {
        id: 'tasks',
        name: 'Project Tasks',
        component: 'ProjectTasksCard',
        required: true,
        permissions: ['view_tasks', 'manage_tasks']
      },
      activity: {
        id: 'activity',
        name: 'Project Activity',
        component: 'ProjectActivityFeed',
        required: true,
        permissions: ['view_activity']
      },
      alerts: {
        id: 'alerts',
        name: 'Project Alerts',
        component: 'ProjectAlertsCard',
        required: true,
        permissions: ['view_alerts', 'manage_alerts']
      }
    },
    
    // Collaboration Tab Components
    collaboration: {
      teamDirectory: {
        id: 'teamDirectory',
        name: 'Team Directory',
        component: 'TeamDirectoryCard',
        required: false,
        permissions: ['view_team_directory']
      },
      announcements: {
        id: 'announcements',
        name: 'Team Announcements',
        component: 'TeamAnnouncementsCard',
        required: false,
        permissions: ['view_announcements']
      },
      conversations: {
        id: 'conversations',
        name: 'Recent Conversations',
        component: 'RecentConversationsCard',
        required: false,
        permissions: ['view_conversations']
      }
    },
    
    // Analytics Tab Components
    analytics: {
      charts: {
        id: 'charts',
        name: 'Analytics Charts',
        component: 'ChartsDashboard',
        required: true,
        permissions: ['view_analytics']
      },
      reports: {
        id: 'reports',
        name: 'Reports',
        component: 'ReportsCard',
        required: false,
        permissions: ['view_reports', 'generate_reports']
      }
    },

    // Contractor-specific components
    contractor: {
      contractorMetrics: {
        id: 'contractorMetrics',
        name: 'Contractor Metrics',
        component: 'ContractorMetricsCard',
        required: true,
        permissions: ['view_contractor_metrics']
      },
      assignedTasks: {
        id: 'assignedTasks',
        name: 'My Assigned Tasks',
        component: 'AssignedTasksCard',
        required: true,
        permissions: ['view_assigned_tasks']
      },
      projectComments: {
        id: 'projectComments',
        name: 'Project Comments',
        component: 'ProjectCommentsCard',
        required: true,
        permissions: ['view_project_comments']
      },
      projectActivity: {
        id: 'projectActivity',
        name: 'Project Activity',
        component: 'ProjectActivityFeed',
        required: true,
        permissions: ['view_project_activity']
      },
      paymentRequests: {
        id: 'paymentRequests',
        name: 'Payment Requests',
        component: 'PaymentRequestsCard',
        required: true,
        permissions: ['view_payment_requests', 'submit_payment_requests']
      },
      paymentHistory: {
        id: 'paymentHistory',
        name: 'Payment History',
        component: 'PaymentHistoryCard',
        required: true,
        permissions: ['view_payment_history']
      },
      financialSummary: {
        id: 'financialSummary',
        name: 'Financial Summary',
        component: 'FinancialSummaryCard',
        required: true,
        permissions: ['view_financial_summary']
      }
    }
  },

  // Role-based dashboard configurations
  roles: {
    // Administrator - Full system access
    admin: {
      name: 'Administrator',
      description: 'Full system access with all permissions',
      tabs: ['overview', 'projects', 'collaboration', 'analytics'],
      components: {
        overview: ['metrics', 'quickStats', 'recentActivity'],
        projects: ['tasks', 'activity', 'alerts'],
        collaboration: ['teamDirectory', 'announcements', 'conversations'],
        analytics: ['charts', 'reports']
      },
      permissions: [
        'view_metrics',
        'view_quick_stats',
        'view_activity',
        'view_tasks',
        'manage_tasks',
        'view_alerts',
        'manage_alerts',
        'view_team_directory',
        'view_announcements',
        'view_conversations',
        'view_analytics',
        'view_reports',
        'generate_reports',
        'manage_users',
        'manage_roles',
        'system_admin',
        'view_all_projects',
        'manage_payments',
        'approve_payments',
        'view_financial_data'
      ],
      features: {
        canViewAllProjects: true,
        canManageUsers: true,
        canAccessAnalytics: true,
        canGenerateReports: true,
        canManageRoles: true,
        canViewSystemLogs: true,
        canManagePayments: true,
        canApprovePayments: true,
        canViewFinancialData: true
      }
    },

    project_manager: {
      name: 'Project Manager',
      description: 'Manages projects and coordinates team activities',
      tabs: ['overview', 'projects', 'collaboration'],
      components: {
        overview: ['metrics', 'quickStats', 'recentActivity'],
        projects: ['tasks', 'activity', 'alerts'],
        collaboration: ['teamDirectory', 'announcements', 'conversations']
      },
      permissions: [
        'view_metrics',
        'view_quick_stats',
        'view_activity',
        'view_tasks',
        'manage_tasks',
        'view_alerts',
        'manage_alerts',
        'view_team_directory',
        'view_announcements',
        'view_conversations'
      ],
      features: {
        canViewAllProjects: false,
        canManageUsers: false,
        canAccessAnalytics: false,
        canGenerateReports: false,
        canManageRoles: false,
        canViewSystemLogs: false
      }
    },

    field_coordinator: {
      name: 'Field Coordinator',
      description: 'Coordinates field operations and manages field teams',
      tabs: ['overview', 'projects'],
      components: {
        overview: ['metrics', 'recentActivity'],
        projects: ['tasks', 'activity']
      },
      permissions: [
        'view_metrics',
        'view_activity',
        'view_tasks',
        'view_alerts'
      ],
      features: {
        canViewAllProjects: false,
        canManageUsers: false,
        canAccessAnalytics: false,
        canGenerateReports: false,
        canManageRoles: false,
        canViewSystemLogs: false
      }
    },

    data_analyst: {
      name: 'Data Analyst',
      description: 'Analyzes data and generates reports',
      tabs: ['overview', 'analytics'],
      components: {
        overview: ['metrics', 'quickStats'],
        analytics: ['charts', 'reports']
      },
      permissions: [
        'view_metrics',
        'view_quick_stats',
        'view_analytics',
        'view_reports',
        'generate_reports'
      ],
      features: {
        canViewAllProjects: false,
        canManageUsers: false,
        canAccessAnalytics: true,
        canGenerateReports: true,
        canManageRoles: false,
        canViewSystemLogs: false
      }
    },

    // Contractor - Limited access focused on their work
    contractor: {
      name: 'Contractor',
      description: 'External contractor with access to assigned projects and payments',
      tabs: ['overview', 'projects', 'payments'],
      components: {
        overview: ['contractorMetrics', 'recentActivity'],
        projects: ['assignedTasks', 'projectComments', 'projectActivity'],
        payments: ['paymentRequests', 'paymentHistory', 'financialSummary']
      },
      permissions: [
        'view_contractor_metrics',
        'view_assigned_tasks',
        'view_project_comments',
        'view_project_activity',
        'view_payment_requests',
        'view_payment_history',
        'submit_payment_requests',
        'view_financial_summary',
        'view_assigned_projects'
      ],
      features: {
        canViewAllProjects: false,
        canManageUsers: false,
        canAccessAnalytics: false,
        canGenerateReports: false,
        canManageRoles: false,
        canViewSystemLogs: false,
        canViewAssignedProjects: true,
        canSubmitPaymentRequests: true,
        canViewPaymentStatus: true,
        canViewProjectComments: true
      }
    }
  },

  // Department-specific configurations
  departments: {
    health: {
      name: 'Health Department',
      additionalComponents: ['healthMetrics', 'patientData'],
      permissions: ['view_health_data', 'manage_health_projects']
    },
    education: {
      name: 'Education Department',
      additionalComponents: ['educationMetrics', 'studentData'],
      permissions: ['view_education_data', 'manage_education_projects']
    },
    infrastructure: {
      name: 'Infrastructure Department',
      additionalComponents: ['infrastructureMetrics', 'constructionData'],
      permissions: ['view_infrastructure_data', 'manage_infrastructure_projects']
    }
  }
};

// Helper functions for role-based access
export const getRoleConfig = (roleName) => {
  return dashboardConfig.roles[roleName] || dashboardConfig.roles.contractor;
};

export const getUserDashboardConfig = (user) => {
  const roleConfig = getRoleConfig(user.role);
  const departmentConfig = dashboardConfig.departments[user.department] || {};
  
  return {
    ...roleConfig,
    department: departmentConfig,
    user: user
  };
};

export const hasPermission = (user, permission) => {
  const roleConfig = getRoleConfig(user.role);
  return roleConfig.permissions.includes(permission);
};

export const canAccessTab = (user, tabName) => {
  const roleConfig = getRoleConfig(user.role);
  return roleConfig.tabs.includes(tabName);
};

export const canAccessComponent = (user, tabName, componentId) => {
  const roleConfig = getRoleConfig(user.role);
  const tabComponents = roleConfig.components[tabName] || [];
  return tabComponents.includes(componentId);
};

export const getAvailableTabs = (user) => {
  const roleConfig = getRoleConfig(user.role);
  return roleConfig.tabs;
};

export const getTabComponents = (user, tabName) => {
  const roleConfig = getRoleConfig(user.role);
  return roleConfig.components[tabName] || [];
};

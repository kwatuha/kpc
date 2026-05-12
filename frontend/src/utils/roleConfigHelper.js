// Role Configuration Helper
// Use this to easily configure roles for your existing system

export const createRoleConfig = (roleName, roleData) => {
  return {
    [roleName]: {
      name: roleData.name || roleName,
      description: roleData.description || `${roleName} role`,
      tabs: roleData.tabs || ['overview'],
      components: roleData.components || {
        overview: ['metrics']
      },
      permissions: roleData.permissions || ['view_metrics'],
      features: roleData.features || {
        canViewAllProjects: false,
        canManageUsers: false,
        canAccessAnalytics: false,
        canGenerateReports: false
      }
    }
  };
};

// Predefined role templates
export const roleTemplates = {
  // Full access role
  fullAccess: {
    tabs: ['overview', 'projects', 'collaboration', 'analytics'],
    components: {
      overview: ['metrics', 'quickStats', 'recentActivity'],
      projects: ['tasks', 'activity', 'alerts'],
      collaboration: ['teamDirectory', 'announcements', 'conversations'],
      analytics: ['charts', 'reports']
    },
    permissions: [
      'view_metrics', 'view_quick_stats', 'view_activity',
      'view_tasks', 'manage_tasks', 'view_alerts', 'manage_alerts',
      'view_team_directory', 'view_announcements', 'view_conversations',
      'view_analytics', 'view_reports', 'generate_reports',
      'manage_users', 'system_admin'
    ],
    features: {
      canViewAllProjects: true,
      canManageUsers: true,
      canAccessAnalytics: true,
      canGenerateReports: true,
      canManageRoles: true,
      canViewSystemLogs: true
    }
  },

  // Project management role
  projectManagement: {
    tabs: ['overview', 'projects', 'collaboration'],
    components: {
      overview: ['metrics', 'quickStats', 'recentActivity'],
      projects: ['tasks', 'activity', 'alerts'],
      collaboration: ['teamDirectory', 'announcements', 'conversations']
    },
    permissions: [
      'view_metrics', 'view_quick_stats', 'view_activity',
      'view_tasks', 'manage_tasks', 'view_alerts', 'manage_alerts',
      'view_team_directory', 'view_announcements', 'view_conversations'
    ],
    features: {
      canViewAllProjects: false,
      canManageUsers: false,
      canAccessAnalytics: false,
      canGenerateReports: false
    }
  },

  // Field operations role
  fieldOperations: {
    tabs: ['overview', 'projects'],
    components: {
      overview: ['metrics', 'recentActivity'],
      projects: ['tasks', 'activity']
    },
    permissions: [
      'view_metrics', 'view_activity', 'view_tasks'
    ],
    features: {
      canViewAllProjects: false,
      canManageUsers: false,
      canAccessAnalytics: false,
      canGenerateReports: false
    }
  },

  // Analytics role
  analytics: {
    tabs: ['overview', 'analytics'],
    components: {
      overview: ['metrics', 'quickStats'],
      analytics: ['charts', 'reports']
    },
    permissions: [
      'view_metrics', 'view_quick_stats', 'view_analytics',
      'view_reports', 'generate_reports'
    ],
    features: {
      canViewAllProjects: false,
      canManageUsers: false,
      canAccessAnalytics: true,
      canGenerateReports: true
    }
  },

  // Limited access role
  limitedAccess: {
    tabs: ['overview'],
    components: {
      overview: ['metrics']
    },
    permissions: [
      'view_metrics'
    ],
    features: {
      canViewAllProjects: false,
      canManageUsers: false,
      canAccessAnalytics: false,
      canGenerateReports: false
    }
  }
};

// Helper function to create role config from template
export const createRoleFromTemplate = (roleName, templateName, customizations = {}) => {
  const template = roleTemplates[templateName];
  if (!template) {
    throw new Error(`Template ${templateName} not found`);
  }

  return createRoleConfig(roleName, {
    ...template,
    ...customizations
  });
};

// Helper to validate role configuration
export const validateRoleConfig = (roleConfig) => {
  const requiredFields = ['name', 'tabs', 'components', 'permissions', 'features'];
  const missingFields = requiredFields.filter(field => !roleConfig[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate tabs exist in components
  const invalidTabs = roleConfig.tabs.filter(tab => !roleConfig.components[tab]);
  if (invalidTabs.length > 0) {
    throw new Error(`Invalid tabs: ${invalidTabs.join(', ')}`);
  }

  return true;
};

// Helper to get all available components
export const getAvailableComponents = () => {
  return {
    overview: ['metrics', 'quickStats', 'recentActivity'],
    projects: ['tasks', 'activity', 'alerts'],
    collaboration: ['teamDirectory', 'announcements', 'conversations'],
    analytics: ['charts', 'reports']
  };
};

// Helper to get all available permissions
export const getAvailablePermissions = () => {
  return [
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
    'budget_approval',
    'field_inspection',
    'data_analysis'
  ];
};

// Example usage:
/*
// Create a custom role
const customRole = createRoleConfig('budget_officer', {
  name: 'Budget Officer',
  description: 'Manages budgets and financial approvals',
  tabs: ['overview', 'projects', 'analytics'],
  components: {
    overview: ['metrics', 'quickStats'],
    projects: ['tasks', 'alerts'],
    analytics: ['charts', 'reports']
  },
  permissions: [
    'view_metrics', 'view_tasks', 'manage_tasks', 'view_analytics',
    'generate_reports', 'budget_approval'
  ],
  features: {
    canViewAllProjects: true,
    canManageUsers: false,
    canAccessAnalytics: true,
    canGenerateReports: true
  }
});

// Or create from template
const inspectorRole = createRoleFromTemplate('field_inspector', 'fieldOperations', {
  name: 'Field Inspector',
  description: 'Conducts field inspections',
  permissions: ['view_metrics', 'view_tasks', 'field_inspection']
});
*/












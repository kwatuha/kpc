// Role Management Service
import { dashboardConfig, getUserDashboardConfig, hasPermission } from '../configs/dashboardConfig';

class RoleService {
  constructor() {
    this.currentUser = null;
    this.roleCache = new Map();
  }

  // Set current user
  setCurrentUser(user) {
    this.currentUser = user;
    this.roleCache.clear(); // Clear cache when user changes
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get user's dashboard configuration
  getUserDashboardConfig() {
    if (!this.currentUser) return null;
    
    const cacheKey = `dashboard_${this.currentUser.id}_${this.currentUser.role}`;
    if (this.roleCache.has(cacheKey)) {
      return this.roleCache.get(cacheKey);
    }

    const config = getUserDashboardConfig(this.currentUser);
    this.roleCache.set(cacheKey, config);
    return config;
  }

  // Check if user has specific permission
  hasPermission(permission) {
    if (!this.currentUser) return false;
    return hasPermission(this.currentUser, permission);
  }

  // Check if user can access specific tab
  canAccessTab(tabName) {
    if (!this.currentUser) return false;
    const config = this.getUserDashboardConfig();
    return config.tabs.includes(tabName);
  }

  // Check if user can access specific component
  canAccessComponent(tabName, componentId) {
    if (!this.currentUser) return false;
    const config = this.getUserDashboardConfig();
    const tabComponents = config.components[tabName] || [];
    return tabComponents.includes(componentId);
  }

  // Get available tabs for current user
  getAvailableTabs() {
    if (!this.currentUser) return [];
    const config = this.getUserDashboardConfig();
    return config.tabs;
  }

  // Get components for specific tab
  getTabComponents(tabName) {
    if (!this.currentUser) return [];
    const config = this.getUserDashboardConfig();
    return config.components[tabName] || [];
  }

  // Get user's role features
  getRoleFeatures() {
    if (!this.currentUser) return {};
    const config = this.getUserDashboardConfig();
    return config.features || {};
  }

  // Check if user can perform specific action
  canPerformAction(action) {
    if (!this.currentUser) return false;
    const features = this.getRoleFeatures();
    return features[action] || false;
  }

  // Get all available roles
  getAvailableRoles() {
    return Object.keys(dashboardConfig.roles).map(roleKey => ({
      key: roleKey,
      ...dashboardConfig.roles[roleKey]
    }));
  }

  // Get role by key
  getRole(roleKey) {
    return dashboardConfig.roles[roleKey] || null;
  }

  // Check if role exists
  roleExists(roleKey) {
    return roleKey in dashboardConfig.roles;
  }

  // Get department-specific permissions
  getDepartmentPermissions(department) {
    const deptConfig = dashboardConfig.departments[department];
    return deptConfig ? deptConfig.permissions : [];
  }

  // Get department-specific components
  getDepartmentComponents(department) {
    const deptConfig = dashboardConfig.departments[department];
    return deptConfig ? deptConfig.additionalComponents : [];
  }

  // Validate user permissions
  validateUserPermissions(user) {
    const requiredPermissions = [
      'view_metrics',
      'view_tasks',
      'view_activity'
    ];

    return requiredPermissions.every(permission => 
      hasPermission(user, permission)
    );
  }

  // Get user's effective permissions (role + department)
  getEffectivePermissions(user) {
    const roleConfig = dashboardConfig.roles[user.role];
    const deptConfig = dashboardConfig.departments[user.department];
    
    const rolePermissions = roleConfig ? roleConfig.permissions : [];
    const deptPermissions = deptConfig ? deptConfig.permissions : [];
    
    return [...new Set([...rolePermissions, ...deptPermissions])];
  }

  // Check if user can access specific feature
  canAccessFeature(feature) {
    if (!this.currentUser) return false;
    const features = this.getRoleFeatures();
    return features[feature] || false;
  }

  // Get user's dashboard layout
  getDashboardLayout() {
    if (!this.currentUser) return null;
    const config = this.getUserDashboardConfig();
    
    return {
      tabs: config.tabs,
      components: config.components,
      permissions: config.permissions,
      features: config.features
    };
  }

  // Clear cache
  clearCache() {
    this.roleCache.clear();
  }

  // Get role hierarchy (for admin users)
  getRoleHierarchy() {
    return {
      admin: ['project_manager', 'field_coordinator', 'data_analyst', 'contractor'],
      project_manager: ['field_coordinator', 'contractor'],
      field_coordinator: ['contractor'],
      data_analyst: [],
      contractor: []
    };
  }

  // Check if user can manage other users
  canManageUser(targetUser) {
    if (!this.currentUser) return false;
    
    const hierarchy = this.getRoleHierarchy();
    const currentUserRole = this.currentUser.role;
    const targetUserRole = targetUser.role;
    
    return hierarchy[currentUserRole]?.includes(targetUserRole) || false;
  }
}

// Create singleton instance
const roleService = new RoleService();

export default roleService;












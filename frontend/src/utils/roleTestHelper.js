// Role Test Helper - Use this to test different user roles
// This file helps you test the role-based dashboard functionality

export const testUsers = {
  admin: {
    id: 1,
    name: 'Dr. Aisha Mwangi',
    email: 'aisha.mwangi@company.com',
    role: 'admin',
    department: 'IT',
    avatar: '/avatars/admin.jpg'
  },
  contractor: {
    id: 2,
    name: 'John Kiprotich',
    email: 'john.kiprotich@contractor.com',
    role: 'contractor',
    department: 'Construction',
    avatar: '/avatars/contractor.jpg'
  },
  project_manager: {
    id: 3,
    name: 'Grace Akinyi',
    email: 'grace.akinyi@company.com',
    role: 'project_manager',
    department: 'Project Management',
    avatar: '/avatars/pm.jpg'
  }
};

// Function to switch user roles for testing
export const switchUserRole = (roleKey) => {
  const user = testUsers[roleKey];
  if (!user) {
    console.error(`Role ${roleKey} not found. Available roles: ${Object.keys(testUsers).join(', ')}`);
    return null;
  }
  
  console.log(`Switched to ${user.role} role:`, user);
  return user;
};

// Function to test role-based dashboard rendering
export const testRoleBasedDashboard = (user) => {
  console.log('Testing dashboard for role:', user.role);
  
  // This would be called by your dashboard component
  const expectedTabs = {
    admin: ['overview', 'projects', 'collaboration', 'analytics'],
    contractor: ['overview', 'projects', 'payments'],
    project_manager: ['overview', 'projects', 'collaboration']
  };
  
  const expectedComponents = {
    admin: {
      overview: ['metrics', 'quickStats', 'recentActivity'],
      projects: ['tasks', 'activity', 'alerts'],
      collaboration: ['teamDirectory', 'announcements', 'conversations'],
      analytics: ['charts', 'reports']
    },
    contractor: {
      overview: ['contractorMetrics', 'recentActivity'],
      projects: ['assignedTasks', 'projectComments', 'projectActivity'],
      payments: ['paymentRequests', 'paymentHistory', 'financialSummary']
    },
    project_manager: {
      overview: ['metrics', 'quickStats', 'recentActivity'],
      projects: ['tasks', 'activity', 'alerts'],
      collaboration: ['teamDirectory', 'announcements', 'conversations']
    }
  };
  
  console.log('Expected tabs:', expectedTabs[user.role]);
  console.log('Expected components:', expectedComponents[user.role]);
  
  return {
    tabs: expectedTabs[user.role],
    components: expectedComponents[user.role]
  };
};

// Usage examples:
/*
// Test admin role
const adminUser = switchUserRole('admin');
testRoleBasedDashboard(adminUser);

// Test contractor role
const contractorUser = switchUserRole('contractor');
testRoleBasedDashboard(contractorUser);

// Test project manager role
const pmUser = switchUserRole('project_manager');
testRoleBasedDashboard(pmUser);
*/












/**
 * Dashboard Component Registry
 * 
 * This file maintains a registry of all available dashboard components
 * organized by category. This allows the Dashboard Configuration Manager
 * to automatically discover and list available components without requiring
 * users to know file paths.
 */

// Import existing dashboard components (the good ones that were already built)
import ActiveUsersCard from './cards/existing/ActiveUsersCard';
import KpiCard from './cards/existing/KpiCard';
import ContractorMetricsCard from '../contractor/ContractorMetricsCard';
import FinancialSummaryCard from '../contractor/FinancialSummaryCard';
import ProjectTasksCard from './lists/existing/ProjectTasksCard';
import ProjectActivityFeed from './lists/existing/ProjectActivityFeed';
import ProjectAlertsCard from './lists/existing/ProjectAlertsCard';
import TeamDirectoryCard from './lists/existing/TeamDirectoryCard';
import TeamAnnouncementsCard from './lists/existing/TeamAnnouncementsCard';
import RecentConversationsCard from './lists/existing/RecentConversationsCard';
import AssignedTasksCard from '../contractor/AssignedTasksCard';
import ProjectCommentsCard from '../contractor/ProjectCommentsCard';
import PaymentRequestsCard from '../contractor/PaymentRequestsCard';
import PaymentHistoryCard from '../contractor/PaymentHistoryCard';
import ChartsDashboard from './charts/existing/ChartsDashboard';
import QuickActionsWidget from './widgets/QuickActionsWidget';
import UsersTable from './tables/UsersTable';
import ProjectsTable from './tables/ProjectsTable';

// Also import the new ones we created for comparison
import UserStatsCard from './cards/UserStatsCard';
import ProjectMetricsCard from './cards/ProjectMetricsCard';
import BudgetOverviewCard from './cards/BudgetOverviewCard';

/**
 * Component Registry Structure
 * 
 * Each component entry contains:
 * - key: Unique identifier for the component
 * - name: Display name shown in the UI
 * - description: What the component does
 * - category: Component type (card, chart, list, table, widget)
 * - component: The actual React component
 * - filePath: Path to the component file (for reference)
 * - props: Expected props structure (for documentation)
 * - preview: Preview image or description
 */

export const DASHBOARD_COMPONENTS = {
  // Card Components
  cards: {
    // Existing good components (using database keys)
    metrics: {
      key: 'metrics',
      name: 'Key Performance Indicators',
      description: 'Shows currently active users with real-time status indicators and communication options',
      category: 'card',
      component: ActiveUsersCard,
      filePath: 'components/ActiveUsersCard.jsx',
      props: {
        currentUser: 'object'
      },
      preview: 'Live user activity with chat, call options, and online status'
    },
    quickStats: {
      key: 'quickStats',
      name: 'Quick Stats',
      description: 'Key Performance Indicators with currency formatting and customizable metrics',
      category: 'card',
      component: KpiCard,
      filePath: 'components/KpiCard.jsx',
      props: {
        label: 'string',
        value: 'number',
        isCurrency: 'boolean'
      },
      preview: 'Displays key metrics with professional formatting and currency support'
    },
    contractorMetrics: {
      key: 'contractorMetrics',
      name: 'Contractor Metrics',
      description: 'Contractor-specific performance metrics and statistics',
      category: 'card',
      component: ContractorMetricsCard,
      filePath: 'components/contractor/ContractorMetricsCard.jsx',
      props: {
        user: 'object'
      },
      preview: 'Contractor performance data, completion rates, and earnings'
    },
    financialSummary: {
      key: 'financialSummary',
      name: 'Financial Summary',
      description: 'Financial overview and earnings analytics for contractors',
      category: 'card',
      component: FinancialSummaryCard,
      filePath: 'components/contractor/FinancialSummaryCard.jsx',
      props: {
        user: 'object'
      },
      preview: 'Earnings overview, payment status, and financial analytics'
    },
    
    // New components for comparison
    user_stats_card: {
      key: 'user_stats_card',
      name: 'User Statistics Card (New)',
      description: 'Simple user registration statistics with growth metrics',
      category: 'card',
      component: UserStatsCard,
      filePath: 'components/dashboard/cards/UserStatsCard.jsx',
      props: {
        showGrowth: 'boolean',
        timeRange: 'string',
        user: 'object'
      },
      preview: 'Basic user stats with trend indicators'
    },
    project_metrics_card: {
      key: 'project_metrics_card',
      name: 'Project Metrics Card (New)',
      description: 'Basic project statistics overview',
      category: 'card',
      component: ProjectMetricsCard,
      filePath: 'components/dashboard/cards/ProjectMetricsCard.jsx',
      props: {
        user: 'object',
        showDetails: 'boolean'
      },
      preview: 'Project counts and completion rates'
    },
    budget_overview_card: {
      key: 'budget_overview_card',
      name: 'Budget Overview Card (New)',
      description: 'Financial overview with budget allocation',
      category: 'card',
      component: BudgetOverviewCard,
      filePath: 'components/dashboard/cards/BudgetOverviewCard.jsx',
      props: {
        user: 'object',
        currency: 'string'
      },
      preview: 'Budget allocation and spending visualization'
    }
  },

  // Chart Components
  charts: {
    // Existing good component (using database key)
    charts: {
      key: 'charts',
      name: 'Analytics Charts',
      description: 'Comprehensive analytics dashboard with multiple chart types and interactive visualizations',
      category: 'chart',
      component: ChartsDashboard,
      filePath: 'components/dashboard/ChartsDashboard.jsx',
      props: {
        user: 'object',
        filters: 'object'
      },
      preview: 'Interactive charts dashboard with multiple visualization types and filtering options'
    }
  },

  // List Components
  lists: {
    // Existing good components (using database keys)
    tasks: {
      key: 'tasks',
      name: 'Project Tasks',
      description: 'Comprehensive project task management with status tracking, priorities, and assignments',
      category: 'list',
      component: ProjectTasksCard,
      filePath: 'components/ProjectTasksCard.jsx',
      props: {
        currentUser: 'object'
      },
      preview: 'Task list with progress bars, priority indicators, and action buttons'
    },
    activity: {
      key: 'activity',
      name: 'Project Activity',
      description: 'Real-time project activity feed with comments, milestones, and updates',
      category: 'list',
      component: ProjectActivityFeed,
      filePath: 'components/ProjectActivityFeed.jsx',
      props: {
        currentUser: 'object'
      },
      preview: 'Activity timeline with icons, timestamps, and detailed project events'
    },
    projectActivity: {
      key: 'projectActivity',
      name: 'Project Activity',
      description: 'Activity feed for assigned projects',
      category: 'list',
      component: ProjectActivityFeed,
      filePath: 'components/ProjectActivityFeed.jsx',
      props: {
        currentUser: 'object'
      },
      preview: 'Activity timeline with icons, timestamps, and detailed project events'
    },
    alerts: {
      key: 'alerts',
      name: 'Project Alerts',
      description: 'Critical project alerts and notifications with priority levels',
      category: 'list',
      component: ProjectAlertsCard,
      filePath: 'components/ProjectAlertsCard.jsx',
      props: {
        currentUser: 'object'
      },
      preview: 'Alert system with severity indicators and action items'
    },
    teamDirectory: {
      key: 'teamDirectory',
      name: 'Team Directory',
      description: 'Searchable team member directory with contact information and roles',
      category: 'list',
      component: TeamDirectoryCard,
      filePath: 'components/TeamDirectoryCard.jsx',
      props: {
        currentUser: 'object'
      },
      preview: 'Team member cards with photos, roles, and contact options'
    },
    announcements: {
      key: 'announcements',
      name: 'Team Announcements',
      description: 'Team-wide announcements and important updates',
      category: 'list',
      component: TeamAnnouncementsCard,
      filePath: 'components/TeamAnnouncementsCard.jsx',
      props: {
        currentUser: 'object'
      },
      preview: 'Announcement feed with timestamps and importance levels'
    },
    conversations: {
      key: 'conversations',
      name: 'Recent Conversations',
      description: 'Recent chat conversations and communication history',
      category: 'list',
      component: RecentConversationsCard,
      filePath: 'components/RecentConversationsCard.jsx',
      props: {
        currentUser: 'object'
      },
      preview: 'Chat history with participant info and message previews'
    },
    recentActivity: {
      key: 'recentActivity',
      name: 'Recent Activity',
      description: 'Display recent system activities',
      category: 'list',
      component: ProjectActivityFeed,
      filePath: 'components/ProjectActivityFeed.jsx',
      props: {
        currentUser: 'object'
      },
      preview: 'Recent system activities and updates'
    },
    assignedTasks: {
      key: 'assignedTasks',
      name: 'My Assigned Tasks',
      description: 'Tasks specifically assigned to the current user',
      category: 'list',
      component: AssignedTasksCard,
      filePath: 'components/contractor/AssignedTasksCard.jsx',
      props: {
        user: 'object'
      },
      preview: 'Personal task list with deadlines and completion status'
    },
    projectComments: {
      key: 'projectComments',
      name: 'Project Comments',
      description: 'Comments and feedback on projects with threaded discussions',
      category: 'list',
      component: ProjectCommentsCard,
      filePath: 'components/contractor/ProjectCommentsCard.jsx',
      props: {
        user: 'object'
      },
      preview: 'Comment threads with user avatars and timestamps'
    },
    paymentRequests: {
      key: 'paymentRequests',
      name: 'Payment Requests',
      description: 'Submit and track payment requests with status updates',
      category: 'list',
      component: PaymentRequestsCard,
      filePath: 'components/contractor/PaymentRequestsCard.jsx',
      props: {
        user: 'object'
      },
      preview: 'Payment request forms and status tracking'
    },
    paymentHistory: {
      key: 'paymentHistory',
      name: 'Payment History',
      description: 'View payment history and receipts with detailed records',
      category: 'list',
      component: PaymentHistoryCard,
      filePath: 'components/contractor/PaymentHistoryCard.jsx',
      props: {
        user: 'object'
      },
      preview: 'Payment records with amounts, dates, and receipt links'
    }
  },

  // Table Components
  tables: {
    users_table: {
      key: 'users_table',
      name: 'Users Table',
      description: 'Tabular view of system users with filtering and sorting capabilities',
      category: 'table',
      component: UsersTable,
      filePath: 'components/dashboard/tables/UsersTable.jsx',
      props: {
        user: 'object',
        showActions: 'boolean',
        pageSize: 'number'
      },
      preview: 'Data grid showing user information with search and filter options'
    },
    projects_table: {
      key: 'projects_table',
      name: 'Projects Table',
      description: 'Comprehensive table of projects with status, progress, and management options',
      category: 'table',
      component: ProjectsTable,
      filePath: 'components/dashboard/tables/ProjectsTable.jsx',
      props: {
        user: 'object',
        showProgress: 'boolean'
      },
      preview: 'Project listing with status indicators, progress bars, and action buttons'
    }
  },

  // Widget Components
  widgets: {
    quick_actions_widget: {
      key: 'quick_actions_widget',
      name: 'Quick Actions Widget',
      description: 'Interactive widget with frequently used actions and shortcuts',
      category: 'widget',
      component: QuickActionsWidget,
      filePath: 'components/dashboard/widgets/QuickActionsWidget.jsx',
      props: {
        user: 'object',
        actions: 'array'
      },
      preview: 'Button grid with common actions like "Add Project", "View Reports", etc.'
    }
  }
};

/**
 * Get all components as a flat array
 */
export const getAllComponents = () => {
  const allComponents = [];
  Object.keys(DASHBOARD_COMPONENTS).forEach(category => {
    Object.values(DASHBOARD_COMPONENTS[category]).forEach(component => {
      allComponents.push(component);
    });
  });
  return allComponents;
};

/**
 * Get components by category
 */
export const getComponentsByCategory = (category) => {
  return Object.values(DASHBOARD_COMPONENTS[category] || {});
};

/**
 * Get component by key
 */
export const getComponentByKey = (key) => {
  const allComponents = getAllComponents();
  return allComponents.find(comp => comp.key === key);
};

/**
 * Get available categories
 */
export const getCategories = () => {
  return Object.keys(DASHBOARD_COMPONENTS);
};

/**
 * Component categories with descriptions
 */
export const COMPONENT_CATEGORIES = {
  cards: {
    name: 'Cards',
    description: 'Display key metrics, statistics, and summary information',
    icon: 'Dashboard'
  },
  charts: {
    name: 'Charts',
    description: 'Data visualization components for analytics and reporting',
    icon: 'Analytics'
  },
  lists: {
    name: 'Lists',
    description: 'Display items in list format like activities and notifications',
    icon: 'List'
  },
  tables: {
    name: 'Tables',
    description: 'Tabular data display with sorting and filtering capabilities',
    icon: 'Table'
  },
  widgets: {
    name: 'Widgets',
    description: 'Interactive components and tools for user actions',
    icon: 'Widgets'
  }
};

export default DASHBOARD_COMPONENTS;

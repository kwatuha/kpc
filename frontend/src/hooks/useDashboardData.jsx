import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../api/dashboardService';

const useDashboardData = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    notifications: [],
    profile: {},
    metrics: {},
    recentActivity: [],
    loading: true,
    error: null
  });

  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // For now, use fallback data since API endpoints don't exist yet
      // In the future, replace this with actual API calls
      const fallbackData = {
        notifications: [
          { id: 1, type: 'timeline', title: 'New Timeline Notifications', count: 0, priority: 'low', icon: 'schedule' },
          { id: 2, type: 'project', title: 'New Project Updates', count: 1, priority: 'medium', icon: 'assignment' },
          { id: 3, type: 'task', title: "Today's Pending Tasks", count: 0, priority: 'high', icon: 'warning' },
          { id: 4, type: 'message', title: 'New Messages & Chats', count: 0, priority: 'low', icon: 'email' },
        ],
        profile: {
          name: user?.username || 'John Doe',
          role: user?.roleName || 'Employee',
          email: 'user@example.com',
          phone: '000-000-0000',
          lastOnline: '2 minutes ago',
          profileComplete: 75,
          leaveDays: { taken: 5, remaining: 15 },
          about: 'Active team member',
          verified: true,
        },
        metrics: {
          totalProjects: 12,
          activeProjects: 8,
          completedProjects: 4,
          pendingApprovals: 3,
          budgetUtilization: 75,
          teamMembers: 24,
        },
        recentActivity: [
          { id: 1, action: 'Project "Water Management" updated', time: '2 hours ago', type: 'project' },
          { id: 2, action: 'New team member added to "Infrastructure"', time: '4 hours ago', type: 'team' },
          { id: 3, action: 'Budget approval required for "Health Initiative"', time: '1 day ago', type: 'approval' },
        ],
      };

      // No artificial delay - fetch immediately

      setDashboardData({
        ...fallbackData,
        loading: false,
        error: null
      });

      // TODO: Replace with actual API calls when endpoints are available
      /*
      const [
        notifications,
        profile,
        metrics,
        recentActivity
      ] = await Promise.all([
        dashboardService.getNotifications(user.id),
        dashboardService.getUserProfile(user.id),
        dashboardService.getMetrics(user.id, user.roleName),
        dashboardService.getRecentActivity(user.id)
      ]);

      setDashboardData({
        notifications,
        profile,
        metrics,
        recentActivity,
        loading: false,
        error: null
      });
      */
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch dashboard data'
      }));
    }
  }, [user?.id, user?.roleName]);

  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, [fetchDashboardData]);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await dashboardService.markNotificationAsRead(notificationId);
      
      // Update local state
      setDashboardData(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, count: 0, read: true }
            : notification
        )
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      const updatedProfile = await dashboardService.updateUserProfile(user.id, profileData);
      
      setDashboardData(prev => ({
        ...prev,
        profile: { ...prev.profile, ...updatedProfile }
      }));
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [user?.id]);

  // Get role-specific data
  const getRoleBasedData = useCallback(async () => {
    if (!user?.id || !user?.roleName) return null;

    try {
      const roleData = await dashboardService.getRoleBasedData(user.id, user.roleName);
      return roleData;
    } catch (error) {
      console.error('Error fetching role-based data:', error);
      return null;
    }
  }, [user?.id, user?.roleName]);

  // Export dashboard data
  const exportData = useCallback(async (format = 'pdf') => {
    try {
      const blob = await dashboardService.exportDashboardData(user.id, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }, [user?.id]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!user?.id) return;

    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchDashboardData, user?.id]);

  return {
    dashboardData,
    refreshing,
    refreshDashboard,
    markNotificationAsRead,
    updateProfile,
    getRoleBasedData,
    exportData,
    fetchDashboardData
  };
};

export default useDashboardData;

import axiosInstance from '../api/axiosInstance';

/**
 * Data Access Service
 * Handles user-specific data filtering and access control
 */
class DataAccessService {
  
  /**
   * Get user's data access configuration for a specific component
   */
  async getUserDataAccess(userId, componentKey) {
    try {
      const response = await axiosInstance.get(`/data-access/user/${userId}/component/${componentKey}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data access:', error);
      throw error;
    }
  }

  /**
   * Get user's department assignments
   */
  async getUserDepartments(userId) {
    try {
      const response = await axiosInstance.get(`/data-access/user/${userId}/departments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user departments:', error);
      return [];
    }
  }

  /**
   * Get user's ward assignments
   */
  async getUserWards(userId) {
    try {
      const response = await axiosInstance.get(`/data-access/user/${userId}/wards`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user wards:', error);
      return [];
    }
  }

  /**
   * Get user's project assignments
   */
  async getUserProjects(userId) {
    try {
      const response = await axiosInstance.get(`/data-access/user/${userId}/projects`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user projects:', error);
      return [];
    }
  }

  /**
   * Get user's data filters
   */
  async getUserDataFilters(userId) {
    try {
      const response = await axiosInstance.get(`/data-access/user/${userId}/filters`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data filters:', error);
      return [];
    }
  }

  /**
   * Update user's data filters
   */
  async updateUserDataFilters(userId, filters) {
    try {
      const response = await axiosInstance.put(`/data-access/user/${userId}/filters`, { filters });
      return response.data;
    } catch (error) {
      console.error('Error updating user data filters:', error);
      throw error;
    }
  }

  /**
   * Assign user to departments
   */
  async assignUserToDepartments(userId, departmentIds, isPrimary = false) {
    try {
      const response = await axiosInstance.post(`/data-access/user/${userId}/departments`, {
        departmentIds,
        isPrimary
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning user to departments:', error);
      throw error;
    }
  }

  /**
   * Assign user to wards
   */
  async assignUserToWards(userId, wardAssignments) {
    try {
      const response = await axiosInstance.post(`/data-access/user/${userId}/wards`, {
        wardAssignments
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning user to wards:', error);
      throw error;
    }
  }

  /**
   * Assign user to projects
   */
  async assignUserToProjects(userId, projectAssignments) {
    try {
      const response = await axiosInstance.post(`/data-access/user/${userId}/projects`, {
        projectAssignments
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning user to projects:', error);
      throw error;
    }
  }

  /**
   * Get filtered projects based on user access
   */
  async getFilteredProjects(userId, additionalFilters = {}) {
    try {
      const response = await axiosInstance.get(`/data-access/user/${userId}/filtered-projects`, {
        params: additionalFilters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered projects:', error);
      throw error;
    }
  }

  /**
   * Get filtered dashboard data based on user access
   */
  async getFilteredDashboardData(userId, componentKey, additionalFilters = {}) {
    try {
      const response = await axiosInstance.get(`/data-access/user/${userId}/dashboard-data/${componentKey}`, {
        params: additionalFilters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered dashboard data:', error);
      throw error;
    }
  }

  /**
   * Check if user can access specific data
   */
  async canUserAccessData(userId, dataType, dataId) {
    try {
      const response = await axiosInstance.get(`/data-access/user/${userId}/can-access/${dataType}/${dataId}`);
      return response.data.canAccess;
    } catch (error) {
      console.error('Error checking user data access:', error);
      return false;
    }
  }

  /**
   * Get component access rules
   */
  async getComponentAccessRules(componentKey) {
    try {
      const response = await axiosInstance.get(`/data-access/component/${componentKey}/rules`);
      return response.data;
    } catch (error) {
      console.error('Error fetching component access rules:', error);
      return null;
    }
  }
}

export default new DataAccessService();

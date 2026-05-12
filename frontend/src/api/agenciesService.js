// src/api/agenciesService.js
import axiosInstance from './axiosInstance';

/**
 * @file API service for Agencies related calls.
 * @description Handles fetching agencies from agencies table.
 */

const agenciesService = {
  /**
   * Get all agencies (paginated)
   * @param {Object} params - Query parameters (page, limit, search)
   * @returns {Promise<Object>} Object with data and pagination info
   */
  getAgencies: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/agencies', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching agencies:', error);
      throw error;
    }
  },

  /**
   * Get all agencies for dropdown (no pagination, limited to 1000)
   * @param {string} search - Optional search term
   * @returns {Promise<Array>} Array of agency objects
   */
  getAllAgencies: async (search = '') => {
    try {
      // Try public endpoint first (no authentication required)
      try {
        const response = await axiosInstance.get('/public/agencies', {
          params: { search }
        });
        console.log('Public agencies endpoint response:', response.data); // Debug
        return response.data.data || [];
      } catch (publicError) {
        console.warn('Public endpoint failed, trying export endpoint:', publicError);
        // Fallback to export endpoint
        try {
          const response = await axiosInstance.get('/agencies/export/all', {
            params: { search }
          });
          console.log('Export endpoint response:', response.data); // Debug
          return response.data.data || [];
        } catch (exportError) {
          console.warn('Export endpoint failed, trying paginated endpoint:', exportError);
          // Fallback to paginated endpoint
          const response = await axiosInstance.get('/agencies', {
            params: {
              limit: 1000,
              page: 1,
              search
            }
          });
          console.log('Paginated endpoint response:', response.data); // Debug
          return response.data.data || [];
        }
      }
    } catch (error) {
      console.error('Error fetching all agencies:', error);
      throw error;
    }
  },

  /**
   * Get a single agency by ID
   * @param {number} id - Agency ID
   * @returns {Promise<Object>} Agency object
   */
  getAgencyById: async (id) => {
    try {
      const response = await axiosInstance.get(`/agencies/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agency:', error);
      throw error;
    }
  },
};

export default agenciesService;

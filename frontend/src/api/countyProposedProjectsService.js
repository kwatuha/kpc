// src/api/countyProposedProjectsService.js
import axiosInstance from './axiosInstance';

/**
 * API service for Proposed Projects Management
 */
const countyProposedProjectsService = {
  /**
   * Get all proposed projects with optional filtering
   * @param {object} filters - Filter parameters (category, status, priority, page, limit, search)
   * @returns {Promise<Object>} Response with projects and pagination
   */
  getProjects: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const url = queryString ? `/county-proposed-projects?${queryString}` : '/county-proposed-projects';
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Get a specific project by ID
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} Project data
   */
  getProjectById: async (projectId) => {
    const response = await axiosInstance.get(`/county-proposed-projects/${projectId}`);
    return response.data;
  },

  /**
   * Create a new proposed project
   * @param {object} projectData - Project data
   * @returns {Promise<Object>} Created project data
   */
  createProject: async (projectData) => {
    const response = await axiosInstance.post('/county-proposed-projects', projectData);
    return response.data;
  },

  /**
   * Update an existing project
   * @param {number} projectId - Project ID
   * @param {object} projectData - Updated project data
   * @returns {Promise<Object>} Updated project data
   */
  updateProject: async (projectId, projectData) => {
    const response = await axiosInstance.put(`/county-proposed-projects/${projectId}`, projectData);
    return response.data;
  },

  /**
   * Delete a project (soft delete)
   * @param {number} projectId - Project ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteProject: async (projectId) => {
    const response = await axiosInstance.delete(`/county-proposed-projects/${projectId}`);
    return response.data;
  }
};

export default countyProposedProjectsService;


// src/api/projectAnnouncementsService.js
import axiosInstance from './axiosInstance';

/**
 * API service for Project Announcements Management
 */
const projectAnnouncementsService = {
  /**
   * Get all project announcements with optional filtering
   * @param {object} filters - Filter parameters (category, status, page, limit, search)
   * @returns {Promise<Object>} Response with announcements and pagination
   */
  getAnnouncements: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    const url = queryString ? `/project-announcements?${queryString}` : '/project-announcements';
    const response = await axiosInstance.get(url);
    return response.data;
  },

  /**
   * Get a specific announcement by ID
   * @param {number} announcementId - Announcement ID
   * @returns {Promise<Object>} Announcement data
   */
  getAnnouncementById: async (announcementId) => {
    const response = await axiosInstance.get(`/project-announcements/${announcementId}`);
    return response.data;
  },

  /**
   * Create a new project announcement
   * @param {object} announcementData - Announcement data
   * @returns {Promise<Object>} Created announcement data
   */
  createAnnouncement: async (announcementData) => {
    const response = await axiosInstance.post('/project-announcements', announcementData);
    return response.data;
  },

  /**
   * Update an existing announcement
   * @param {number} announcementId - Announcement ID
   * @param {object} announcementData - Updated announcement data
   * @returns {Promise<Object>} Updated announcement data
   */
  updateAnnouncement: async (announcementId, announcementData) => {
    const response = await axiosInstance.put(`/project-announcements/${announcementId}`, announcementData);
    return response.data;
  },

  /**
   * Delete an announcement (soft delete)
   * @param {number} announcementId - Announcement ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteAnnouncement: async (announcementId) => {
    const response = await axiosInstance.delete(`/project-announcements/${announcementId}`);
    return response.data;
  }
};

export default projectAnnouncementsService;


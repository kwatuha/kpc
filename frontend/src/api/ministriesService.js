import axiosInstance from './axiosInstance';

const ministriesService = {
  /**
   * Ministries with nested state departments (same shape as Ministries management page).
   */
  getMinistriesWithDepartments: async () => {
    const response = await axiosInstance.get('/ministries', { params: { withDepartments: '1' } });
    const data = response.data;
    return Array.isArray(data) ? data : [];
  },
};

export default ministriesService;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const regionalService = {
    // Get county-level data
    getCountiesData: async (filters = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/counties`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching counties data:', error);
            throw error;
        }
    },

    // Get sub-county level data
    getSubCountiesData: async (filters = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/sub-counties`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching sub-counties data:', error);
            throw error;
        }
    },

    // Get ward-level data
    getWardsData: async (filters = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/wards`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching wards data:', error);
            throw error;
        }
    },

    // Get village-level data
    getVillagesData: async (filters = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/villages`, {
                params: filters
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching villages data:', error);
            throw error;
        }
    },

    // Get projects by county
    getProjectsByCounty: async (countyName) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/projects-by-county`, {
                params: { county: countyName }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching projects by county:', error);
            throw error;
        }
    },

    // Get projects by sub-county
    getProjectsBySubCounty: async (subCountyName) => {
        try {
            console.log('regionalService.getProjectsBySubCounty called with:', subCountyName);
            console.log('API_BASE_URL:', API_BASE_URL);
            console.log('Full URL:', `${API_BASE_URL}/reports/projects-by-sub-county`);
            console.log('Params:', { subCounty: subCountyName });
            
            const response = await axios.get(`${API_BASE_URL}/reports/projects-by-sub-county`, {
                params: { subCounty: subCountyName }
            });
            console.log('API response received:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching projects by sub-county:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    },

    // Get projects by ward
    getProjectsByWard: async (wardName) => {
        try {
            console.log('regionalService.getProjectsByWard called with:', wardName);
            console.log('API_BASE_URL:', API_BASE_URL);
            console.log('Full URL:', `${API_BASE_URL}/reports/projects-by-ward`);
            console.log('Params:', { ward: wardName });
            
            const response = await axios.get(`${API_BASE_URL}/reports/projects-by-ward`, {
                params: { ward: wardName }
            });
            console.log('API response received:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching projects by ward:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    },

    // Get projects by village
    getProjectsByVillage: async (villageName) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/projects-by-village`, {
                params: { village: villageName }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching projects by village:', error);
            throw error;
        }
    },

    // Get regional filter options
    getRegionalFilterOptions: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/reports/regional-filter-options`);
            return response.data;
        } catch (error) {
            console.error('Error fetching regional filter options:', error);
            throw error;
        }
    }
};

export default regionalService;

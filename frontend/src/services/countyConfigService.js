// frontend/src/services/countyConfigService.js
// Service for loading county-specific configuration

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

let countyConfigCache = null;

/**
 * Fetch county configuration from API
 */
export const fetchCountyConfig = async () => {
  if (countyConfigCache) {
    return countyConfigCache;
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/county-config`);
    countyConfigCache = response.data;
    return countyConfigCache;
  } catch (error) {
    console.error('Error fetching county configuration:', error);
    // Return default configuration on error
    return {
      county: {
        code: 'KEMRI',
        name: 'KEMRI',
        displayName: 'Kenya Medical Research Institute'
      },
      organization: {
        name: 'Kenya Medical Research Institute',
        contact: {
          email: 'info@kemri.go.ke',
          phone: '+254-20-272-2541',
          address: 'P.O. Box 54840-00200, Nairobi, Kenya',
          website: 'https://www.kemri.go.ke'
        }
      },
      labels: {
        department: 'Department',
        section: 'Section',
        directorate: 'Directorate',
        project: 'Project',
        subcounty: 'Sub-County',
        ward: 'Ward',
        program: 'Program',
        subprogram: 'Sub-Program'
      },
      features: {
        departments: true,
        sections: true,
        directorates: true,
        projects: true,
        subcounties: true,
        wards: true,
        programs: true,
        subprograms: true
      }
    };
  }
};

/**
 * Clear county config cache (useful for testing or switching counties)
 */
export const clearCountyConfigCache = () => {
  countyConfigCache = null;
};

/**
 * Get county config synchronously (returns cached value or null)
 */
export const getCountyConfig = () => {
  return countyConfigCache;
};

export default {
  fetchCountyConfig,
  clearCountyConfigCache,
  getCountyConfig
};





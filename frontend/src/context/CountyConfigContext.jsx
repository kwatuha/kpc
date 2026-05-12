// frontend/src/context/CountyConfigContext.jsx
// Context for county-specific configuration

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCountyConfig } from '../services/countyConfigService';

const CountyConfigContext = createContext(null);

export const CountyConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const countyConfig = await fetchCountyConfig();
        setConfig(countyConfig);
        setError(null);
      } catch (err) {
        console.error('Error loading county configuration:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const value = {
    config,
    loading,
    error,
    // Helper functions
    getLabel: (key) => config?.labels?.[key] || key,
    getOrganization: () => config?.organization || {},
    getCounty: () => config?.county || {},
    hasFeature: (feature) => config?.features?.[feature] ?? false
  };

  return (
    <CountyConfigContext.Provider value={value}>
      {children}
    </CountyConfigContext.Provider>
  );
};

export const useCountyConfig = () => {
  const context = useContext(CountyConfigContext);
  if (!context) {
    throw new Error('useCountyConfig must be used within a CountyConfigProvider');
  }
  return context;
};

export default CountyConfigContext;





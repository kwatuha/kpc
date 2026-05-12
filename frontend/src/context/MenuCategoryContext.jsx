import React, { createContext, useContext, useState } from 'react';

const MenuCategoryContext = createContext();

export const useMenuCategory = () => {
  const context = useContext(MenuCategoryContext);
  if (!context) {
    throw new Error('useMenuCategory must be used within MenuCategoryProvider');
  }
  return context;
};

export const MenuCategoryProvider = ({ children }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('dashboard');

  return (
    <MenuCategoryContext.Provider value={{ selectedCategoryId, setSelectedCategoryId }}>
      {children}
    </MenuCategoryContext.Provider>
  );
};










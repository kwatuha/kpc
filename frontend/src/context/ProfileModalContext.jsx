import React, { createContext, useContext, useState } from 'react';

const ProfileModalContext = createContext();

export const useProfileModal = () => {
  const context = useContext(ProfileModalContext);
  if (!context) {
    throw new Error('useProfileModal must be used within a ProfileModalProvider');
  }
  return context;
};

export const ProfileModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <ProfileModalContext.Provider value={{
      isOpen,
      openModal,
      closeModal,
    }}>
      {children}
    </ProfileModalContext.Provider>
  );
};








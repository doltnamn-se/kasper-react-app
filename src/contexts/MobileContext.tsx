
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useIsMobile } from '../hooks/use-mobile';

interface MobileContextType {
  isMobile: boolean;
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export const MobileProvider = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile();
  
  return (
    <MobileContext.Provider value={{ isMobile }}>
      {children}
    </MobileContext.Provider>
  );
};

export const useMobileContext = () => {
  const context = useContext(MobileContext);
  if (context === undefined) {
    throw new Error('useMobileContext must be used within a MobileProvider');
  }
  return context;
};

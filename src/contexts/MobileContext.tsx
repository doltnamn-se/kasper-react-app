
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileContextType {
  isMobile: boolean;
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const isMobileDevice = useIsMobile();
  
  return (
    <MobileContext.Provider value={{ isMobile: isMobileDevice }}>
      {children}
    </MobileContext.Provider>
  );
}

export function useMobileContext() {
  const context = useContext(MobileContext);
  
  if (context === undefined) {
    throw new Error('useMobileContext must be used within a MobileProvider');
  }
  
  return context;
}

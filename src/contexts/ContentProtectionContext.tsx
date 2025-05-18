import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface ContentProtectionContextType {
  isContentLocked: boolean;
  setContentLocked: (locked: boolean) => void;
}

const ContentProtectionContext = createContext<ContentProtectionContextType | undefined>(undefined);

export const ContentProtectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [isContentLocked, setContentLocked] = useState(true);

  // Check if content should be locked based on auth and subscription
  useEffect(() => {
    if (!isAuthenticated) {
      // Not authenticated, always lock content
      setContentLocked(true);
      return;
    }

    // Authenticated but check subscription
    if (currentUser?.subscription?.isActive) {
      // User has an active subscription, unlock content
      setContentLocked(false);
    } else {
      // User is authenticated but doesn't have an active subscription
      setContentLocked(true);
    }
  }, [currentUser, isAuthenticated]);

  const value = {
    isContentLocked,
    setContentLocked
  };

  return (
    <ContentProtectionContext.Provider value={value}>
      {children}
    </ContentProtectionContext.Provider>
  );
};

export const useContentProtection = (): ContentProtectionContextType => {
  const context = useContext(ContentProtectionContext);
  if (context === undefined) {
    throw new Error('useContentProtection must be used within a ContentProtectionProvider');
  }
  return context;
}; 
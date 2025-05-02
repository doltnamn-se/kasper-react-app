
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuthStatus } from '@/hooks/useAuthStatus';

/**
 * Hook providing authentication state and user information
 */
export const useAuth = () => {
  const { isAuthenticated, userId } = useAuthStatus();
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<{ id?: string } | null>(null);

  useEffect(() => {
    // Set user data based on auth status
    if (isAuthenticated && userId) {
      setUser({ id: userId });
    } else {
      setUser(null);
    }
    
    setInitialized(true);
  }, [isAuthenticated, userId]);

  return {
    initialized,
    user,
    isAuthenticated
  };
};

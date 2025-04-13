
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === 'info@digitaltskydd.se') {
        setIsAdmin(true);
      }
    };

    checkAdminStatus();
  }, []);

  return isAdmin;
};

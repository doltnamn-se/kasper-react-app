import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isIOS, isAndroid, isWeb } from '@/capacitor';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

export const MobileIntroRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobileScreen = useIsMobile();

  useEffect(() => {
    const checkAndRedirect = async () => {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      // If user is authenticated, don't redirect to intro
      if (session) {
        return;
      }

      // Check if we should show intro page
      const shouldShowIntro = 
        isIOS() || // iOS app
        isAndroid() || // Android app
        (isWeb() && isMobileScreen); // Mobile web

      // Only redirect if we're not already on intro or auth pages
      const isOnIntroOrAuth = location.pathname === '/intro' || 
                             location.pathname.startsWith('/auth') ||
                             location.pathname === '/completion';

      if (shouldShowIntro && !isOnIntroOrAuth) {
        navigate('/intro', { replace: true });
      }
    };

    checkAndRedirect();
  }, [navigate, location, isMobileScreen]);

  return null;
};


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export const useAuthStatus = () => {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        // Check if user is banned
        if (session?.user) {
          const userData = session.user as any;
          if (userData.banned_until && new Date(userData.banned_until) > new Date()) {
            console.log("User is banned, signing out");
            await supabase.auth.signOut();
            toast.error(t('errors.user_banned'));
            if (mounted) {
              setIsAuthenticated(false);
              setUserId(undefined);
              setIsLoading(false);
            }
            return;
          }
        }

        if (mounted) {
          setIsAuthenticated(!!session);
          setUserId(session?.user?.id);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth status error:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          toast.error("Authentication error. Please try logging in again.");
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        // Check if user is banned on auth state change
        if (session?.user) {
          const userData = session.user as any;
          if (userData.banned_until && new Date(userData.banned_until) > new Date()) {
            console.log("User is banned, preventing authentication");
            supabase.auth.signOut().then(() => {
              if (mounted) {
                setIsAuthenticated(false);
                setUserId(undefined);
                setIsLoading(false);
                toast.error(t('errors.user_banned'));
              }
            });
            return;
          }
        }
        
        setIsAuthenticated(!!session);
        setUserId(session?.user?.id);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [t]);

  return { isAuthenticated, isLoading, userId };
};

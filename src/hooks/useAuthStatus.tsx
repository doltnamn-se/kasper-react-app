
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    console.log("useAuthStatus: Initializing auth check");
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const checkSession = async () => {
      try {
        console.log("useAuthStatus: Checking session");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("useAuthStatus: Session check error:", error);
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
            console.log("useAuthStatus: User is banned, signing out");
            await supabase.auth.signOut();
            if (mounted) {
              toast.error('User is banned');
              setIsAuthenticated(false);
              setUserId(undefined);
              setIsLoading(false);
            }
            return;
          }
        }

        if (mounted) {
          console.log("useAuthStatus: Session state updated:", !!session);
          setIsAuthenticated(!!session);
          setUserId(session?.user?.id);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("useAuthStatus: Auth status error:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          toast.error("Authentication error. Please try logging in again.");
        }
      }
    };

    // Set up the auth state change listener BEFORE checking the session
    // to prevent race conditions
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("useAuthStatus: Auth state changed:", event);
      
      if (!mounted) return;
      
      // Check if user is banned on auth state change
      if (session?.user) {
        const userData = session.user as any;
        if (userData.banned_until && new Date(userData.banned_until) > new Date()) {
          console.log("useAuthStatus: User is banned, preventing authentication");
          // Use setTimeout to avoid potential recursive issues with the auth state change
          setTimeout(async () => {
            if (!mounted) return;
            await supabase.auth.signOut();
            setIsAuthenticated(false);
            setUserId(undefined);
            setIsLoading(false);
            toast.error('User is banned');
          }, 0);
          return;
        }
      }
      
      setIsAuthenticated(!!session);
      setUserId(session?.user?.id);
      setIsLoading(false);
    });
    
    // Store the subscription for cleanup
    authSubscription = data.subscription;

    // Now check for existing session
    checkSession();

    return () => {
      console.log("useAuthStatus: Cleaning up");
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  return { isAuthenticated, isLoading, userId };
};

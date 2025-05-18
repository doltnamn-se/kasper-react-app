
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "./LoadingSpinner";

interface AuthRouteProps {
  children: React.ReactNode;
}

export const AuthRoute = ({ children }: AuthRouteProps) => {
  const [session, setSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    console.log("AuthRoute: Initializing");
    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;
    
    const checkAuth = async () => {
      try {
        // Special handling for callback route - always allow access
        if (location.pathname === '/auth/callback') {
          console.log("AuthRoute: On callback route, allowing access");
          if (mounted) {
            setSession(false);
            setIsLoading(false);
          }
          return;
        }

        // Get the type parameter from URL
        const params = new URLSearchParams(location.search);
        const type = params.get('type');
        const accessToken = params.get('access_token');
        
        console.log("AuthRoute: URL parameters -", { type, accessToken });

        // For recovery flow, we don't sign out - we need the session for password reset
        if (type === 'recovery') {
          console.log("AuthRoute: Recovery flow detected, maintaining session");
          if (mounted) {
            setSession(false);
            setIsLoading(false);
          }
          return;
        }

        // Get the session without making any changes
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthRoute: Session error:", error);
          // Clear any invalid session data
          if (error.message.includes('refresh_token_not_found')) {
            console.log("AuthRoute: Invalid refresh token, clearing session");
            await supabase.auth.signOut();
          }
          if (mounted) {
            setSession(false);
            setIsLoading(false);
          }
          return;
        }

        // Check if user is banned
        if (currentSession?.user) {
          const userData = currentSession.user as any;
          if (userData.banned_until && new Date(userData.banned_until) > new Date()) {
            console.log("AuthRoute: User is banned, signing out");
            await supabase.auth.signOut();
            if (mounted) {
              setSession(false);
              setIsLoading(false);
            }
            return;
          }
        }

        if (mounted) {
          console.log("AuthRoute: Session state set to", !!currentSession);
          setSession(!!currentSession);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("AuthRoute: Error checking auth:", error);
        // Clear any invalid session state
        await supabase.auth.signOut();
        if (mounted) {
          setSession(false);
          setIsLoading(false);
        }
      }
    };

    // Set up auth state change listener first
    authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthRoute: Auth state changed:", event);
      if (!mounted) return;
      
      // Special handling for recovery flow
      const params = new URLSearchParams(location.search);
      const type = params.get('type');
      
      if (type === 'recovery') {
        console.log("AuthRoute: Maintaining recovery flow");
        setSession(false);
        return;
      }
      
      // Check if user is banned on auth state change
      if (session?.user) {
        const userData = session.user as any;
        if (userData.banned_until && new Date(userData.banned_until) > new Date()) {
          console.log("AuthRoute: User is banned, preventing authentication");
          // Use setTimeout to avoid recursive issues
          setTimeout(async () => {
            if (!mounted) return;
            await supabase.auth.signOut();
            setSession(false);
            setIsLoading(false);
          }, 0);
          return;
        }
      }
      
      setSession(!!session);
      setIsLoading(false);
    }).subscription;

    // Check initial auth status
    checkAuth();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [location.pathname, location.search]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (session) {
    console.log("AuthRoute: Redirecting to home - user is authenticated");
    return <Navigate to="/" replace />;
  }

  // Return the children directly
  console.log("AuthRoute: Rendering auth content - user is not authenticated");
  return <>{children}</>;
};

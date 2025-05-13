
import { useEffect, useState, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "./LoadingSpinner";
import { LanguageProvider } from "@/contexts/LanguageContext";

interface AuthRouteProps {
  children: ReactNode; // Properly typing the children prop
}

export const AuthRoute = ({ children }: AuthRouteProps) => {
  const [session, setSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    console.log("AuthRoute: Initializing");
    
    const checkAuth = async () => {
      try {
        // Get the type parameter from URL
        const params = new URLSearchParams(location.search);
        const type = params.get('type');
        const accessToken = params.get('access_token');

        console.log("AuthRoute: URL parameters -", { type, accessToken });

        // Special handling for callback route
        if (location.pathname === '/auth/callback') {
          console.log("AuthRoute: On callback route, allowing access");
          setSession(false);
          setIsLoading(false);
          return;
        }

        // For recovery flow, we don't sign out - we need the session for password reset
        if (type === 'recovery') {
          console.log("AuthRoute: Recovery flow detected, maintaining session");
          setSession(false);
          setIsLoading(false);
          return;
        }

        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthRoute: Session error:", error);
          // Clear any invalid session data
          if (error.message.includes('refresh_token_not_found')) {
            console.log("AuthRoute: Invalid refresh token, clearing session");
            await supabase.auth.signOut();
          }
          setSession(false);
          setIsLoading(false);
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
          setSession(!!currentSession);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("AuthRoute: Error checking auth:", error);
        // Clear any invalid session state
        await supabase.auth.signOut();
        setSession(false);
      } finally {
        setIsLoading(false);
      }
    };

    let mounted = true;
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        // Check if user is banned on auth state change
        if (session?.user) {
          const userData = session.user as any;
          if (userData.banned_until && new Date(userData.banned_until) > new Date()) {
            console.log("AuthRoute: User is banned, preventing authentication");
            supabase.auth.signOut().then(() => {
              if (mounted) {
                setSession(false);
                setIsLoading(false);
              }
            });
            return;
          }
        }
        
        setSession(!!session);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [location.pathname, location.search]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  // Return the children directly - LanguageProvider is now handled in App.tsx globally
  return <>{children}</>;
};

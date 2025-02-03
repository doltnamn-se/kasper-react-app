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
    
    const checkAuth = async () => {
      try {
        // Get the type parameter from URL
        const params = new URLSearchParams(location.search);
        const type = params.get('type');
        const accessToken = params.get('access_token');

        console.log("AuthRoute: URL parameters -", { type, accessToken });

        // If this is a recovery flow, don't check session
        if (type === 'recovery') {
          console.log("AuthRoute: Recovery flow detected, allowing access");
          setSession(false);
          setIsLoading(false);
          return;
        }

        // Special handling for callback route
        if (location.pathname === '/auth/callback') {
          console.log("AuthRoute: On callback route, allowing access");
          setSession(false);
          setIsLoading(false);
          return;
        }

        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthRoute: Session error:", error);
          // If we get a refresh token error, clear the session
          if (error.message.includes('refresh_token_not_found')) {
            console.log("AuthRoute: Invalid refresh token, signing out");
            await supabase.auth.signOut();
          }
          setSession(false);
          setIsLoading(false);
          return;
        }
        
        if (currentSession) {
          // Don't redirect to home if we're in recovery flow
          if (type === 'recovery') {
            console.log("AuthRoute: Recovery flow with session, allowing access");
            setSession(false);
          } else {
            console.log("AuthRoute: Active session found, redirecting to home");
            setSession(true);
          }
        } else {
          console.log("AuthRoute: No session found, allowing auth page access");
          setSession(false);
        }
      } catch (error) {
        console.error("AuthRoute: Error checking auth:", error);
        setSession(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthRoute: Auth state changed:", event);
      
      // Get URL parameters
      const params = new URLSearchParams(location.search);
      const type = params.get('type');
      
      if (event === 'SIGNED_IN') {
        // Don't redirect if we're in recovery flow
        if (type === 'recovery') {
          console.log("AuthRoute: Signed in during recovery flow, staying on page");
          setSession(false);
        } else {
          console.log("AuthRoute: User signed in");
          setSession(true);
        }
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log("AuthRoute: User signed out or token refreshed");
        // Recheck session after token refresh
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error || !currentSession || type === 'recovery') {
          setSession(false);
        } else {
          setSession(true);
        }
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname, location.search]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
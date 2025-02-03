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

        // If this is a recovery flow, sign out any existing session first
        if (type === 'recovery') {
          console.log("AuthRoute: Recovery flow detected, signing out existing session");
          await supabase.auth.signOut();
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
          // Clear any invalid session data
          if (error.message.includes('refresh_token_not_found')) {
            console.log("AuthRoute: Invalid refresh token, clearing session");
            await supabase.auth.signOut();
          }
          setSession(false);
          setIsLoading(false);
          return;
        }
        
        if (currentSession) {
          console.log("AuthRoute: Active session found");
          setSession(true);
        } else {
          console.log("AuthRoute: No session found, allowing auth page access");
          setSession(false);
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

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthRoute: Auth state changed:", event);
      
      // Get URL parameters
      const params = new URLSearchParams(location.search);
      const type = params.get('type');
      
      if (event === 'SIGNED_IN') {
        // If we're in recovery flow, sign out immediately
        if (type === 'recovery') {
          console.log("AuthRoute: Signed in during recovery flow, signing out");
          await supabase.auth.signOut();
          setSession(false);
        } else {
          console.log("AuthRoute: User signed in");
          setSession(true);
        }
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        console.log("AuthRoute: User signed out");
        setSession(false);
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("AuthRoute: Token refreshed");
        setSession(!!session);
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
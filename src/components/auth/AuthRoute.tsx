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
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const location = useLocation();

  useEffect(() => {
    console.log("AuthRoute: Initializing");
    
    const checkAuth = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const type = params.get('type');
        const accessToken = params.get('access_token');

        console.log("AuthRoute: URL parameters -", { type, accessToken });

        // If this is a recovery flow, mark it and allow access
        if (type === 'recovery') {
          console.log("AuthRoute: Recovery flow detected");
          setIsRecoveryFlow(true);
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
          if (error.message.includes('refresh_token_not_found')) {
            console.log("AuthRoute: Invalid refresh token, signing out");
            await supabase.auth.signOut();
          }
          setSession(false);
          setIsLoading(false);
          return;
        }
        
        if (currentSession && !isRecoveryFlow) {
          console.log("AuthRoute: Active session found, redirecting to home");
          setSession(true);
        } else {
          console.log("AuthRoute: No session found or in recovery flow, allowing auth page access");
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
      
      const params = new URLSearchParams(location.search);
      const type = params.get('type');
      
      if (type === 'recovery') {
        setIsRecoveryFlow(true);
      }
      
      if (event === 'SIGNED_IN' && !isRecoveryFlow) {
        console.log("AuthRoute: User signed in");
        setSession(true);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        console.log("AuthRoute: User signed out or token refreshed");
        setSession(false);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname, location.search, isRecoveryFlow]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (session && !isRecoveryFlow) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
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
    const checkAuth = async () => {
      try {
        console.log("AuthRoute: Checking current session");
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("AuthRoute: Session error:", sessionError);
          setSession(false);
          setIsLoading(false);
          return;
        }

        if (!currentSession) {
          console.log("AuthRoute: No session found, allowing auth page access");
          setSession(false);
          setIsLoading(false);
          return;
        }

        if (location.pathname.includes('/auth/callback')) {
          console.log("AuthRoute: On callback page, allowing access");
          setSession(false);
          setIsLoading(false);
          return;
        }

        console.log("AuthRoute: Active session found, redirecting to home");
        setSession(true);
        setIsLoading(false);
      } catch (error) {
        console.error("AuthRoute: Error checking auth:", error);
        setSession(false);
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthRoute: Auth state changed:", event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        console.log("AuthRoute: User signed out");
        setSession(false);
        setIsLoading(false);
        return;
      }

      if (event === 'PASSWORD_RECOVERY') {
        console.log("AuthRoute: Password recovery in progress");
        setSession(false);
        setIsLoading(false);
        return;
      }

      if (session) {
        console.log("AuthRoute: Session established");
        setSession(true);
      } else {
        console.log("AuthRoute: No session");
        setSession(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
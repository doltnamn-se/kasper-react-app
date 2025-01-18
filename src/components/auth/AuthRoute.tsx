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
  const [isMagicLink, setIsMagicLink] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we're handling a magic link
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const magicLinkType = hashParams.get('type');
        
        if (magicLinkType === 'magiclink') {
          console.log("AuthRoute: Magic link detected, allowing access");
          setIsMagicLink(true);
          setSession(false);
          setIsLoading(false);
          return;
        }

        // Get current session
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

        console.log("AuthRoute: Session found, redirecting to home");
        setSession(true);

      } catch (error) {
        console.error("AuthRoute: Error:", error);
        setSession(false);
      } finally {
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

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session) {
          console.log("AuthRoute: Session established, redirecting to home");
          setSession(true);
        } else {
          console.log("AuthRoute: No session in state change");
          setSession(false);
        }
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If it's a magic link, always allow access regardless of session
  if (isMagicLink) {
    return <>{children}</>;
  }

  // If there's a session, redirect to home
  if (session) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, render the auth page
  return <>{children}</>;
};

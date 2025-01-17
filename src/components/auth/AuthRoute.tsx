import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "./LoadingSpinner";
import Auth from "@/pages/Auth";

export const AuthRoute = () => {
  const [session, setSession] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // Initial session check
    const initializeAuth = async () => {
      try {
        console.log("AuthRoute: Initializing...");
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!currentSession) {
          console.log("AuthRoute: No initial session");
          if (mounted) {
            setSession(false);
            setIsLoading(false);
          }
          return;
        }

        console.log("AuthRoute: Session found, user:", currentSession.user.id);
        if (mounted) {
          setSession(true);
          checkOnboardingStatus(currentSession.user.id);
        }
      } catch (error) {
        console.error("AuthRoute: Init error:", error);
        if (mounted) {
          setSession(false);
          setIsLoading(false);
        }
      }
    };

    // Check onboarding status
    const checkOnboardingStatus = async (userId: string) => {
      try {
        console.log("AuthRoute: Checking onboarding for user:", userId);
        const { data, error } = await supabase
          .from('customers')
          .select('onboarding_completed')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error("AuthRoute: Onboarding check error:", error);
          throw error;
        }

        if (mounted) {
          if (!data?.onboarding_completed) {
            console.log("AuthRoute: Onboarding incomplete");
            setRedirectPath('/onboarding');
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("AuthRoute: Onboarding check failed:", error);
        if (mounted) {
          setSession(false);
          setIsLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("AuthRoute: Auth state changed:", event);
      
      if (!currentSession) {
        console.log("AuthRoute: Session ended");
        if (mounted) {
          setSession(false);
          setRedirectPath(null);
          setIsLoading(false);
        }
        return;
      }

      if (mounted) {
        console.log("AuthRoute: New session started");
        setSession(true);
        checkOnboardingStatus(currentSession.user.id);
      }
    });

    return () => {
      console.log("AuthRoute: Cleaning up");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    console.log("AuthRoute: Loading...");
    return <LoadingSpinner />;
  }

  if (session) {
    console.log("AuthRoute: Redirecting to:", redirectPath || "/");
    return <Navigate to={redirectPath || "/"} replace />;
  }

  console.log("AuthRoute: Showing auth page");
  return <Auth />;
};
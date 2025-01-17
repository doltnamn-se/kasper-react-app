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

    const checkSession = async () => {
      try {
        console.log("AuthRoute: Checking initial session...");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthRoute: Error checking session:", error);
          if (mounted) {
            setSession(false);
            setIsLoading(false);
          }
          return;
        }

        if (!currentSession) {
          console.log("AuthRoute: No initial session found");
          if (mounted) {
            setSession(false);
            setIsLoading(false);
          }
          return;
        }

        console.log("AuthRoute: Initial session found, checking onboarding status");
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('onboarding_completed')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        if (customerError) {
          console.error("AuthRoute: Error fetching customer data:", customerError);
          if (mounted) {
            setSession(false);
            setIsLoading(false);
          }
          return;
        }

        if (!customerData?.onboarding_completed) {
          console.log("AuthRoute: Onboarding not completed, redirecting");
          if (mounted) setRedirectPath('/onboarding');
        }

        if (mounted) {
          setSession(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("AuthRoute: Unexpected error:", error);
        if (mounted) {
          setSession(false);
          setIsLoading(false);
        }
      }
    };

    // Initial session check
    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("AuthRoute: Auth state changed:", event);
      
      if (!currentSession) {
        console.log("AuthRoute: No session in state change");
        if (mounted) {
          setSession(false);
          setRedirectPath(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        console.log("AuthRoute: Session in state change, checking onboarding");
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('onboarding_completed')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        if (customerError) {
          console.error("AuthRoute: Error fetching customer data:", customerError);
          if (mounted) {
            setSession(false);
            setIsLoading(false);
          }
          return;
        }

        if (!customerData?.onboarding_completed) {
          console.log("AuthRoute: Onboarding not completed, updating redirect");
          if (mounted) setRedirectPath('/onboarding');
        }

        if (mounted) {
          setSession(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("AuthRoute: Error in auth state change:", error);
        if (mounted) {
          setSession(false);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    console.log("AuthRoute: Still loading...");
    return <LoadingSpinner />;
  }

  if (session) {
    console.log("AuthRoute: Session active, redirecting to:", redirectPath || "/");
    return <Navigate to={redirectPath || "/"} replace />;
  }

  console.log("AuthRoute: No session, showing auth page");
  return <Auth />;
};
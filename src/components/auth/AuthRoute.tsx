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
        console.log("AuthRoute: Checking session...");
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!currentSession) {
          console.log("AuthRoute: No session found");
          if (mounted) {
            setSession(false);
            setIsLoading(false);
          }
          return;
        }

        console.log("AuthRoute: Session found, checking customer data");
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

        if (mounted) {
          setSession(true);
          if (!customerData?.onboarding_completed) {
            console.log("AuthRoute: Onboarding incomplete, setting redirect");
            setRedirectPath('/onboarding');
          }
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
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('onboarding_completed')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        if (customerError) {
          console.error("AuthRoute: Error in state change:", customerError);
          if (mounted) {
            setSession(false);
            setIsLoading(false);
          }
          return;
        }

        if (mounted) {
          setSession(true);
          if (!customerData?.onboarding_completed) {
            console.log("AuthRoute: Onboarding incomplete in state change");
            setRedirectPath('/onboarding');
          }
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
    console.log("AuthRoute: Loading...");
    return <LoadingSpinner />;
  }

  if (session) {
    console.log("AuthRoute: Session active, redirecting to:", redirectPath || "/");
    return <Navigate to={redirectPath || "/"} replace />;
  }

  console.log("AuthRoute: No session, showing auth page");
  return <Auth />;
};
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
    const initializeAuth = async () => {
      try {
        console.log("AuthRoute: Checking session...");
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("AuthRoute: Error checking session:", error);
          setSession(false);
          return;
        }

        if (currentSession) {
          console.log("AuthRoute: Session found, checking onboarding status");
          
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('onboarding_completed')
            .eq('id', currentSession.user.id)
            .single();

          if (customerError) {
            console.error("AuthRoute: Error fetching customer data:", customerError);
          } else {
            console.log("AuthRoute: Customer onboarding status:", customerData?.onboarding_completed);
            if (!customerData?.onboarding_completed) {
              setRedirectPath('/onboarding');
            }
          }

          setSession(true);
        } else {
          console.log("AuthRoute: No session found");
          setSession(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthRoute: Auth state changed:", event);
      
      if (session) {
        console.log("AuthRoute: New session detected, checking onboarding status");
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (customerError) {
          console.error("AuthRoute: Error fetching customer data:", customerError);
        } else {
          console.log("AuthRoute: Updated onboarding status:", customerData?.onboarding_completed);
          if (!customerData?.onboarding_completed) {
            setRedirectPath('/onboarding');
          }
        }
        
        setSession(true);
      } else {
        console.log("AuthRoute: Session ended");
        setSession(false);
        setRedirectPath(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
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
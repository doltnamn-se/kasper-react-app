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
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setSession(false);
          return;
        }

        if (currentSession) {
          console.log("Auth route - session check: Authenticated");
          
          // Check onboarding status
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('onboarding_completed')
            .eq('id', currentSession.user.id)
            .single();

          if (customerError) {
            console.error("Error fetching customer data:", customerError);
          } else {
            console.log("Customer onboarding status:", customerData?.onboarding_completed);
            if (!customerData?.onboarding_completed) {
              setRedirectPath('/onboarding');
            }
          }

          setSession(true);
        } else {
          console.log("Auth route - session check: Not authenticated");
          setSession(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth route - auth state changed:", event);
      
      if (session) {
        // Check onboarding status on auth state change
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (customerError) {
          console.error("Error fetching customer data:", customerError);
        } else {
          console.log("Customer onboarding status:", customerData?.onboarding_completed);
          if (!customerData?.onboarding_completed) {
            setRedirectPath('/onboarding');
          }
        }
        
        setSession(true);
      } else {
        setSession(false);
        setRedirectPath(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (session) {
    return <Navigate to={redirectPath || "/"} replace />;
  }

  return <Auth />;
};
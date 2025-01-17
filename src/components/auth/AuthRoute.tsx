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
        
        // First check if user is super_admin
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentSession.user.id)
          .single();

        if (profileError) {
          console.error("AuthRoute: Profile check error:", profileError);
          throw profileError;
        }

        console.log("AuthRoute: User role:", profileData?.role);

        // If super_admin, skip onboarding check
        if (profileData?.role === 'super_admin') {
          console.log("AuthRoute: Super admin detected, skipping onboarding check");
          if (mounted) {
            setSession(true);
            setRedirectPath('/admin/customers');
            setIsLoading(false);
          }
          return;
        }

        // For regular users, check onboarding status
        const { data, error } = await supabase
          .from('customers')
          .select('onboarding_completed')
          .eq('id', currentSession.user.id)
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
          setSession(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("AuthRoute: Auth error:", error);
        if (mounted) {
          setSession(false);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
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

      try {
        // Check role on auth state change
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentSession.user.id)
          .single();

        if (profileError) {
          console.error("AuthRoute: Profile check error:", profileError);
          throw profileError;
        }

        // If super_admin, skip onboarding
        if (profileData?.role === 'super_admin') {
          console.log("AuthRoute: Super admin detected on auth change");
          if (mounted) {
            setSession(true);
            setRedirectPath('/admin/customers');
            setIsLoading(false);
          }
          return;
        }

        // For regular users, check onboarding
        const { data, error } = await supabase
          .from('customers')
          .select('onboarding_completed')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        if (error) {
          console.error("AuthRoute: Onboarding check error:", error);
          throw error;
        }

        if (mounted) {
          setSession(true);
          if (!data?.onboarding_completed) {
            setRedirectPath('/onboarding');
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("AuthRoute: Error in auth change handler:", error);
        if (mounted) {
          setSession(false);
          setIsLoading(false);
        }
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
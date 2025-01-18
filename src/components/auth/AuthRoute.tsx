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
        // First check if we're handling a magic link
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isMagicLink = hashParams.get('type') === 'magiclink';
        
        if (isMagicLink) {
          console.log("AuthRoute: Magic link detected, allowing access for onboarding");
          setSession(false);
          setIsLoading(false);
          return;
        }

        // If not a magic link, check for existing session
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

        console.log("AuthRoute: Session found, checking role");
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentSession.user.id)
          .single();

        if (profileError) {
          console.error("AuthRoute: Profile error:", profileError);
          setSession(false);
          setIsLoading(false);
          return;
        }

        if (profile?.role === 'super_admin') {
          console.log("AuthRoute: Super admin detected, redirecting to admin");
          setSession(true);
        } else {
          console.log("AuthRoute: Regular user, checking onboarding");
          const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('onboarding_completed')
            .eq('id', currentSession.user.id)
            .single();

          if (customerError) {
            console.error("AuthRoute: Customer error:", customerError);
            setSession(false);
            setIsLoading(false);
            return;
          }

          setSession(true);
        }
      } catch (error) {
        console.error("AuthRoute: Error:", error);
        setSession(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthRoute: Auth state changed:", event);
      if (event === 'SIGNED_OUT') {
        setSession(false);
        setIsLoading(false);
        return;
      }
      checkAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
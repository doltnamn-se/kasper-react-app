import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check for magic link parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isMagicLink = hashParams.get('type') === 'magiclink';
        
        if (isMagicLink) {
          console.log("ProtectedRoute: Magic link detected, redirecting to onboarding");
          setIsAuthenticated(false);
          setNeedsOnboarding(true);
          setIsLoading(false);
          return;
        }

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("ProtectedRoute: Session error:", sessionError);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (!session) {
          console.log("ProtectedRoute: No session found");
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Check user role and onboarding status
        console.log("ProtectedRoute: Session found, checking user status");
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("ProtectedRoute: Profile error:", profileError);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setUserRole(profile?.role || null);

        if (profile?.role === 'super_admin') {
          console.log("ProtectedRoute: Super admin access granted");
          setIsAuthenticated(true);
          setNeedsOnboarding(false);
          setIsLoading(false);
          return;
        }

        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (customerError) {
          console.error("ProtectedRoute: Customer error:", customerError);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setNeedsOnboarding(!customer?.onboarding_completed);
        
      } catch (error) {
        console.error("ProtectedRoute: Error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("ProtectedRoute: Auth state changed:", event);
      if (!session) {
        setIsAuthenticated(false);
        setUserRole(null);
        setIsLoading(false);
        return;
      }
      checkAccess();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  if (needsOnboarding && userRole !== 'super_admin') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
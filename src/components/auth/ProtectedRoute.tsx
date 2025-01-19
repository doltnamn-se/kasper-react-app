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
    console.log("ProtectedRoute: Initializing");
    let mounted = true;

    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          console.log("ProtectedRoute: No session found");
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        console.log("ProtectedRoute: Session found, checking user status");
        
        // Check user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (mounted) {
          setUserRole(profile?.role || null);
          setIsAuthenticated(true);

          // Super admins don't need onboarding
          if (profile?.role === 'super_admin') {
            setNeedsOnboarding(false);
            setIsLoading(false);
            return;
          }

          // Check onboarding status
          const { data: customer } = await supabase
            .from('customers')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single();

          setNeedsOnboarding(!customer?.onboarding_completed);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("ProtectedRoute: Error:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    };

    checkAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("ProtectedRoute: Auth state changed:", event);
      
      if (!session && event === 'SIGNED_OUT') {
        if (mounted) {
          setIsAuthenticated(false);
          setUserRole(null);
          setIsLoading(false);
        }
        return;
      }
      
      checkAccess();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Redirecting to auth page");
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log("ProtectedRoute: Insufficient role permissions");
    return <Navigate to="/" replace />;
  }

  if (needsOnboarding && userRole !== 'super_admin') {
    console.log("ProtectedRoute: User needs onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
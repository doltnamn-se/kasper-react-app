import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "./LoadingSpinner";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  customerOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly, customerOnly }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("ProtectedRoute: Initializing");
    let mounted = true;

    const checkAccess = async () => {
      try {
        console.log("ProtectedRoute: Checking session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("ProtectedRoute: Session error:", sessionError);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        if (!session) {
          console.log("ProtectedRoute: No session found");
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        console.log("ProtectedRoute: Session found, checking user status");
        
        if (mounted) {
          setUserEmail(session.user.email);
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("ProtectedRoute: Error:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          toast.error("Authentication error. Please try logging in again.");
        }
      }
    };

    checkAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("ProtectedRoute: Auth state changed:", event);
      
      if (!session && event === 'SIGNED_OUT') {
        if (mounted) {
          setIsAuthenticated(false);
          setUserEmail(null);
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

  const isAdmin = userEmail === 'info@doltnamn.se';

  if (adminOnly && !isAdmin) {
    console.log("ProtectedRoute: Non-admin trying to access admin route");
    return <Navigate to="/" replace />;
  }

  if (customerOnly && isAdmin) {
    console.log("ProtectedRoute: Admin trying to access customer route");
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};
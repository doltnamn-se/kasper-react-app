import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "./LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [session, setSession] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session from Supabase
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setSession(false);
          setUserRole(null);
          return;
        }

        if (currentSession) {
          console.log("Active session found for user:", currentSession.user.id);
          setSession(true);

          // Fetch user role
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentSession.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching user role:", profileError);
            setUserRole(null);
          } else {
            console.log("User role fetched:", profileData.role);
            setUserRole(profileData.role);
          }
        } else {
          console.log("No active session found");
          setSession(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Unexpected error during auth initialization:", error);
        setSession(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize auth state
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);

      if (session) {
        console.log("New session established for user:", session.user.id);
        setSession(true);

        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error("Error fetching user role on auth change:", profileError);
            setUserRole(null);
          } else {
            console.log("Updated user role:", profileData.role);
            setUserRole(profileData.role);
          }
        } catch (error) {
          console.error("Error updating user role:", error);
          setUserRole(null);
        }
      } else {
        console.log("Session ended");
        setSession(false);
        setUserRole(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    console.log("No active session, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log(`Access denied - required role: ${requiredRole}, user role: ${userRole}`);
    return <Navigate to="/" replace />;
  }

  return children;
};
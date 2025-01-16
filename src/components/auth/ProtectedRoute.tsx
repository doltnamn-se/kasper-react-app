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
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          console.log("Session found:", currentSession.user.id);
          setSession(true);
          
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentSession.user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching user role:", profileError);
            setUserRole(null);
          } else {
            console.log("User role:", profileData.role);
            setUserRole(profileData.role);
          }
        } else {
          console.log("No session found");
          setSession(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setSession(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Authenticated" : "Not authenticated");
      
      if (session) {
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
    console.log("Redirecting to auth - no session");
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log(`Access denied - required role: ${requiredRole}, user role: ${userRole}`);
    return <Navigate to="/" replace />;
  }

  return children;
};
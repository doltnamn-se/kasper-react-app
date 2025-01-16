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
    let mounted = true;

    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (currentSession) {
          console.log("Initial session check: Authenticated");
          setSession(true);
          
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', currentSession.user.id)
              .maybeSingle();
              
            if (profileError) {
              console.error("Error fetching user role:", profileError);
            } else if (profileData) {
              console.log("User role:", profileData.role);
              setUserRole(profileData.role);
            } else {
              console.log("No profile found for user");
              setUserRole(null);
            }
          } catch (profileErr) {
            console.error("Unexpected error fetching profile:", profileErr);
          }
        } else {
          console.log("Initial session check: Not authenticated");
          setSession(false);
          setUserRole(null);
        }
      } catch (err) {
        console.error("Session initialization failed:", err);
        if (mounted) {
          setSession(false);
          setUserRole(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session ? "Authenticated" : "Not authenticated");
      
      if (!mounted) return;

      setIsLoading(true);

      if (session) {
        setSession(true);
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error("Error fetching user role on auth change:", profileError);
          } else if (profileData) {
            console.log("Updated user role:", profileData.role);
            setUserRole(profileData.role);
          } else {
            console.log("No profile found for user on auth change");
            setUserRole(null);
          }
        } catch (err) {
          console.error("Error updating user role:", err);
        }
      } else {
        setSession(false);
        setUserRole(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    console.log("User not authenticated, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log(`User doesn't have required role (${requiredRole}), current role: ${userRole}`);
    return <Navigate to="/" replace />;
  }

  return children;
};
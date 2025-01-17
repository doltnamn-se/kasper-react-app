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
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("ProtectedRoute: Initializing auth check...");
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("ProtectedRoute: Error getting session:", sessionError);
          setSession(false);
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        if (!currentSession) {
          console.log("ProtectedRoute: No active session found");
          setSession(false);
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        console.log("ProtectedRoute: Active session found for user:", currentSession.user.id);
        setSession(true);

        // First fetch user role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentSession.user.id)
          .single();

        if (profileError) {
          console.error("ProtectedRoute: Error fetching user role:", profileError);
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        console.log("ProtectedRoute: User role fetched:", profileData.role);
        setUserRole(profileData.role);

        // Skip onboarding check for super_admin
        if (profileData.role === 'super_admin') {
          console.log("ProtectedRoute: Super admin detected, skipping onboarding check");
          setOnboardingCompleted(true);
          setIsLoading(false);
          return;
        }

        // Check onboarding status for regular users
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('onboarding_completed')
          .eq('id', currentSession.user.id)
          .single();

        if (customerError) {
          console.error("ProtectedRoute: Error fetching onboarding status:", customerError);
          setIsLoading(false);
          return;
        }

        console.log("ProtectedRoute: Onboarding status:", customerData?.onboarding_completed);
        setOnboardingCompleted(customerData?.onboarding_completed);
        setIsLoading(false);
      } catch (error) {
        console.error("ProtectedRoute: Unexpected error:", error);
        setSession(false);
        setUserRole(null);
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("ProtectedRoute: Auth state changed:", event);

      if (!session) {
        console.log("ProtectedRoute: Session ended");
        setSession(false);
        setUserRole(null);
        setOnboardingCompleted(null);
        setIsLoading(false);
        return;
      }

      console.log("ProtectedRoute: New session established for user:", session.user.id);
      setSession(true);

      try {
        // First check role on auth change
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("ProtectedRoute: Error fetching user role on auth change:", profileError);
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        console.log("ProtectedRoute: Updated user role:", profileData.role);
        setUserRole(profileData.role);

        // Skip onboarding check for super_admin
        if (profileData.role === 'super_admin') {
          console.log("ProtectedRoute: Super admin detected on auth change");
          setOnboardingCompleted(true);
          setIsLoading(false);
          return;
        }

        // Check onboarding for regular users
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (customerError) {
          console.error("ProtectedRoute: Error fetching onboarding status on auth change:", customerError);
          setIsLoading(false);
          return;
        }

        console.log("ProtectedRoute: Updated onboarding status:", customerData?.onboarding_completed);
        setOnboardingCompleted(customerData?.onboarding_completed);
      } catch (error) {
        console.error("ProtectedRoute: Error updating user data:", error);
        setUserRole(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    console.log("ProtectedRoute: Still loading...");
    return <LoadingSpinner />;
  }

  if (!session) {
    console.log("ProtectedRoute: No active session, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  if (userRole === 'super_admin') {
    console.log("ProtectedRoute: Super admin access granted");
    return children;
  }

  if (onboardingCompleted === false) {
    console.log("ProtectedRoute: Onboarding not completed, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    console.log(`ProtectedRoute: Access denied - required role: ${requiredRole}, user role: ${userRole}`);
    return <Navigate to="/" replace />;
  }

  console.log("ProtectedRoute: All checks passed, rendering protected content");
  return children;
};
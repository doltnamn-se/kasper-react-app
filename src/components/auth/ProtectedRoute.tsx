import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "./LoadingSpinner";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  customerOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly, customerOnly }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { userEmail, isInitializing } = useUserProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [checklistCompleted, setChecklistCompleted] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        if (session?.user) {
          // First check if customer has checklist_completed flag set
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('checklist_completed')
            .eq('id', session.user.id)
            .single();

          if (customerError) {
            console.error("Error fetching customer data:", customerError);
            return;
          }

          // If checklist is already marked as completed, use that
          if (customerData?.checklist_completed) {
            setChecklistCompleted(true);
          } else {
            // Otherwise check the actual completion status
            const { data: checklistProgress } = await supabase
              .from('customer_checklist_progress')
              .select('*')
              .eq('customer_id', session.user.id)
              .single();

            const isChecklistCompleted = Boolean(
              checklistProgress?.completed_at && 
              checklistProgress?.password_updated && 
              (checklistProgress?.removal_urls?.length > 0 || checklistProgress?.removal_urls?.includes('skipped')) &&
              checklistProgress?.street_address &&
              checklistProgress?.postal_code &&
              checklistProgress?.city
            );

            // Update the checklist_completed flag if needed
            if (isChecklistCompleted && !customerData?.checklist_completed) {
              const { error: updateError } = await supabase
                .from('customers')
                .update({ checklist_completed: true })
                .eq('id', session.user.id);

              if (updateError) {
                console.error("Error updating checklist completion:", updateError);
              }
            }

            if (mounted) {
              setChecklistCompleted(isChecklistCompleted);
            }
          }
        }

        if (mounted) {
          setIsAuthenticated(!!session);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Protected route error:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          toast.error("Authentication error. Please try logging in again.");
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setIsAuthenticated(!!session);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading || isInitializing) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const isAdmin = userEmail === 'info@doltnamn.se';

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (customerOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Only redirect to checklist if it's not completed and user is on home page
  if (window.location.pathname === '/' && !checklistCompleted && !isAdmin) {
    console.log("Redirecting to checklist - not completed yet");
    return <Navigate to="/checklist" replace />;
  }

  return <>{children}</>;
};

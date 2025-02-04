
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "./LoadingSpinner";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useChecklistStatus } from "@/hooks/useChecklistStatus";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  customerOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly, customerOnly }: ProtectedRouteProps) => {
  const { userEmail, isInitializing } = useUserProfile();
  const { isAuthenticated, isLoading: authLoading, userId } = useAuthStatus();
  const { isChecklistCompleted, isLoading: checklistLoading } = useChecklistStatus(userId);

  if (authLoading || isInitializing || checklistLoading) {
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

  // Prevent access to checklist page if already completed
  if (window.location.pathname === '/checklist' && isChecklistCompleted) {
    console.log("Redirecting from checklist - already completed");
    return <Navigate to="/" replace />;
  }

  // Only redirect to checklist if:
  // 1. User is on home page
  // 2. Checklist is not completed
  // 3. User is not an admin
  // 4. Not currently on the checklist page (prevents redirect loop)
  if (window.location.pathname === '/' && 
      !isChecklistCompleted && 
      !isAdmin && 
      window.location.pathname !== '/checklist') {
    console.log("Redirecting to checklist - not completed yet");
    return <Navigate to="/checklist" replace />;
  }

  return <>{children}</>;
};

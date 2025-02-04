
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
  const isOnChecklistPage = window.location.pathname === '/checklist';
  if (isOnChecklistPage && isChecklistCompleted) {
    console.log("Redirecting from checklist - already completed");
    return <Navigate to="/" replace />;
  }

  // Redirect to checklist if on home page and checklist not completed
  const isOnHomePage = window.location.pathname === '/';
  if (isOnHomePage && !isChecklistCompleted && !isAdmin) {
    console.log("Redirecting to checklist - not completed yet");
    return <Navigate to="/checklist" replace />;
  }

  return <>{children}</>;
};

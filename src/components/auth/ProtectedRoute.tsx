
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "./LoadingSpinner";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useChecklistStatus } from "@/hooks/useChecklistStatus";
import { useCustomerPresence } from "@/components/admin/customers/useCustomerPresence";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  customerOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly, customerOnly }: ProtectedRouteProps) => {
  const { userEmail, isInitializing } = useUserProfile();
  const { isAuthenticated, isLoading: authLoading, userId } = useAuthStatus();
  const { isChecklistCompleted, isLoading: checklistLoading } = useChecklistStatus(userId);
  // Add presence tracking for all authenticated users
  useCustomerPresence();

  if (authLoading || isInitializing || checklistLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const isAdmin = userEmail === 'info@digitaltskydd.se';

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (customerOnly && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const pathname = window.location.pathname;

  // If on checklist page and checklist is completed, redirect to home
  if (pathname === '/checklist' && isChecklistCompleted) {
    console.log("Redirecting from checklist - already completed");
    return <Navigate to="/" replace />;
  }

  // If on home page, not admin, and checklist not completed, redirect to checklist
  if (pathname === '/' && !isAdmin && !isChecklistCompleted) {
    console.log("Redirecting to checklist - not completed yet");
    return <Navigate to="/checklist" replace />;
  }

  return <>{children}</>;
};

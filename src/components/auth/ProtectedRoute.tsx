
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "./LoadingSpinner";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { useChecklistStatus } from "@/hooks/useChecklistStatus";
import { useCustomerPresence } from "@/components/admin/customers/useCustomerPresence";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  customerOnly?: boolean;
}

export const ProtectedRoute = ({ children, adminOnly, customerOnly }: ProtectedRouteProps) => {
  const { userEmail, isInitializing } = useUserProfile();
  const { isAuthenticated, isLoading: authLoading, userId } = useAuthStatus();
  const { isChecklistCompleted, isLoading: checklistLoading } = useChecklistStatus(userId);
  
  // Add presence tracking for authenticated users
  useCustomerPresence();
  
  useEffect(() => {
    console.log("ProtectedRoute: Status -", {
      isAuthenticated,
      authLoading,
      isInitializing,
      checklistLoading,
      userEmail
    });
  }, [isAuthenticated, authLoading, isInitializing, checklistLoading, userEmail]);

  // Show loading while checking authentication status
  if (authLoading || isInitializing) {
    console.log("ProtectedRoute: Loading auth/user data");
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  // If checklist loading is still in progress, show loading
  if (checklistLoading) {
    console.log("ProtectedRoute: Loading checklist data");
    return <LoadingSpinner />;
  }

  const isAdmin = userEmail === 'info@doltnamn.se';
  console.log("ProtectedRoute: User is admin?", isAdmin);

  // Admin access control
  if (adminOnly && !isAdmin) {
    console.log("ProtectedRoute: Non-admin trying to access admin-only route");
    return <Navigate to="/" replace />;
  }

  // Customer access control
  if (customerOnly && isAdmin) {
    console.log("ProtectedRoute: Admin trying to access customer-only route");
    return <Navigate to="/admin" replace />;
  }

  const pathname = window.location.pathname;

  // If on checklist page and checklist is completed, redirect to home
  if (pathname === '/checklist' && isChecklistCompleted) {
    console.log("ProtectedRoute: Redirecting from checklist - already completed");
    return <Navigate to="/" replace />;
  }

  // If on home page, not admin, and checklist not completed, redirect to checklist
  if (pathname === '/' && !isAdmin && !isChecklistCompleted) {
    console.log("ProtectedRoute: Redirecting to checklist - not completed yet");
    return <Navigate to="/checklist" replace />;
  }

  console.log("ProtectedRoute: Rendering protected content");
  return <>{children}</>;
};

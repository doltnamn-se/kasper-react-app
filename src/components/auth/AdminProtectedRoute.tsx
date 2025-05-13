
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { LoadingSpinner } from './LoadingSpinner';

interface AdminProtectedRouteProps {
  children: ReactNode; // Properly typing the children prop
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { userProfile, isInitializing } = useUserProfile();
  
  // If still loading, show loading indicator
  if (isInitializing) {
    return <LoadingSpinner />;
  }
  
  // If not admin, redirect to home page
  if (userProfile?.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }
  
  // If admin, show the protected content
  return <>{children}</>;
};

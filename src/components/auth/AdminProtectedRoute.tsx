
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { userProfile, isInitializing } = useUserProfile();
  
  // If still loading, show nothing or a loading indicator
  if (isInitializing) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // If not admin, redirect to home page
  if (userProfile?.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }
  
  // If admin, show the protected content
  return <>{children}</>;
};

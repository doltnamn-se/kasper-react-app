
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopNav } from "@/components/TopNav";
import { AdminBottomNav } from "@/components/nav/AdminBottomNav";
import { UserBottomNav } from "@/components/nav/UserBottomNav";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useIsMobile } from "@/hooks/use-mobile";

export const MobilePersistentLayout = () => {
  const { userProfile } = useUserProfile();
  const isAdmin = userProfile?.role === 'super_admin';
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Force re-render on route change for proper indicator position
  const [, setPathChanged] = useState(0);
  useEffect(() => {
    setPathChanged(prev => prev + 1);
  }, [location.pathname]);

  // Check if we're on the checklist page
  const isChecklistPage = location.pathname === '/checklist';

  // Only render persistent elements on mobile
  if (!isMobile) {
    return <Outlet />;
  }

  // If on checklist page, don't render navigation elements
  if (isChecklistPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#161618] pb-16">
      {/* Fixed Top Navigation */}
      <TopNav />
      
      {/* Main Content Area (scrollable) */}
      <main className="px-4 pt-12 pb-20">
        <Outlet />
      </main>
      
      {/* Fixed Bottom Navigation */}
      {isAdmin ? <AdminBottomNav /> : <UserBottomNav />}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopNav } from "@/components/TopNav";
import { AdminBottomNav } from "@/components/nav/AdminBottomNav";
import { UserBottomNav } from "@/components/nav/UserBottomNav";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { AnnouncementBar } from "@/components/AnnouncementBar";

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

  // Only render persistent elements on mobile
  if (!isMobile) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#161618] pb-16">
      {/* Announcement Bar */}
      {!isAdmin && <AnnouncementBar />}
      
      {/* Fixed Top Navigation */}
      <TopNav />
      
      {/* Main Content Area (scrollable) */}
      <main className={`px-4 pb-20 ${!isAdmin ? 'pt-[88px]' : 'pt-12'}`}>
        <Outlet />
      </main>
      
      {/* Fixed Bottom Navigation */}
      {isAdmin ? <AdminBottomNav /> : <UserBottomNav />}
    </div>
  );
};

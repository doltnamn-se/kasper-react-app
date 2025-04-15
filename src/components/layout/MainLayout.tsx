
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { TopNav } from '@/components/TopNav';
import { UserBottomNav } from '@/components/nav/UserBottomNav';
import { useSidebar } from '@/contexts/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUnreadNotifications } from '@/components/nav/hooks/useUnreadNotifications';

interface MainLayoutProps {
  children: React.ReactNode;
}

// Inside the MainLayout component:
export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isCollapsed, toggleCollapse, toggleMobileMenu } = useSidebar();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Get unread notification counts for mobile bottom nav
  const { userProfile } = useUserProfile();
  const {
    unreadGuideNotifications,
    unreadMonitoringNotifications,
    unreadDeindexingNotifications,
    unreadAddressAlerts
  } = useUnreadNotifications(userProfile?.id);

  // Combine unread counts for bottom nav
  const unreadCounts = {
    monitoring: unreadMonitoringNotifications,
    deindexing: unreadDeindexingNotifications,
    addressAlerts: unreadAddressAlerts,
    guides: unreadGuideNotifications,
  };

  useEffect(() => {
    // Check localStorage for sidebar state
    const savedState = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed !== savedState) {
      toggleCollapse();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#070707]">
      {/* Sidebar */}
      {isMobile ? (
        <div
          className={cn(
            "fixed inset-y-0 z-50 w-64 bg-white border-r border-gray-200 dark:bg-[#1c1c1e] dark:border-[#232325] transform transition-transform duration-300 ease-in-out",
            isCollapsed ? "-translate-x-full" : "translate-x-0"
          )}
        >
          <TopNav />
          {/* Mobile Sidebar Content */}
          <div className="p-4">{children}</div>
        </div>
      ) : (
        <TopNav />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        <main className="relative py-4 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <UserBottomNav unreadCounts={unreadCounts} />
    </div>
  );
};

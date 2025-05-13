
import React from 'react';
import { TopNav } from "@/components/TopNav";
import { AdminBottomNav } from "@/components/nav/AdminBottomNav";
import { UserBottomNav } from "@/components/nav/UserBottomNav";
import { useUserProfile } from "@/hooks/useUserProfile";

interface MobilePersistentLayoutProps {
  children: React.ReactNode;
}

export const MobilePersistentLayout = ({ children }: MobilePersistentLayoutProps) => {
  const { userProfile } = useUserProfile();
  const isAdmin = userProfile?.role === 'super_admin';
  
  console.log("MobilePersistentLayout rendering with userProfile:", userProfile);

  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#161618]">
      {/* Fixed Top Navigation */}
      <TopNav />
      
      {/* Main Content Area (scrollable) */}
      <main className="px-4 pt-14 pb-20">
        {children}
      </main>
      
      {/* Fixed Bottom Navigation */}
      <div className="pb-16">
        {isAdmin ? <AdminBottomNav /> : <UserBottomNav />}
      </div>
    </div>
  );
};

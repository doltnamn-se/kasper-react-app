
import { Outlet } from "react-router-dom";
import { AdminNavigation } from "@/components/nav/AdminNavigation";
import { TopNav } from "@/components/TopNav";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarFooter } from "@/components/nav/SidebarFooter";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { AdminBottomNav } from "@/components/nav/AdminBottomNav";

const AdminLayout = () => {
  const { isCollapsed } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#161618]">
      <div className="flex">
        {/* Admin Sidebar - Desktop Only */}
        <div className={cn(
          "fixed top-0 left-0 z-[50] h-screen transition-all duration-300 ease-in-out bg-white dark:bg-[#1c1c1e] border-r border-[#e5e7eb] dark:border-[#232325]",
          isMobile ? "hidden" : cn("block", isCollapsed ? "w-16" : "w-72")
        )}>
          <div className="px-8 py-6 flex items-center gap-3">
            <AuthLogo className="relative h-8" />
            <Badge 
              variant="static" 
              className="bg-black text-white dark:bg-white dark:text-black"
            >
              Admin
            </Badge>
          </div>

          <div className="h-px bg-[#e5e7eb] dark:bg-[#2d2d2d] mx-6 mb-8 transition-colors duration-200" />

          <div className="px-6">
            <AdminNavigation />
          </div>
          <SidebarFooter />
        </div>

        {/* Main Content */}
        <div className={cn(
          "flex-1 min-h-screen transition-[margin] duration-300 ease-in-out pb-16 md:pb-0",
          isMobile ? "ml-0" : isCollapsed ? "ml-16" : "ml-72"
        )}>
          <TopNav />
          <main className="px-4 sm:px-8 md:px-12 pt-12 my-[20px] max-w-full overflow-x-hidden">
            <div className="max-w-[1400px] mx-auto overflow-x-hidden">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Bottom Navigation - Mobile Only */}
        <AdminBottomNav />
      </div>
    </div>
  );
};

export default AdminLayout;

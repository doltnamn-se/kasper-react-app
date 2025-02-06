
import { Outlet } from "react-router-dom";
import { AdminNavigation } from "@/components/nav/AdminNavigation";
import { TopNav } from "@/components/TopNav";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarFooter } from "@/components/nav/SidebarFooter";
import { AuthLogo } from "@/components/auth/AuthLogo";

const AdminLayout = () => {
  const { isCollapsed, isMobileMenuOpen, toggleMobileMenu } = useSidebar();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#161618]">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className={cn(
          "fixed top-0 left-0 z-[50] h-screen transition-all duration-300 ease-in-out bg-white dark:bg-[#1c1c1e] border-r border-[#e5e7eb] dark:border-[#232325]",
          isMobile ? (
            cn(
              "w-64 transform",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )
          ) : (
            cn(
              "block",
              isCollapsed ? "w-16" : "w-72"
            )
          )
        )}>
          <div className="px-8 py-6">
            <AuthLogo className="relative h-8" />
          </div>

          <div className="h-px bg-[#e5e7eb] dark:bg-[#2d2d2d] mx-6 mb-8 transition-colors duration-200" />

          <div className="px-6">
            <AdminNavigation toggleMobileMenu={toggleMobileMenu} />
          </div>
          <SidebarFooter />
        </div>

        {/* Main Content */}
        <div className={cn(
          "flex-1 min-h-screen transition-[margin] duration-300 ease-in-out",
          isMobile ? "ml-0" : (isCollapsed ? "ml-16" : "ml-72")
        )}>
          <TopNav />
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

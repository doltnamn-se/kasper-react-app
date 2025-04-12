
import { Outlet } from "react-router-dom";
import { AdminNavigation } from "@/components/nav/AdminNavigation";
import { TopNav } from "@/components/TopNav";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarFooter } from "@/components/nav/SidebarFooter";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { Badge } from "@/components/ui/badge";
import { LanguageProvider } from "@/contexts/LanguageContext";

const AdminLayout = () => {
  const {
    isCollapsed,
    isMobileMenuOpen,
    toggleMobileMenu
  } = useSidebar();
  const isMobile = useIsMobile();
  
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#161618]">
        <div className="flex">
          {/* Admin Sidebar */}
          <div className={cn(
            "fixed top-0 left-0 z-[50] h-screen transition-all duration-300 ease-in-out bg-white dark:bg-[#1c1c1e] border-r border-[#e5e7eb] dark:border-[#232325]", 
            isMobile ? cn("w-64 transform", isMobileMenuOpen ? "translate-x-0" : "-translate-x-full") : cn("block", isCollapsed ? "w-16" : "w-72")
          )}>
            <div className="px-8 py-6 flex items-center gap-3">
              <AuthLogo className="relative h-8" />
              <Badge variant="secondary" className="bg-badge-subscription-bg dark:bg-badge-subscription-bg-dark text-badge-subscription-text hover:bg-badge-subscription-bg dark:hover:bg-badge-subscription-bg-dark py-1">
                Admin
              </Badge>
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
            isMobile ? "ml-0" : isCollapsed ? "ml-16" : "ml-72"
          )}>
            <TopNav />
            <main className="px-4 sm:px-8 md:px-12 pt-12 my-[20px] max-w-full overflow-x-hidden">
              <div className="max-w-[1400px] mx-auto">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
};

export default AdminLayout;

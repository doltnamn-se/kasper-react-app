import { TopNav } from "@/components/TopNav";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSidebar } from "@/contexts/SidebarContext";
import { AdminNavigation } from "@/components/nav/AdminNavigation";
import { MainNavigation } from "@/components/nav/MainNavigation";
import { SidebarFooter } from "@/components/nav/SidebarFooter";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isCollapsed, isMobileMenuOpen, toggleMobileMenu } = useSidebar();
  const { userProfile } = useUserProfile();
  const isAdmin = userProfile?.role === 'super_admin';

  const Navigation = () => {
    return (
      <nav>
        {isAdmin && <AdminNavigation toggleMobileMenu={toggleMobileMenu} />}
        <MainNavigation toggleMobileMenu={toggleMobileMenu} />
      </nav>
    );
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen transition-transform duration-300",
        "hidden md:block bg-white dark:bg-[#1c1c1e] border-r border-[#e5e7eb] dark:border-[#232325]",
        isCollapsed ? "w-16" : "w-72"
      )}>
        <div className="px-8 py-6">
          <AuthLogo className="relative h-8" />
        </div>

        <div className="h-px bg-[#e5e7eb] dark:bg-[#232325] mx-6 mb-8 transition-colors duration-200" />

        <div className="px-6">
          <Navigation />
        </div>

        <SidebarFooter />
      </aside>

      {/* Sidebar - Mobile */}
      <div className={cn(
        "fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-200 md:hidden",
        isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )} onClick={toggleMobileMenu}>
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#1c1c1e] transform transition-transform duration-200",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={e => e.stopPropagation()}
        >
          <div className="px-8 py-6">
            <AuthLogo className="relative h-8" />
          </div>

          <div className="h-px bg-[#e5e7eb] dark:bg-[#232325] mx-6 mb-8 transition-colors duration-200" />

          <div className="px-6">
            <Navigation />
          </div>

          <SidebarFooter />
        </aside>
      </div>

      {/* Main Content */}
      <main className={cn(
        "flex-1 min-h-screen bg-[#f4f4f4] dark:bg-[#161618] transition-all duration-200",
        "md:transition-[margin] md:duration-300",
        isCollapsed ? "md:ml-16" : "md:ml-72"
      )}>
        <TopNav />
        <div className="px-4 md:px-12 pt-12">
          {children}
        </div>
      </main>
    </div>
  );
};
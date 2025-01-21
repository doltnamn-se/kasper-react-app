import { TopNav } from "@/components/TopNav";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { useSidebar } from "@/contexts/SidebarContext";
import { MainNavigation } from "@/components/nav/MainNavigation";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { isMobileMenuOpen, toggleMobileMenu } = useSidebar();

  const Navigation = () => {
    return (
      <nav>
        <MainNavigation toggleMobileMenu={toggleMobileMenu} />
      </nav>
    );
  };

  return (
    <div className="flex h-screen bg-[#f6f6f4] dark:bg-[#161618]">
      <div className="flex flex-col flex-1">
        <TopNav />
        <div className="flex flex-1 overflow-hidden">
          <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-64 border-r border-[#e5e7eb] dark:border-[#232325] bg-white dark:bg-[#1c1c1e] overflow-y-auto`}>
            <Navigation />
          </aside>
          <main className="flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
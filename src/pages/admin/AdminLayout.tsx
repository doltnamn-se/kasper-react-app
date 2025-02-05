
import { Outlet } from "react-router-dom";
import { AdminNavigation } from "@/components/nav/AdminNavigation";
import { UserProfileMenu } from "@/components/nav/UserProfileMenu";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { NotificationButtons } from "@/components/nav/NotificationButtons";
import { SearchBar } from "@/components/nav/SearchBar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#161618]">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 right-0 left-0 h-16 z-[40] bg-white dark:bg-[#1c1c1e] border-b border-[#e5e7eb] dark:border-[#232325] px-4 md:px-6">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold text-black dark:text-white hidden md:block">Admin Dashboard</h1>
          </div>
          
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <SearchBar />
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationButtons />
            <UserProfileMenu />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Admin Sidebar */}
        <div className={cn(
          "md:block w-64 min-h-screen bg-white dark:bg-[#1c1c1e] border-r border-[#e5e7eb] dark:border-[#232325]",
          isMobileMenuOpen ? "block absolute z-50 h-[calc(100vh-4rem)] top-16 left-0" : "hidden"
        )}>
          <div className="p-6 flex justify-between items-center">
            <h1 className="text-xl font-bold text-black dark:text-white md:hidden">Admin Dashboard</h1>
          </div>
          <AdminNavigation toggleMobileMenu={toggleMobileMenu} />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import { SearchBar } from "./nav/SearchBar";
import { ThemeToggle } from "./nav/ThemeToggle";
import { NotificationButtons } from "./nav/NotificationButtons";
import { UserProfileMenu } from "./nav/UserProfileMenu";

export const TopNav = () => {
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={cn(
      "fixed top-0 right-0 h-16 bg-transparent backdrop-blur-sm z-50 transition-[left] duration-200",
      isCollapsed ? "left-16" : "left-72"
    )}>
      <div className="flex items-center justify-between h-full px-8">
        <div className="flex-1 max-w-md">
          <SearchBar />
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationButtons />
          <UserProfileMenu />
        </div>
      </div>
    </div>
  );
};
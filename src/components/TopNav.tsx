
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import { SearchBar } from "./nav/SearchBar";
import { ThemeToggle } from "./nav/ThemeToggle";
import { NotificationButtons } from "./nav/NotificationButtons";
import { UserProfileMenu } from "./nav/UserProfileMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessageSquare } from "lucide-react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";
import { AuthLogo } from "./auth/AuthLogo";
import { useLocation } from "react-router-dom";

export const TopNav = () => {
  const { isCollapsed, toggleCollapse, isMobileMenuOpen, toggleMobileMenu } = useSidebar();
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
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
      "sticky top-0 right-0 h-16 z-[40] transition-[left] duration-200",
      isMobile ? (
        "left-0 px-4 border-b border-[#e5e7eb] dark:border-[#232325] bg-white dark:bg-[#1c1c1e] w-full"
      ) : (
        cn(
          "bg-[#f4f4f4] dark:bg-[#161618]",
          isCollapsed ? "left-16 px-12" : "left-72 px-12"
        )
      )
    )}>
      <div className="flex items-center justify-between h-full w-full">
        {isMobile && (
          <div className="flex-none mr-auto w-[10rem] flex items-center justify-left">
            <AuthLogo className="h-8 w-auto" />
          </div>
        )}
        
        <div className={cn(
          "flex-1 max-w-md",
          isMobile ? "hidden" : "block"
        )}>
          <SearchBar />
        </div>
        
        <div className="flex items-center gap-1 ml-auto">
          <TooltipProvider delayDuration={300}>
            <ThemeToggle />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] h-8 w-8 flex items-center justify-center hover:bg-transparent"
                  onClick={() => window.open("https://digitaltskydd.se/support/", "_blank")}
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('messages')}</p>
              </TooltipContent>
            </Tooltip>
            <NotificationButtons />
          </TooltipProvider>
          <UserProfileMenu />
        </div>
      </div>
    </div>
  );
};

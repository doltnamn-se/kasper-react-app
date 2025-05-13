
import { useEffect, useState } from "react";
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
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Effect for search keyboard shortcut
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

  // Effect for scroll behavior on mobile
  useEffect(() => {
    if (!isMobile) {
      setIsVisible(true);
      return;
    }

    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 10) {
        // Always show navbar at the top of the page
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show navbar
        setIsVisible(true);
      } else {
        // Scrolling down - hide navbar
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY, isMobile]);

  return (
    <div className={cn(
      "sticky top-0 right-0 h-16 z-[40] transition-all duration-300",
      isMobile ? (
        cn(
          "left-0 px-4 bg-[#f4f4f4] dark:bg-[#161618] w-full",
          isVisible ? "translate-y-0" : "-translate-y-full"
        )
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
        
        <div className="flex items-center gap-1 ml-auto pr-4">
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


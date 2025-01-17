import { Bell, ChevronDown, MessageSquare, Moon, Search, ArrowBigUp, Settings, UserCircle, CreditCard, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import { useToast } from "./ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const TopNav = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ first_name?: string; last_name?: string } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigate = useNavigate();
  const { isCollapsed } = useSidebar();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    let mounted = true;

    const initUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (session?.user?.email) {
          console.log("Setting user email:", session.user.email);
          setUserEmail(session.user.email);
          
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', session.user.id)
            .single();
          
          if (mounted && profileData) {
            setUserProfile(profileData);
          }
        } else {
          console.log("No user session found");
          setUserEmail(null);
        }
      } catch (err) {
        console.error("Error fetching user session:", err);
        if (mounted) {
          setUserEmail(null);
          setUserProfile(null);
        }
      }
    };

    initUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", event);
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      } else {
        setUserEmail(null);
        setUserProfile(null);
      }
    });

    // Set up keyboard shortcut
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
    
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSignOut = async () => {
    if (isSigningOut) {
      console.log("Sign out already in progress");
      return;
    }

    try {
      setIsSigningOut(true);
      console.log("Attempting to sign out...");
      
      // First navigate to auth page
      navigate("/auth", { replace: true });
      
      // Clear local state
      setUserEmail(null);
      setUserProfile(null);
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not sign out. Please try again.",
        });
        return;
      }
      
      console.log("Sign out successful");
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (err) {
      console.error("Unexpected error during sign out:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getUserInitials = () => {
    if (!userProfile?.first_name && !userProfile?.last_name) return 'U';
    return `${userProfile.first_name?.[0] || ''}${userProfile.last_name?.[0] || ''}`;
  };

  return (
    <div className={cn(
      "fixed top-0 right-0 h-16 bg-transparent backdrop-blur-sm z-50 transition-[left] duration-200",
      isCollapsed ? "left-16" : "left-72"
    )}>
      <div className="flex items-center justify-between h-full px-16">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5e5e5e] dark:text-gray-400" />
            <Input 
              id="global-search"
              type="search" 
              placeholder={t('search.placeholder')}
              className="pl-10 pr-24 bg-white dark:bg-[#1c1c1e] border-none shadow-none hover:shadow-sm focus:shadow-md focus-visible:ring-0 text-[#000000] dark:text-gray-300 placeholder:text-[#5e5e5e] dark:placeholder:text-gray-400 transition-all outline-none"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <div className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none transition-opacity duration-200",
              isSearchFocused ? "opacity-0" : "opacity-100"
            )}>
              <div className="flex items-center gap-1 text-[#5e5e5e] dark:text-gray-400 bg-[#f4f4f4] dark:bg-[#232325] px-1.5 py-0.5 rounded text-xs">
                <ArrowBigUp className="w-3 h-3 mr-0.5" />
                Shift
              </div>
              <span className="text-[#5e5e5e] dark:text-gray-400 text-[10px]">+</span>
              <div className="flex items-center gap-1 text-[#5e5e5e] dark:text-gray-400 bg-[#f4f4f4] dark:bg-[#232325] px-1.5 py-0.5 rounded text-xs">
                S
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-[#5e5e5e] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-[#232325] h-8 w-8"
            onClick={toggleDarkMode}
          >
            <Moon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#5e5e5e] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-[#232325] h-8 w-8">
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#5e5e5e] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-[#232325] h-8 w-8">
            <Bell className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 text-[#000000] dark:text-gray-300 hover:bg-black/5 dark:hover:bg-[#232325] ml-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-black/5 dark:bg-[#303032] text-[#5e5e5e] dark:text-gray-400 text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{userEmail}</span>
                <ChevronDown className="w-4 h-4 text-[#5e5e5e] dark:text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-3">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate("/profile")} className="py-2 cursor-pointer">
                  <UserCircle className="mr-3 h-4 w-4" />
                  <span className="text-black dark:text-gray-300">{t('profile.manage')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="py-2 cursor-pointer"
                  onClick={() => window.open('https://billing.stripe.com/p/login/eVa4ifayTfS48la7ss', '_blank')}
                >
                  <CreditCard className="mr-3 h-4 w-4" />
                  <span className="text-black dark:text-gray-300">{t('profile.billing')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="py-2 cursor-pointer">
                  <Settings className="mr-3 h-4 w-4" />
                  <span className="text-black dark:text-gray-300">{t('profile.settings')}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="mx-[-12px] my-2" />
              <DropdownMenuItem 
                onClick={handleSignOut} 
                disabled={isSigningOut}
                className="py-2 cursor-pointer"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className="text-black dark:text-gray-300">
                  {isSigningOut ? t('profile.signing.out') : t('profile.sign.out')}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
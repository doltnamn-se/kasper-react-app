import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import { SearchBar } from "./SearchBar";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationButtons } from "./NotificationButtons";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, ArrowDown } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getUserInitials } from "@/utils/profileUtils";
import { ProfileMenuItems } from "./ProfileMenuItems";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const UserProfileMenu = () => {
  const { userEmail, userProfile, isSigningOut, setIsSigningOut } = useUserProfile();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);

  const getDisplayName = () => {
    if (!userProfile?.display_name) return userEmail;
    return userProfile.display_name;
  };

  const handleSignOut = async () => {
    if (isSigningOut) {
      console.log("Sign out already in progress");
      return;
    }

    try {
      setIsSigningOut(true);
      console.log("Attempting to sign out...");
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        toast.error(t('error.signout'));
        return;
      }

      if (!session) {
        console.log("No active session found, redirecting to auth page");
        window.location.href = '/auth';
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast.error(t('error.signout'));
        return;
      }
      
      console.log("Sign out successful");
      window.location.href = '/auth';
      
    } catch (err) {
      console.error("Unexpected error during sign out:", err);
      toast.error(t('error.signout'));
    } finally {
      setIsSigningOut(false);
    }
  };

  const initials = getUserInitials(userProfile);
  const displayName = getDisplayName();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-[#000000A6] hover:text-[#000000] dark:text-gray-300 dark:hover:text-white hover:bg-transparent ml-2"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-black/5 dark:bg-[#303032] text-[#5e5e5e] dark:text-gray-400 text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!isMobile && (
            <>
              <span className="text-sm font-medium">{displayName}</span>
              <div className="transition-all duration-300 ease-in-out transform">
                {isHovered ? (
                  <ArrowDown className="w-4 h-4 text-[#5e5e5e] dark:text-gray-400 transform transition-all duration-300 ease-in-out scale-y-100" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#5e5e5e] dark:text-gray-400 transform transition-all duration-300 ease-in-out scale-y-75" />
                )}
              </div>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <ProfileMenuItems onSignOut={handleSignOut} isSigningOut={isSigningOut} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
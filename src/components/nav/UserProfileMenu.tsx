import { useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { getUserInitials } from "@/utils/profileUtils";
import { ProfileMenuItems } from "./ProfileMenuItems";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const UserProfileMenu = () => {
  const { userEmail, userProfile, isSigningOut, setIsSigningOut } = useUserProfile();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

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
      console.log("Starting sign out process...");

      // Clear any existing auth state first
      localStorage.removeItem('supabase.auth.token');
      
      try {
        // Attempt to sign out regardless of session state
        await supabase.auth.signOut();
        console.log("Sign out successful");
      } catch (signOutError) {
        console.log("Sign out error caught:", signOutError);
        // Continue with redirect even if sign out fails
      }

      // Always redirect to auth page
      console.log("Redirecting to auth page");
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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] hover:bg-transparent ml-2 group"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={userProfile?.avatar_url} 
              alt={displayName}
            />
            <AvatarFallback className="bg-black/5 dark:bg-[#303032] text-[#5e5e5e] dark:text-[#FFFFFFA6] text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!isMobile && (
            <>
              <span className={`text-sm font-medium ${isOpen ? 'text-[#000000] dark:text-[#FFFFFF]' : ''}`}>
                {displayName}
              </span>
              <ChevronDown 
                className={`w-4 h-4 text-[#000000A6] group-hover:text-[#000000] dark:text-[#FFFFFFA6] dark:group-hover:text-[#FFFFFF] transition-transform duration-200 ${
                  isOpen ? 'rotate-180 !text-[#000000] dark:!text-[#FFFFFF]' : ''
                }`}
              />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 dark:bg-[#1c1c1e] dark:border-[#232325]">
        <ProfileMenuItems onSignOut={handleSignOut} isSigningOut={isSigningOut} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
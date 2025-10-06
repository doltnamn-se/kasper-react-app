
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, UserRound } from "lucide-react";
import { getUserInitials } from "@/utils/profileUtils";
import { ProfileMenuItems } from "./ProfileMenuItems";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const UserProfileMenu = () => {
  const navigate = useNavigate();
  const { userEmail, userProfile, isSigningOut, setIsSigningOut } = useUserProfile();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const getDisplayName = () => {
    if (!userProfile?.display_name) return userEmail;
    return userProfile.display_name;
  };

  const getFirstName = () => {
    if (!userProfile?.display_name) return userEmail?.split('@')[0] || 'User';
    const names = userProfile.display_name.split(' ');
    return names[0] || userProfile.display_name;
  };

  const handleSignOut = async () => {
    if (isSigningOut) {
      console.log("Sign out already in progress");
      return;
    }

    try {
      setIsSigningOut(true);
      console.log("Starting sign out process...");

      localStorage.removeItem('supabase.auth.token');
      
      try {
        await supabase.auth.signOut();
        console.log("Sign out successful");
      } catch (signOutError) {
        console.log("Sign out error caught:", signOutError);
      }

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

  const handleProfileClick = () => {
    if (isMobile) {
      navigate('/profile-menu');
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          onClick={isMobile ? handleProfileClick : undefined}
          className={`flex items-center gap-2 text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF] hover:bg-transparent group ${isMobile ? 'p-0' : 'py-2 pr-2 pl-0'}`}
        >
          {isMobile ? (
            <div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#ffffff] dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] items-center justify-center">
              <UserRound className="w-4 h-4 text-[#121212] dark:text-[#ffffff]" />
            </div>
          ) : (
            <>
              <div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#ffffff] dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#232325] items-center justify-center">
                <UserRound className="w-4 h-4 text-[#121212] dark:text-[#ffffff]" />
              </div>
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
      <DropdownMenuContent 
        align="end" 
        className="w-56 p-2 dark:bg-[#1c1c1e] dark:border-[#232325]"
        style={isMobile ? { 
          width: 'calc(100vw - 24px)', 
          paddingRight: '12px',
          paddingLeft: '12px',
          marginLeft: '12px'  // Added 12px margin to the left side on mobile
        } : undefined}
      >
        <ProfileMenuItems onSignOut={handleSignOut} isSigningOut={isSigningOut} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

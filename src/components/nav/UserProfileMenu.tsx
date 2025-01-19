import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getUserInitials } from "@/utils/profileUtils";
import { ProfileMenuItems } from "./ProfileMenuItems";
import { useIsMobile } from "@/hooks/use-mobile";

export const UserProfileMenu = () => {
  const { userEmail, userProfile, isSigningOut, setIsSigningOut } = useUserProfile();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const getDisplayName = () => {
    if (userProfile?.display_name) return userProfile.display_name;
    if (userProfile?.first_name || userProfile?.last_name) {
      return `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
    }
    return userEmail;
  };

  const handleSignOut = async () => {
    if (isSigningOut) {
      console.log("Sign out already in progress");
      return;
    }

    try {
      setIsSigningOut(true);
      console.log("Attempting to sign out...");
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        toast({
          variant: "destructive",
          title: t('toast.error.title'),
          description: t('toast.error.description'),
          className: "top-4 right-4",
        });
        return;
      }
      
      console.log("Sign out successful");
      
      toast({
        title: t('toast.signed.out.title'),
        description: t('toast.signed.out.description'),
        className: "top-4 right-4",
      });
    } catch (err) {
      console.error("Unexpected error during sign out:", err);
      toast({
        variant: "destructive",
        title: t('toast.error.title'),
        description: t('toast.error.unexpected'),
        className: "top-4 right-4",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const initials = getUserInitials(userProfile);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-[#000000] dark:text-gray-300 hover:bg-black/5 dark:hover:bg-[#232325] ml-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-black/5 dark:bg-[#303032] text-[#5e5e5e] dark:text-gray-400 text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!isMobile && (
            <>
              <span className="text-sm font-medium">{getDisplayName()}</span>
              <ChevronDown className="w-4 h-4 text-[#5e5e5e] dark:text-gray-400" />
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
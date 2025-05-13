
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getUserInitials } from "@/utils/profileUtils";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ProfileMenuItems } from "@/components/nav/ProfileMenuItems";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProfilePage = () => {
  const { userEmail, userProfile, isSigningOut, setIsSigningOut } = useUserProfile();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
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

  return (
    <MainLayout>
      <div className="p-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {t('back')}
        </Button>
        
        <div className="flex items-center mb-6">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarImage 
              src={userProfile?.avatar_url} 
              alt={displayName}
              className="aspect-square object-cover"
            />
            <AvatarFallback className="text-[#5e5e5e] dark:text-[#FFFFFFA6] text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold">{displayName}</h1>
            <p className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6]">{userEmail}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#1c1c1e] rounded-lg p-4 shadow-sm border border-[#e5e7eb] dark:border-[#232325]">
          <ProfileMenuItems onSignOut={handleSignOut} isSigningOut={isSigningOut} />
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;

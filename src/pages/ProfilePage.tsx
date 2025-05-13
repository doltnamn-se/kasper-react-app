
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getUserInitials } from "@/utils/profileUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { userProfile, userEmail } = useUserProfile();

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
    <div className="px-4 py-6">
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 flex items-center gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        {t('back')}
      </Button>
      
      <div className="text-center mb-8">
        <Avatar className="h-24 w-24 mx-auto mb-4">
          <AvatarImage 
            src={userProfile?.avatar_url ?? undefined} 
            alt={displayName}
          />
          <AvatarFallback className="text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-medium">{displayName}</h1>
        {userEmail && <p className="text-muted-foreground">{userEmail}</p>}
      </div>
      
      <div className="space-y-4">
        <Button 
          variant="outline" 
          className="w-full justify-start text-left"
          onClick={() => navigate('/settings')}
        >
          {t('profile.settings')}
        </Button>
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? t('profile.signing.out') : t('profile.sign.out')}
        </Button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Profile } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { AvatarSection } from "./profile/AvatarSection";
import { DisplayNameSection } from "./profile/DisplayNameSection";

export const ProfileSettings = () => {
  const { t } = useLanguage();
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log("Fetching user profile...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.id) {
          console.log("No active session found");
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select()
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          throw error;
        }

        console.log("Profile fetched successfully:", profile);
        setUserProfile(profile);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarUpdate = (url: string | null) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, avatar_url: url });
    }
  };

  const handleDisplayNameUpdate = (name: string) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, display_name: name });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarSection 
          userProfile={userProfile} 
          onAvatarUpdate={handleAvatarUpdate} 
        />
        <DisplayNameSection 
          userProfile={userProfile} 
          onDisplayNameUpdate={handleDisplayNameUpdate} 
        />
      </CardContent>
    </Card>
  );
};
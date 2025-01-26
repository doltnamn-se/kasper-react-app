import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        console.log("Fetching profile for user:", session.user.id);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select()
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }

        console.log("Profile data:", profileData);
        setUserProfile(profileData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarUpdate = (avatarUrl: string | null) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, avatar_url: avatarUrl });
    }
  };

  const handleDisplayNameUpdate = (name: string) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, display_name: name });
    }
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-lg border border-[#e5e7eb] dark:border-[#232325] p-6">
      <h2 className="text-xl font-semibold mb-6 text-[#000000] dark:text-white">
        {t('profile')}
      </h2>
      <div className="space-y-6">
        <AvatarSection 
          userProfile={userProfile} 
          onAvatarUpdate={handleAvatarUpdate} 
        />
        <DisplayNameSection 
          userProfile={userProfile} 
          onDisplayNameUpdate={handleDisplayNameUpdate} 
        />
      </div>
    </div>
  );
};
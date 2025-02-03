import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Profile } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { AvatarSection } from "./profile/AvatarSection";

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
          .select('id, email, display_name, avatar_url, role, created_at, updated_at')
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

  return (
    <div className="space-y-6">
      <AvatarSection 
        userProfile={userProfile} 
        onAvatarUpdate={handleAvatarUpdate} 
      />
    </div>
  );
};
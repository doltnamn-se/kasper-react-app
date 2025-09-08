
import { useLanguage } from "@/contexts/LanguageContext";
import { AvatarSection } from "./profile/AvatarSection";
import { useUserProfile } from "@/hooks/useUserProfile";

export const ProfileSettings = () => {
  const { t } = useLanguage();
  const { userProfile } = useUserProfile();

  const handleAvatarUpdate = (avatarUrl: string | null) => {
    // The useUserProfile hook will automatically refetch and update the profile
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

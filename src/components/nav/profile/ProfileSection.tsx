
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFullName } from "@/utils/profileUtils";
import { useIsMobile } from "@/hooks/use-mobile";

export const ProfileSection = () => {
  const { userEmail, userProfile } = useUserProfile();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  
  const displayName = getFullName(userProfile, userEmail);
  const subscription = userProfile?.subscription || 'free';

  return (
    <div className="pb-4">
      <div className="mb-4">
        <div className="flex flex-col">
          <div className="flex items-center">
            <h3 className="text-lg font-medium text-[#000000] dark:text-[#FFFFFF] ml-1">
              {displayName}
            </h3>
          </div>
          <span className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6] ml-1">
            {t(`subscription.${subscription}` as any)}
          </span>
        </div>
      </div>
    </div>
  );
};


import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { getFullName } from "@/utils/profileUtils";
import { SubscriptionBadge } from "@/components/settings/profile/SubscriptionBadge";

export const ProfileSection = () => {
  const { userProfile, userEmail } = useUserProfile();
  const { t } = useLanguage();

  const displayName = getFullName(userProfile, userEmail);

  return (
    <div className="flex flex-col items-start space-y-2 px-6 py-4">
      <div className="flex flex-col space-y-1.5">
        <h2 className="text-lg font-semibold text-[#000000] dark:text-[#ffffff]">
          {displayName}
        </h2>
        {userProfile?.subscription_plan && (
          <SubscriptionBadge plan={userProfile.subscription_plan} />
        )}
      </div>
    </div>
  );
};

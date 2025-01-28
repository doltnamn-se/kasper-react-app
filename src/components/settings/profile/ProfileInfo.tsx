import { Profile } from "@/types/customer";
import { SubscriptionBadge } from "./SubscriptionBadge";

interface ProfileInfoProps {
  userProfile: Profile | null;
  subscriptionPlan: string | null;
}

export const ProfileInfo = ({ userProfile, subscriptionPlan }: ProfileInfoProps) => {
  return (
    <div className="space-y-1.5">
      <h3 className="text-lg font-semibold">
        {userProfile?.display_name}
      </h3>
      <SubscriptionBadge plan={subscriptionPlan} />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {userProfile?.email}
      </p>
    </div>
  );
};
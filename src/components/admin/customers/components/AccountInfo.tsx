
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerWithProfile } from "@/types/customer";
import { SubscriptionPlanSelect } from "./SubscriptionPlanSelect";

interface AccountInfoProps {
  customer: CustomerWithProfile;
  isOnline: boolean;
  userLastSeen: string | null;
  onCopy: (text: string, label: string) => void;
  isSuperAdmin?: boolean;
  isUpdatingSubscription?: boolean;
  onUpdateSubscriptionPlan?: (plan: string) => void;
}

export const AccountInfo = ({ 
  customer, 
  isOnline, 
  userLastSeen, 
  onCopy, 
  isSuperAdmin = false,
  isUpdatingSubscription = false,
  onUpdateSubscriptionPlan
}: AccountInfoProps) => {
  const { t } = useLanguage();

  // Helper function to get the appropriate subscription label
  const getSubscriptionLabel = (plan: string | null) => {
    switch(plan) {
      case '1_month':
        return t('subscription.1month');
      case '3_months':
        return t('subscription.3months');
      case '6_months':
        return t('subscription.6months');
      case '12_months':
        return t('subscription.12months');
      case '24_months':
        return t('subscription.24months');
      default:
        return t('subscription.none');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-normal text-[#000000] dark:text-[#FFFFFF]">{t('subscription')}</p>
        
        {isSuperAdmin && onUpdateSubscriptionPlan ? (
          <SubscriptionPlanSelect 
            currentPlan={customer.subscription_plan}
            isUpdating={isUpdatingSubscription}
            onUpdatePlan={onUpdateSubscriptionPlan}
          />
        ) : (
          <span className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
            {getSubscriptionLabel(customer.subscription_plan)}
          </span>
        )}
      </div>
    </div>
  );
};

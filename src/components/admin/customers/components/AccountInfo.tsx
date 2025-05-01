
import { CustomerWithProfile } from "@/types/customer";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { SubscriptionPlanSelect } from "./SubscriptionPlanSelect";

interface AccountInfoProps {
  customer: CustomerWithProfile;
  isOnline: boolean;
  userLastSeen: string | null;
  onCopy?: (text: string, label: string) => void;
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
  
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
          {t('account.details')}
        </p>
        
        <div className="space-y-1">
          <div className="space-y-px">
            <p className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              {t('status')}
            </p>
            <div className="flex items-center gap-1.5">
              <div 
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <span className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
                {isOnline ? t('online') : t('offline')}
                {!isOnline && userLastSeen && (
                  <span className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6] ml-1">
                    ({t('last.seen')} {userLastSeen})
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Removed the 'Created' field here */}

          <div className="space-y-px mt-2">
            <p className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              {t('subscription')}
            </p>
            <div>
              {isSuperAdmin && onUpdateSubscriptionPlan ? (
                <SubscriptionPlanSelect 
                  currentPlan={customer.subscription_plan}
                  isUpdating={isUpdatingSubscription}
                  onUpdatePlan={onUpdateSubscriptionPlan}
                />
              ) : (
                <Badge variant="outline" className="text-xs font-medium bg-transparent border-[#00000033] dark:border-[#FFFFFF33] text-[#000000] dark:text-[#FFFFFF] rounded-sm">
                  {customer.subscription_plan 
                    ? t(`subscription.${customer.subscription_plan.replace('_', '')}`) 
                    : t('no.plan')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

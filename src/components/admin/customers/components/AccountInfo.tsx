
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomerWithProfile } from "@/types/customer";
import { SubscriptionPlanSelect } from "./SubscriptionPlanSelect";

interface AccountInfoProps {
  customer: CustomerWithProfile;
  isOnline: boolean;
  userLastSeen: string | null;
  onCopy: (text: string, label: string) => void;
  isSuperAdmin: boolean;
  isUpdatingSubscription: boolean;
  onUpdateSubscriptionPlan: (plan: string) => void;
  isUserBanned?: boolean;
}

export const AccountInfo = ({
  customer,
  isOnline,
  userLastSeen,
  onCopy,
  isSuperAdmin,
  isUpdatingSubscription,
  onUpdateSubscriptionPlan,
  isUserBanned = false
}: AccountInfoProps) => {
  const { t, language } = useLanguage();

  const getBadgeClass = (isOnline: boolean) => {
    return isOnline 
      ? 'bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 text-white hover:text-white'
      : 'bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white hover:text-white';
  };

  const getLastSeenTime = (lastSeen: string | null) => {
    if (!lastSeen) return '';
    return format(new Date(lastSeen), 'MMM d, HH:mm');
  };

  return (
    <div className="space-y-6 w-full md:w-1/2">
      <div className="space-y-4">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('account')}
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('status')}:
          </span>
          <div className="flex items-center gap-2">
            <Badge className={getBadgeClass(isOnline)}>
              {isOnline ? t('online') : t('offline')}
            </Badge>
          </div>
        </div>
        
        {!isOnline && userLastSeen && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              {t('last.seen')}:
            </span>
            <span className="text-xs text-black dark:text-white">
              {getLastSeenTime(userLastSeen)}
            </span>
          </div>
        )}

        {isUserBanned && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              {t('account.status')}:
            </span>
            <Badge className="bg-red-500 hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600 text-white hover:text-white">
              {t('banned')}
            </Badge>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('created')}:
          </span>
          <span className="text-xs text-black dark:text-white">
            {customer?.profile?.created_at ? format(new Date(customer.profile.created_at), 'MMM d, yyyy') : '-'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('onboarding')}:
          </span>
          <div className="flex items-center">
            <Badge className={
              customer?.onboarding_completed
              ? 'bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 text-white hover:text-white'
              : 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white hover:text-white'
            }>
              {customer?.onboarding_completed ? t('onboarding.completed') : t('onboarding.incomplete')}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('checklist')}:
          </span>
          <div className="flex items-center">
            <Badge className={
              customer?.checklist_completed
              ? 'bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 text-white hover:text-white'
              : 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white hover:text-white'
            }>
              {customer?.checklist_completed ? t('checklist.completed') : t('checklist.incomplete')}
            </Badge>
          </div>
        </div>
        
        {isSuperAdmin && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
              {t('plan')}:
            </span>
            <div className="w-[120px]">
              <SubscriptionPlanSelect 
                currentPlan={customer?.subscription_plan || null}
                onChange={onUpdateSubscriptionPlan}
                isUpdating={isUpdatingSubscription}
              />
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#000000A6] dark:text-[#FFFFFFA6]">
            ID:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-black dark:text-white font-mono">
              {customer?.id.slice(0, 6)}...{customer?.id.slice(-4)}
            </span>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-5 w-5 bg-transparent hover:bg-transparent text-[#000000A6] hover:text-[#000000] dark:text-[#FFFFFFA6] dark:hover:text-[#FFFFFF]"
              onClick={() => onCopy(customer?.id, 'ID')}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

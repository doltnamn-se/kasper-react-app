
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { CustomerWithProfile } from "@/types/customer";

interface AccountInfoProps {
  customer: CustomerWithProfile;
  isOnline: boolean;
  userLastSeen: string | null;
  onCopy: (text: string, label: string) => void;
}

export const AccountInfo = ({ customer, isOnline, userLastSeen, onCopy }: AccountInfoProps) => {
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
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">{t('subscription')}</p>
        <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
          {getSubscriptionLabel(customer.subscription_plan)}
        </span>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">{t('customer.type')}</p>
        <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
          {customer.customer_type.charAt(0).toUpperCase() + customer.customer_type.slice(1)}
        </span>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">{t('created')}</p>
        <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
          {customer.created_at ? format(new Date(customer.created_at), 'PPP') : t('not.available')}
        </span>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">{t('status')}</p>
        <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
          {isOnline ? t('online') : t('offline')}
        </span>
      </div>
      
      {!isOnline && userLastSeen && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">{t('last.seen')}</p>
          <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
            {formatDistanceToNow(new Date(userLastSeen), { addSuffix: true })}
          </span>
        </div>
      )}
    </div>
  );
};

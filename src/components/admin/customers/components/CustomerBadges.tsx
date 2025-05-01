
import { CustomerWithProfile } from "@/types/customer";
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomerBadgesProps {
  customer: CustomerWithProfile;
}

export const CustomerBadges = ({ customer }: CustomerBadgesProps) => {
  const { t } = useLanguage();
  const capitalizedCustomerType = customer.customer_type.charAt(0).toUpperCase() + customer.customer_type.slice(1);
  
  // Get the subscription label
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

  const subscriptionLabel = getSubscriptionLabel(customer.subscription_plan);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
          {t('customer.type')}
        </p>
        <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
          {capitalizedCustomerType}
        </span>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-[#000000] dark:text-[#FFFFFF]">
          {t('subscription')}
        </p>
        <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
          {subscriptionLabel}
        </span>
      </div>
    </div>
  );
};

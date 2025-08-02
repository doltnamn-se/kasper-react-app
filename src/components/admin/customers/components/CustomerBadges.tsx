
import { CustomerWithProfile } from "@/types/customer";
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomerBadgesProps {
  customer: CustomerWithProfile;
}

export const CustomerBadges = ({ customer }: CustomerBadgesProps) => {
  const { t } = useLanguage();
  
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
      case 'personskydd_1_year':
        return 'Personskydd - 1 år';
      case 'parskydd_1_year':
        return 'Parskydd - 1 år';
      case 'familjeskydd_1_year':
        return 'Familjeskydd - 1 år';
      case 'personskydd_2_years':
        return 'Personskydd - 2 år';
      case 'parskydd_2_years':
        return 'Parskydd - 2 år';
      case 'familjeskydd_2_years':
        return 'Familjeskydd - 2 år';
      default:
        return t('subscription.none');
    }
  };

  const subscriptionLabel = getSubscriptionLabel(customer.subscription_plan);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-normal text-[#000000] dark:text-[#FFFFFF]">
          {t('subscription')}
        </p>
        <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
          {subscriptionLabel}
        </span>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-normal text-[#000000] dark:text-[#FFFFFF]">
          {t('customer.type')}
        </p>
        <span className="text-xs text-[#000000] dark:text-[#FFFFFF]">
          {customer.customer_type.charAt(0).toUpperCase() + customer.customer_type.slice(1)}
        </span>
      </div>
    </div>
  );
};

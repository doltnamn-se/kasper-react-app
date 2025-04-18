
import { useLanguage } from "@/contexts/LanguageContext";

interface SubscriptionLabelProps {
  plan: string | null;
}

export const SubscriptionLabel = ({ plan }: SubscriptionLabelProps) => {
  const { t } = useLanguage();
  
  const getSubscriptionLabel = (plan: string | null) => {
    switch(plan) {
      case '1_month':
        return t('subscription.1month');
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
    <span className="text-black dark:text-white">
      {getSubscriptionLabel(plan)}
    </span>
  );
};

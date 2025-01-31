import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface SubscriptionBadgeProps {
  plan: string | null;
}

export const SubscriptionBadge = ({ plan }: SubscriptionBadgeProps) => {
  const { t } = useLanguage();

  const getSubscriptionLabel = (plan: string | null) => {
    switch(plan) {
      case '1_month':
        return t('subscription.1month');
      case '6_months':
        return t('subscription.6months');
      case '12_months':
        return t('subscription.12months');
      default:
        return t('subscription.none');
    }
  };

  return (
    <Badge 
      variant="secondary"
      className="bg-badge-subscription-bg dark:bg-badge-subscription-bg-dark text-badge-subscription-text hover:bg-badge-subscription-bg dark:hover:bg-badge-subscription-bg-dark py-1.5"
    >
      {getSubscriptionLabel(plan)}
    </Badge>
  );
};
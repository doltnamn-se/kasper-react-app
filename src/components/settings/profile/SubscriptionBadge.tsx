
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
      case '24_months':
        return t('subscription.24months');
      default:
        return t('subscription.none');
    }
  };

  return (
    <Badge 
      variant="static"
      className="bg-[#e8e8e8] dark:bg-[#303032] text-[#000000] dark:text-[#ffffff] py-1.5 font-medium" // Changed from font-semibold to font-medium
    >
      {getSubscriptionLabel(plan)}
    </Badge>
  );
};

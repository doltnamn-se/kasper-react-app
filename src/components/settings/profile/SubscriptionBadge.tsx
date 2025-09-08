
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SubscriptionBadgeProps {
  plan: string | null;
}

export const SubscriptionBadge = ({ plan }: SubscriptionBadgeProps) => {
  const { t } = useLanguage();

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
      // New Kasper plans
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

  const getTooltipContent = (plan: string | null) => {
    switch(plan) {
      case '1_month':
        return t('subscription.tooltip.1month');
      case '3_months':
        return t('subscription.tooltip.3months');
      case '6_months':
        return t('subscription.tooltip.6months');
      case '12_months':
        return t('subscription.tooltip.12months');
      case '24_months':
        return t('subscription.tooltip.24months');
      default:
        return '';
    }
  };

  const tooltipContent = getTooltipContent(plan);

  return (
    <Badge 
      variant="static"
      className="py-1.5 font-medium" 
      style={{ 
        backgroundColor: '#d4f5bc',
        color: '#121212'
      }}
    >
      {getSubscriptionLabel(plan)}
    </Badge>
  );
};

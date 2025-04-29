
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="static"
            className="bg-[#e8e8e8] dark:bg-[#303032] text-[#000000] dark:text-[#ffffff] py-1.5 font-medium cursor-help" 
          >
            {getSubscriptionLabel(plan)}
          </Badge>
        </TooltipTrigger>
        {tooltipContent && (
          <TooltipContent>
            <p>{tooltipContent}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

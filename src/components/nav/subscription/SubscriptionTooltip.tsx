import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SubscriptionBadge } from "@/components/settings/profile/SubscriptionBadge";
import { Translations } from "@/translations/types";

interface SubscriptionTooltipProps {
  plan: string | null | undefined;
}

export const SubscriptionTooltip = ({ plan }: SubscriptionTooltipProps) => {
  const { t } = useLanguage();

  const getSubscriptionTooltipKey = (plan: string | null | undefined): keyof Translations => {
    switch (plan) {
      case '6_months':
        return 'subscription.tooltip.6months';
      case '12_months':
        return 'subscription.tooltip.12months';
      default:
        return 'subscription.tooltip.1month';
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            className="p-0 h-auto hover:bg-transparent"
          >
            <SubscriptionBadge plan={plan} />
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#2d2d2d] text-sm"
        >
          <p>{t(getSubscriptionTooltipKey(plan))}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
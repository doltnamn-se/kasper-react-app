import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SubscriptionBadge } from "@/components/settings/profile/SubscriptionBadge";
import { getUserInitials } from "@/utils/profileUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

export const ProfileSection = () => {
  const { userProfile, userEmail } = useUserProfile();
  const { t } = useLanguage();

  const { data: customerData } = useQuery({
    queryKey: ['customer'],
    queryFn: async () => {
      if (!userProfile?.id) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('subscription_plan')
        .eq('id', userProfile.id)
        .single();
      
      if (error) {
        console.error('Error fetching customer:', error);
        return null;
      }
      return data;
    },
    enabled: !!userProfile?.id
  });

  // Split display name into parts
  const displayName = userProfile?.display_name || userEmail || '';
  const nameParts = displayName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  const getSubscriptionTooltipKey = (plan: string | null | undefined) => {
    switch (plan) {
      case '6_months':
        return t('subscription.tooltip.6months');
      case '12_months':
        return t('subscription.tooltip.12months');
      default:
        return t('subscription.tooltip.1month');
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage 
              src={userProfile?.avatar_url} 
              className="aspect-square object-cover"
            />
            <AvatarFallback className="bg-[#e8e8e8] dark:bg-[#303032] text-[#5e5e5e] dark:text-[#FFFFFFA6]">
              {getUserInitials(userProfile)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#000000] dark:text-white leading-tight">
              {firstName}
            </span>
            {lastName && (
              <span className="text-sm font-medium text-[#000000] dark:text-white leading-tight">
                {lastName}
              </span>
            )}
          </div>
        </div>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className="p-0 h-auto hover:bg-transparent"
              >
                <SubscriptionBadge plan={customerData?.subscription_plan} />
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#2d2d2d] text-sm z-[2000]"
            >
              <p>{getSubscriptionTooltipKey(customerData?.subscription_plan)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Separator className="mb-6 bg-[#e5e7eb] dark:bg-[#2d2d2d]" />
    </div>
  );
};
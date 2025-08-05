
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// Subscription badge replaced with Kasper images
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
import { Translations } from "@/translations/types";

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

  // Get the appropriate Kasper image based on subscription plan
  const getKasperImage = (plan: string | null | undefined): string => {
    if (!plan) return '/lovable-uploads/Kasper Personskydd.png';
    
    if (plan.includes('personskydd')) {
      return '/lovable-uploads/Kasper Personskydd.png';
    } else if (plan.includes('parskydd')) {
      return '/lovable-uploads/Kasper Parskydd.png';
    } else if (plan.includes('familjeskydd')) {
      return '/lovable-uploads/Kasper Familjeskydd.png';
    }
    
    // Fallback to Personskydd for all other plans
    return '/lovable-uploads/Kasper Personskydd.png';
  };

  // Get plan name for tooltip
  const getPlanDisplayName = (plan: string | null | undefined): string => {
    if (!plan) return 'Personskydd';
    
    if (plan.includes('personskydd')) {
      return 'Personskydd';
    } else if (plan.includes('parskydd')) {
      return 'Parskydd';
    } else if (plan.includes('familjeskydd')) {
      return 'Familjeskydd';
    }
    
    return 'Personskydd';
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-6">
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
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                className="p-0 h-auto hover:bg-transparent"
              >
                <img 
                  src={getKasperImage(customerData?.subscription_plan)}
                  alt={`Kasper ${getPlanDisplayName(customerData?.subscription_plan)}`}
                  className="h-8 w-auto object-contain"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side="right" 
              className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#2d2d2d] text-sm z-[2000]"
            >
              <p>Kasper {getPlanDisplayName(customerData?.subscription_plan)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Separator className="mb-6 bg-[#e5e7eb] dark:bg-[#2d2d2d]" />
    </div>
  );
};

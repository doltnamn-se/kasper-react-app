import { Link, useLocation } from "react-router-dom";
import { House, BadgeCheck, QrCode, MapPinHouse, MousePointerClick } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getUserInitials } from "@/utils/profileUtils";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MainNavigationProps {
  toggleMobileMenu: () => void;
}

export const MainNavigation = ({ toggleMobileMenu }: MainNavigationProps) => {
  const location = useLocation();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const { notifications = [], unreadCount } = useNotifications();
  const { userProfile, userEmail } = useUserProfile();

  // Fetch customer data to get subscription plan
  const { data: customerData } = useQuery({
    queryKey: ['customer', userProfile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('subscription_plan')
        .eq('id', userProfile?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.id
  });

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

  const getSubscriptionTooltip = (plan: string | null) => {
    switch(plan) {
      case '1_month':
        return t('subscription.tooltip.1month');
      case '6_months':
        return t('subscription.tooltip.6months');
      case '12_months':
        return t('subscription.tooltip.12months');
      default:
        return t('subscription.none');
    }
  };

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === 'info@doltnamn.se') {
        setIsAdmin(true);
      }
    };

    checkAdminStatus();
  }, []);

  if (isAdmin) {
    return null;
  }

  const renderNavLink = (path: string, icon: React.ReactNode, label: string) => {
    const isActive = location.pathname === path;
    
    return (
      <Link 
        to={path} 
        className={`flex items-center justify-between gap-3 mb-3 py-2.5 rounded-md ${
          isActive 
            ? "bg-gray-100 dark:bg-[#2d2d2d]" 
            : "hover:bg-gray-100 dark:hover:bg-[#2d2d2d]"
        }`}
        onClick={toggleMobileMenu}
      >
        <div className="flex items-center gap-3">
          <span className="text-black dark:text-white">{icon}</span>
          <span className="text-sm text-[#000000] dark:text-white font-medium">{label}</span>
        </div>
      </Link>
    );
  };

  // Split display name into parts
  const displayName = userProfile?.display_name || userEmail || '';
  const nameParts = displayName.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProfile?.avatar_url} />
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
                  <Badge 
                    variant="default"
                    className="bg-badge-subscription-bg dark:bg-badge-subscription-bg-dark text-badge-subscription-text font-bold px-3 py-1.5 hover:bg-badge-subscription-bg dark:hover:bg-badge-subscription-bg-dark"
                  >
                    {getSubscriptionLabel(customerData?.subscription_plan)}
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#2d2d2d] text-sm"
              >
                <p>{getSubscriptionTooltip(customerData?.subscription_plan)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Separator className="mb-6 bg-[#e5e7eb] dark:bg-[#2d2d2d]" />
      </div>
      {renderNavLink("/", <House className="w-[18px] h-[18px]" />, t('nav.home'))}
      {renderNavLink("/checklist", <BadgeCheck className="w-[18px] h-[18px]" />, t('nav.checklist'))}
      {renderNavLink("/my-links", <QrCode className="w-[18px] h-[18px]" />, t('nav.my.links'))}
      {renderNavLink("/address-alerts", <MapPinHouse className="w-[18px] h-[18px]" />, t('nav.address.alerts'))}
      {renderNavLink("/guides", <MousePointerClick className="w-[18px] h-[18px]" />, t('nav.guides'))}
    </>
  );
};
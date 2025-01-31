import { Link, useLocation } from "react-router-dom";
import { House, BadgeCheck, UserRoundSearch, QrCode, MapPinHouse, MousePointerClick } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getUserInitials } from "@/utils/profileUtils";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { SubscriptionBadge } from "@/components/settings/profile/SubscriptionBadge";
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
    queryKey: ['customer'],
    queryFn: async () => {
      if (!userProfile?.id) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('*')
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

  const { data: unreadGuideNotifications = 0 } = useQuery({
    queryKey: ['unread-guide-notifications'],
    queryFn: async () => {
      console.log('Fetching unread guide notifications');
      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userProfile?.id)
        .eq('type', 'guide_completion')
        .eq('read', false);

      if (error) {
        console.error('Error fetching unread guide notifications:', error);
        return 0;
      }
      return data?.length || 0;
    },
    enabled: !!userProfile?.id
  });

  const { data: unreadChecklistNotifications = 0 } = useQuery({
    queryKey: ['unread-checklist-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userProfile?.id)
        .eq('type', 'checklist')
        .eq('read', false);

      if (error) return 0;
      return data?.length || 0;
    },
    enabled: !!userProfile?.id
  });

  const { data: unreadMonitoringNotifications = 0 } = useQuery({
    queryKey: ['unread-monitoring-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userProfile?.id)
        .eq('type', 'monitoring')
        .eq('read', false);

      if (error) return 0;
      return data?.length || 0;
    },
    enabled: !!userProfile?.id
  });

  const { data: unreadDeindexingNotifications = 0 } = useQuery({
    queryKey: ['unread-deindexing-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userProfile?.id)
        .eq('type', 'deindexing')
        .eq('read', false);

      if (error) return 0;
      return data?.length || 0;
    },
    enabled: !!userProfile?.id
  });

  // Calculate total unread notifications
  const totalUnreadNotifications = 
    unreadGuideNotifications + 
    unreadChecklistNotifications + 
    unreadMonitoringNotifications + 
    unreadDeindexingNotifications + 
    unreadCount;

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

  const getSubscriptionTooltipKey = (plan: string | null | undefined): keyof Translations => {
    switch (plan) {
      case '6_months':
        return 'subscription.tooltip.6_months';
      case '12_months':
        return 'subscription.tooltip.12_months';
      default:
        return 'subscription.tooltip.none';
    }
  };

  const renderNavLink = (path: string, icon: React.ReactNode, label: string, unreadCount: number = 0) => {
    const isActive = location.pathname === path;
    const hasNotification = unreadCount > 0;
    
    return (
      <Link 
        to={path} 
        className={`flex items-center justify-between gap-3 mb-3 py-2.5 px-3 rounded-md ${
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
        {hasNotification && (
          <div className="h-2 w-2 rounded-full bg-[#2e77d0]" />
        )}
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
                  <SubscriptionBadge plan={customerData?.subscription_plan} />
                </Button>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="bg-white dark:bg-[#1c1c1e] border border-[#e5e7eb] dark:border-[#2d2d2d] text-sm"
              >
                <p>{t(getSubscriptionTooltipKey(customerData?.subscription_plan))}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Separator className="mb-6 bg-[#e5e7eb] dark:bg-[#2d2d2d]" />
      </div>
      {renderNavLink("/", <House className="w-[18px] h-[18px]" />, t('nav.home'), totalUnreadNotifications)}
      {renderNavLink("/checklist", <BadgeCheck className="w-[18px] h-[18px]" />, t('nav.checklist'), unreadChecklistNotifications)}
      {renderNavLink("/monitoring", <UserRoundSearch className="w-[18px] h-[18px]" />, t('nav.monitoring'), unreadMonitoringNotifications)}
      {renderNavLink("/deindexing", <QrCode className="w-[18px] h-[18px]" />, t('nav.my.links'), unreadDeindexingNotifications)}
      {renderNavLink("/address-alerts", <MapPinHouse className="w-[18px] h-[18px]" />, t('nav.address.alerts'), unreadCount)}
      {renderNavLink("/guides", <MousePointerClick className="w-[18px] h-[18px]" />, t('nav.guides'), unreadGuideNotifications)}
    </>
  );
};
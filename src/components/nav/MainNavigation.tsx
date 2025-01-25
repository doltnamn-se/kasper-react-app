import { Link, useLocation } from "react-router-dom";
import { House, BadgeCheck, QrCode, MapPinHouse, MousePointerClick } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getUserInitials } from "@/utils/profileUtils";
import { useUserProfile } from "@/hooks/useUserProfile";

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
        className={`flex items-center justify-between gap-3 mb-3 px-5 py-2.5 rounded-md ${
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

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3 px-5">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-[#e8e8e8] dark:bg-[#303032] text-[#5e5e5e] dark:text-[#FFFFFFA6]">
              {getUserInitials(userProfile)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-[#000000] dark:text-white">
              {userProfile?.display_name || userEmail}
            </span>
            <Badge 
              className="bg-badge-subscription-bg dark:bg-badge-subscription-bg-dark text-badge-subscription-text font-medium py-1 px-2 hover:bg-badge-subscription-bg dark:hover:bg-badge-subscription-bg-dark"
            >
              {getSubscriptionLabel(customerData?.subscription_plan)}
            </Badge>
          </div>
        </div>
        <Separator className="mb-4" />
      </div>
      {renderNavLink("/", <House className="w-[18px] h-[18px]" />, t('nav.home'))}
      {renderNavLink("/checklist", <BadgeCheck className="w-[18px] h-[18px]" />, t('nav.checklist'))}
      {renderNavLink("/my-links", <QrCode className="w-[18px] h-[18px]" />, t('nav.my.links'))}
      {renderNavLink("/address-alerts", <MapPinHouse className="w-[18px] h-[18px]" />, t('nav.address.alerts'))}
      {renderNavLink("/guides", <MousePointerClick className="w-[18px] h-[18px]" />, t('nav.guides'))}
    </>
  );
};
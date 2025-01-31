import { useLocation } from "react-router-dom";
import { House, BadgeCheck, UserRoundSearch, QrCode, MapPinHouse, MousePointerClick } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import { useQuery } from "@tanstack/react-query";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileSection } from "./profile/ProfileSection";
import { SubscriptionTooltip } from "./subscription/SubscriptionTooltip";
import { NavigationLink } from "./navigation/NavigationLink";

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

  const navigationLinks = [
    {
      path: "/",
      icon: House,
      label: t('nav.home'),
      unreadCount: totalUnreadNotifications
    },
    {
      path: "/checklist",
      icon: BadgeCheck,
      label: t('nav.checklist'),
      unreadCount: unreadChecklistNotifications
    },
    {
      path: "/monitoring",
      icon: UserRoundSearch,
      label: t('nav.monitoring'),
      unreadCount: unreadMonitoringNotifications
    },
    {
      path: "/deindexing",
      icon: QrCode,
      label: t('nav.my.links'),
      unreadCount: unreadDeindexingNotifications
    },
    {
      path: "/address-alerts",
      icon: MapPinHouse,
      label: t('nav.address.alerts'),
      unreadCount: unreadCount
    },
    {
      path: "/guides",
      icon: MousePointerClick,
      label: t('nav.guides'),
      unreadCount: unreadGuideNotifications
    }
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <ProfileSection userProfile={userProfile} userEmail={userEmail} />
        <SubscriptionTooltip plan={customerData?.subscription_plan} />
      </div>
      {navigationLinks.map((link) => (
        <NavigationLink
          key={link.path}
          to={link.path}
          icon={link.icon}
          label={link.label}
          isActive={location.pathname === link.path}
          unreadCount={link.unreadCount}
          onClick={toggleMobileMenu}
        />
      ))}
    </>
  );
};

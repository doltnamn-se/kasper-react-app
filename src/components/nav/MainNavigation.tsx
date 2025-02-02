import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";
import { useQuery } from "@tanstack/react-query";
import { useUserProfile } from "@/hooks/useUserProfile";
import { DeindexingProgress } from "./DeindexingProgress";
import { ProfileSection } from "./profile/ProfileSection";
import { NavigationLinks } from "./navigation/NavigationLinks";

interface MainNavigationProps {
  toggleMobileMenu: () => void;
}

export const MainNavigation = ({ toggleMobileMenu }: MainNavigationProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { notifications = [], unreadCount } = useNotifications();
  const { userProfile } = useUserProfile();

  const { data: unreadGuideNotifications = 0 } = useQuery({
    queryKey: ['unread-guide-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userProfile?.id)
        .eq('type', 'guide_completion')
        .eq('read', false);

      if (error) return 0;
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
        .eq('type', 'removal')
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

  const unreadCounts = {
    total: totalUnreadNotifications,
    checklist: unreadChecklistNotifications,
    monitoring: unreadMonitoringNotifications,
    deindexing: unreadDeindexingNotifications,
    addressAlerts: unreadCount,
    guides: unreadGuideNotifications,
  };

  console.log('Unread deindexing notifications:', unreadDeindexingNotifications); // Debug log

  return (
    <>
      <ProfileSection />
      <NavigationLinks 
        unreadCounts={unreadCounts}
        toggleMobileMenu={toggleMobileMenu}
      />
      <DeindexingProgress />
    </>
  );
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadNotifications = (userId?: string) => {
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data;
    },
    enabled: !!userId
  });

  console.log('Unread notifications:', notifications);

  // Count notifications by type
  const unreadGuideNotifications = notifications.filter(n => n.type === 'guide_completion' && !n.read).length;
  const unreadMonitoringNotifications = notifications.filter(n => n.type === 'monitoring' && !n.read).length;
  const unreadDeindexingNotifications = notifications.filter(n => n.type === 'removal' && !n.read).length;
  
  // For address alerts, we'll check if there's any unread address_alert notification
  const hasUnreadAddressAlert = notifications.some(n => n.type === 'address_alert' && !n.read);
  const unreadAddressAlerts = hasUnreadAddressAlert ? 1 : 0;

  return {
    unreadGuideNotifications,
    unreadMonitoringNotifications,
    unreadDeindexingNotifications,
    unreadAddressAlerts
  };
};
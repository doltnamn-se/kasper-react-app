import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/hooks/useNotifications";

export const useUnreadNotifications = (userId: string | undefined) => {
  const { unreadCount } = useNotifications();

  const { data: unreadGuideNotifications = 0 } = useQuery({
    queryKey: ['unread-guide-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('type', 'guide_completion')
        .eq('read', false);

      if (error) return 0;
      return data?.length || 0;
    },
    enabled: !!userId
  });

  const { data: unreadMonitoringNotifications = 0 } = useQuery({
    queryKey: ['unread-monitoring-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('type', 'monitoring')
        .eq('read', false);

      if (error) return 0;
      return data?.length || 0;
    },
    enabled: !!userId
  });

  const { data: unreadDeindexingNotifications = 0 } = useQuery({
    queryKey: ['unread-deindexing-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('type', 'removal')
        .eq('read', false);

      if (error) return 0;
      return data?.length || 0;
    },
    enabled: !!userId
  });

  return {
    unreadGuideNotifications,
    unreadMonitoringNotifications,
    unreadDeindexingNotifications,
    unreadAddressAlerts: unreadCount
  };
};
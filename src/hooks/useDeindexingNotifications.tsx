
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useDeindexingNotifications = () => {
  useEffect(() => {
    const markDeindexingNotificationsAsRead = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      console.log('Marking deindexing notifications as read');
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', session.user.id)
        .eq('type', 'removal')
        .eq('read', false);

      if (error) {
        console.error('Error marking notifications as read:', error);
      } else {
        console.log('Successfully marked deindexing notifications as read');
      }
    };

    markDeindexingNotificationsAsRead();
  }, []);
};

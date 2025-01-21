import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  created_at: string;
};

export const useNotifications = () => {
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const { data: notifications, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      console.log('Fetching notifications...');
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      console.log('Notifications fetched:', data);
      return data as Notification[];
    },
  });

  // Update unread count whenever notifications change
  useEffect(() => {
    if (notifications) {
      const count = notifications.filter(n => !n.read).length;
      setUnreadCount(count);
      console.log('Unread notifications count:', count);
    }
  }, [notifications]);

  // Subscribe to real-time notifications
  useEffect(() => {
    console.log('Setting up notifications subscription...');
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('New notification received:', payload);
          toast({
            title: 'New Notification',
            description: payload.new.title,
          });
          refetch();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up notifications subscription...');
      supabase.removeChannel(channel);
    };
  }, [toast, refetch]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    console.log('Marking notification as read:', notificationId);
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
      return false;
    }

    console.log('Notification marked as read successfully');
    refetch();
    return true;
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    console.log('Marking all notifications as read');
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
      return false;
    }

    console.log('All notifications marked as read successfully');
    refetch();
    return true;
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};
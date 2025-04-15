
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { pushNotificationService } from '@/services/pushNotificationService';
import { isNativePlatform } from '@/capacitor';

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
  const [hasAttemptedRegistration, setHasAttemptedRegistration] = useState(false);

  // Get current user session
  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  // Initialize push notifications on mobile devices
  useEffect(() => {
    if (isNativePlatform() && session?.user && !hasAttemptedRegistration) {
      console.log('useNotifications - Initializing push notifications for user:', session.user.id);
      setHasAttemptedRegistration(true);
      
      pushNotificationService.register().catch(err => {
        console.error("Error registering for push notifications:", err);
      });
      
      // Check if device token is registered
      const checkDeviceToken = async () => {
        try {
          console.log('Checking if device token is registered for user:', session.user.id);
          const { data, error } = await supabase
            .from('device_tokens')
            .select('*')
            .eq('user_id', session.user.id);
            
          if (error) {
            console.error('Error checking device tokens:', error);
          } else {
            console.log('Device tokens found:', data?.length || 0, data);
            
            // If no tokens found, try registering again
            if (!data || data.length === 0) {
              console.log('No device tokens found, attempting registration again');
              await pushNotificationService.register();
            }
          }
        } catch (err) {
          console.error('Error in checkDeviceToken:', err);
        }
      };
      
      // Check after a delay to ensure auth is ready
      setTimeout(checkDeviceToken, 5000);
    }
  }, [session, hasAttemptedRegistration]);

  // Fetch notifications
  const { data: notifications = [], refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      console.log('Fetching notifications...');
      if (!session?.user) {
        console.log('No active session, returning empty notifications array');
        return [];
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      console.log('Notifications fetched:', data);
      return data as Notification[];
    },
    enabled: !!session?.user,
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
    if (!session?.user) {
      console.log('No active session, skipping real-time subscription');
      return;
    }
    
    console.log('Setting up notifications subscription for user:', session.user.id);
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`,
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
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
      });

    return () => {
      console.log('Cleaning up notifications subscription...');
      supabase.removeChannel(channel);
    };
  }, [toast, refetch, session]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    // Skip marking as read for checklist notifications which are virtual
    if (notificationId.startsWith('checklist-')) {
      return true;
    }

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
    if (!session?.user) {
      console.log('No active session, cannot mark all as read');
      return false;
    }
    
    console.log('Marking all notifications as read for user:', session.user.id);
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', session.user.id)
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

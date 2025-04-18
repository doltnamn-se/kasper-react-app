
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { getWebDeviceType } from "@/utils/deviceUtils";
import { isWeb } from "@/capacitor";

export const useCustomerPresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastSeen, setLastSeen] = useState<Record<string, string>>({});
  const { userId } = useAuthStatus();

  useEffect(() => {
    console.log('Setting up presence subscription');
    
    const channel = supabase
      .channel('presence-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        async (payload) => {
          console.log('User presence changed:', payload);
          await fetchPresenceData();
        }
      )
      .subscribe((status) => {
        console.log('Presence channel status:', status);
      });

    const fetchPresenceData = async () => {
      // Fetch online users with web_device_type included
      const { data: onlineData, error: onlineError } = await supabase
        .from('user_presence')
        .select('user_id, web_device_type')
        .eq('status', 'online')
        .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (onlineError) {
        console.error('Error fetching online users:', onlineError);
        toast.error('Failed to fetch user presence data');
        return;
      }

      // Fetch last seen times and web_device_type for all users
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('user_id, last_seen, status, web_device_type');

      if (presenceError) {
        console.error('Error fetching presence data:', presenceError);
        toast.error('Failed to fetch user presence data');
        return;
      }

      console.log('Fetched online users:', onlineData);
      console.log('Fetched presence data:', presenceData);

      const newOnlineUsers = new Set<string>();
      const newLastSeen: Record<string, string> = {};

      // Add users who are explicitly online
      onlineData.forEach(presence => {
        newOnlineUsers.add(presence.user_id);
      });

      // Process all users' last seen times and device types
      presenceData.forEach(presence => {
        newLastSeen[presence.user_id] = presence.last_seen;
        
        // Log device types
        console.log(`User ${presence.user_id} device type: ${presence.web_device_type}`);
        
        // Add users who were active recently but might not be marked as online
        if (presence.status === 'online' && 
            new Date(presence.last_seen).getTime() > Date.now() - 5 * 60 * 1000) {
          newOnlineUsers.add(presence.user_id);
        }
      });

      setOnlineUsers(newOnlineUsers);
      setLastSeen(newLastSeen);
    };

    // Initial fetch
    fetchPresenceData();

    // Set up periodic refresh
    const intervalId = setInterval(fetchPresenceData, 30000);

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      console.log('No authenticated user found');
      return;
    }

    // Only run presence updates on web platform
    if (!isWeb()) {
      console.log('Not updating presence on non-web platform');
      return;
    }

    const deviceType = getWebDeviceType();
    console.log('Current device type:', deviceType);

    const updatePresence = async () => {
      try {
        // First check if user already has a presence record
        const { data: existingPresence } = await supabase
          .from('user_presence')
          .select('web_device_type')
          .eq('user_id', userId)
          .maybeSingle();

        console.log('Existing presence record:', existingPresence);
        
        const { error: presenceError } = await supabase
          .from('user_presence')
          .upsert(
            {
              user_id: userId,
              last_seen: new Date().toISOString(),
              status: 'online',
              web_device_type: deviceType
            },
            {
              onConflict: 'user_id'
            }
          );

        if (presenceError) {
          console.error('Error updating presence:', presenceError);
          toast.error('Failed to update presence status');
        } else {
          console.log('Updated presence with device type:', deviceType);
        }
      } catch (error) {
        console.error('Error in updatePresence:', error);
        toast.error('Failed to update presence status');
      }
    };

    // Update presence immediately and start interval
    updatePresence();
    const intervalId = setInterval(updatePresence, 30000);

    // Set up beforeunload handler
    const handleBeforeUnload = async () => {
      await supabase
        .from('user_presence')
        .upsert(
          {
            user_id: userId,
            last_seen: new Date().toISOString(),
            status: 'offline',
            web_device_type: deviceType
          },
          {
            onConflict: 'user_id'
          }
        );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [userId]);

  return { onlineUsers, lastSeen };
};

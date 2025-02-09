
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCustomerPresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastSeen, setLastSeen] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log('Setting up presence subscription');
    
    const channel = supabase
      .channel('presence-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: 'status=eq.online'
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
      // Fetch online users
      const { data: onlineData, error: onlineError } = await supabase
        .from('user_presence')
        .select('user_id')
        .eq('status', 'online')
        .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (onlineError) {
        console.error('Error fetching online users:', onlineError);
        toast.error('Failed to fetch user presence data');
        return;
      }

      // Fetch last seen times for all users
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('user_id, last_seen, status');

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

      // Process all users' last seen times
      presenceData.forEach(presence => {
        newLastSeen[presence.user_id] = presence.last_seen;
        
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

  // Update current user's presence
  useEffect(() => {
    const updatePresence = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        return;
      }

      if (!user) {
        console.log('No authenticated user found');
        return;
      }

      try {
        const { error: presenceError } = await supabase
          .from('user_presence')
          .upsert(
            {
              user_id: user.id,
              last_seen: new Date().toISOString(),
              status: 'online'
            },
            {
              onConflict: 'user_id'
            }
          );

        if (presenceError) {
          console.error('Error updating presence:', presenceError);
          toast.error('Failed to update presence status');
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('user_presence')
          .upsert(
            {
              user_id: user.id,
              last_seen: new Date().toISOString(),
              status: 'offline'
            },
            {
              onConflict: 'user_id'
            }
          );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, []);

  return { onlineUsers, lastSeen };
};


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
          table: 'user_presence'
        },
        async (payload) => {
          console.log('User presence changed:', payload);
          await fetchPresenceData();
        }
      )
      .subscribe();

    const fetchPresenceData = async () => {
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('*')
        .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (presenceError) {
        console.error('Error fetching presence data:', presenceError);
        toast.error('Failed to fetch user presence data');
        return;
      }

      console.log('Fetched presence data:', presenceData);

      const newOnlineUsers = new Set<string>();
      const newLastSeen: Record<string, string> = {};

      presenceData.forEach(presence => {
        if (presence.status === 'online' || 
            new Date(presence.last_seen).getTime() > Date.now() - 5 * 60 * 1000) {
          newOnlineUsers.add(presence.user_id);
        }
        newLastSeen[presence.user_id] = presence.last_seen;
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

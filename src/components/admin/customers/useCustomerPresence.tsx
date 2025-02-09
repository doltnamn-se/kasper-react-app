
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCustomerPresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastSeen, setLastSeen] = useState<Record<string, string>>({});

  useEffect(() => {
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
          
          // Fetch current online users
          const { data: presenceData, error: presenceError } = await supabase
            .from('user_presence')
            .select('*')
            .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Users seen in last 5 minutes

          if (presenceError) {
            console.error('Error fetching presence data:', presenceError);
            return;
          }

          const newOnlineUsers = new Set<string>();
          const newLastSeen: Record<string, string> = {};

          presenceData.forEach(presence => {
            newOnlineUsers.add(presence.user_id);
            newLastSeen[presence.user_id] = presence.last_seen;
          });

          setOnlineUsers(newOnlineUsers);
          setLastSeen(newLastSeen);
        }
      )
      .subscribe();

    // Initial fetch of online users
    const fetchInitialPresence = async () => {
      const { data: presenceData, error: presenceError } = await supabase
        .from('user_presence')
        .select('*')
        .gt('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (presenceError) {
        console.error('Error fetching initial presence:', presenceError);
        return;
      }

      const initialOnlineUsers = new Set<string>();
      const initialLastSeen: Record<string, string> = {};

      presenceData.forEach(presence => {
        initialOnlineUsers.add(presence.user_id);
        initialLastSeen[presence.user_id] = presence.last_seen;
      });

      setOnlineUsers(initialOnlineUsers);
      setLastSeen(initialLastSeen);
    };

    fetchInitialPresence();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update current user's presence
  useEffect(() => {
    const updatePresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error: presenceError } = await supabase
          .from('user_presence')
          .upsert({ 
            user_id: user.id,
            last_seen: new Date().toISOString(),
            status: 'online'
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          });

        if (presenceError) {
          console.error('Error updating presence:', presenceError);
        }
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { onlineUsers, lastSeen };
};

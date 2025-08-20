import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TypingUser {
  user_id: string;
  display_name: string;
  role: string;
}

export const useTypingIndicator = (conversationId: string | null, currentUserId: string | null) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [channel, setChannel] = useState<any>(null);

  const startTyping = useCallback(async (displayName: string, role: string) => {
    if (!conversationId || !currentUserId || !channel) return;

    await channel.track({
      user_id: currentUserId,
      display_name: displayName,
      role: role,
      typing: true,
      last_typing: Date.now()
    });
  }, [conversationId, currentUserId, channel]);

  const stopTyping = useCallback(async () => {
    if (!conversationId || !currentUserId || !channel) return;

    await channel.untrack();
  }, [conversationId, currentUserId, channel]);

  // Set up presence channel
  useEffect(() => {
    if (!conversationId) {
      setTypingUsers([]);
      return;
    }

    const presenceChannel = supabase.channel(`typing-${conversationId}`, {
      config: { presence: { key: currentUserId } }
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const typing: TypingUser[] = [];
        
        Object.values(newState).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.typing && 
                presence.user_id !== currentUserId &&
                Date.now() - presence.last_typing < 3000) {
              typing.push({
                user_id: presence.user_id,
                display_name: presence.display_name,
                role: presence.role
              });
            }
          });
        });
        
        setTypingUsers(typing);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const typing: TypingUser[] = [];
        
        newPresences.forEach((presence: any) => {
          if (presence.typing && 
              presence.user_id !== currentUserId &&
              Date.now() - presence.last_typing < 3000) {
            typing.push({
              user_id: presence.user_id,
              display_name: presence.display_name,
              role: presence.role
            });
          }
        });
        
        setTypingUsers(prev => {
          const userIds = new Set(prev.map(u => u.user_id));
          const newUsers = typing.filter(u => !userIds.has(u.user_id));
          return [...prev, ...newUsers];
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftUserIds = leftPresences.map((p: any) => p.user_id);
        setTypingUsers(prev => prev.filter(u => !leftUserIds.includes(u.user_id)));
      })
      .subscribe();

    setChannel(presenceChannel);

    return () => {
      supabase.removeChannel(presenceChannel);
      setChannel(null);
      setTypingUsers([]);
    };
  }, [conversationId, currentUserId]);

  // Clean up old typing indicators every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => 
        prev.filter(user => {
          // This is a fallback - presence should handle this automatically
          return true;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return {
    typingUsers,
    startTyping,
    stopTyping
  };
};
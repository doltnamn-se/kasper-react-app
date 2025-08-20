import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadChatMessages = (userId?: string) => {
  const { data: conversations = [] } = useQuery({
    queryKey: ['chat-conversations', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          id,
          status,
          customer_id,
          admin_id
        `)
        .or(`customer_id.eq.${userId},admin_id.eq.${userId}`)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching chat conversations:', error);
        return [];
      }

      return data;
    },
    enabled: !!userId
  });

  // Get unread message counts for all conversations
  const { data: unreadCounts = {} } = useQuery({
    queryKey: ['chat-unread-counts', userId, conversations.map(c => c.id)],
    queryFn: async () => {
      if (!userId || conversations.length === 0) return {};
      
      const conversationIds = conversations.map(c => c.id);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds)
        .neq('sender_id', userId)
        .is('read_at', null);

      if (error) {
        console.error('Error fetching unread message counts:', error);
        return {};
      }

      // Count unread messages per conversation
      const counts: Record<string, number> = {};
      data.forEach(message => {
        counts[message.conversation_id] = (counts[message.conversation_id] || 0) + 1;
      });

      return counts;
    },
    enabled: !!userId && conversations.length > 0
  });

  // Calculate total unread messages across all conversations
  const totalUnreadMessages = Object.values(unreadCounts).reduce((total, count) => total + count, 0);

  return {
    totalUnreadMessages,
    conversations: conversations.map(conv => ({
      ...conv,
      unread_count: unreadCounts[conv.id] || 0
    }))
  };
};
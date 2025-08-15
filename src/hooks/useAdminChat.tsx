import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChatConversation, ChatMessage } from '@/types/chat';
import { toast } from 'sonner';

export const useAdminChat = () => {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch all conversations for admin
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['admin-chat-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          customer:customers(
            id,
            profile:profiles(display_name, email)
          ),
          admin:profiles!chat_conversations_admin_id_fkey(
            id, display_name, email
          )
        `)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin conversations:', error);
        return [];
      }

      // Add unread count for each conversation
      const conversationsWithUnread = await Promise.all(
        data.map(async (conv) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', conv.customer_id)
            .is('read_at', null);

          return {
            ...conv,
            unread_count: count || 0
          };
        })
      );

      return conversationsWithUnread as ChatConversation[];
    }
  });

  // Fetch messages for active conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['admin-chat-messages', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles(id, display_name, email, role)
        `)
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching admin messages:', error);
        return [];
      }

      return data as ChatMessage[];
    },
    enabled: !!activeConversationId
  });

  // Send message as admin
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message, adminId }: { 
      conversationId: string; 
      message: string; 
      adminId: string; 
    }) => {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: adminId,
          message,
          message_type: 'text'
        });

      if (error) throw error;

      // Update conversation status and assign admin if not already assigned
      const { error: updateError } = await supabase
        .from('chat_conversations')
        .update({
          admin_id: adminId,
          status: 'active'
        })
        .eq('id', conversationId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-messages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations'] });
    },
    onError: (error) => {
      console.error('Error sending admin message:', error);
      toast.error('Failed to send message');
    }
  });

  // Assign conversation to admin
  const assignConversationMutation = useMutation({
    mutationFn: async ({ conversationId, adminId }: { conversationId: string; adminId: string }) => {
      const { error } = await supabase
        .from('chat_conversations')
        .update({
          admin_id: adminId,
          status: 'active'
        })
        .eq('id', conversationId);

      if (error) throw error;

      // Add admin as participant (check if already exists first)
      const { data: existingParticipant } = await supabase
        .from('chat_participants')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', adminId)
        .single();

      if (!existingParticipant) {
        const { error: participantError } = await supabase
          .from('chat_participants')
          .insert({
            conversation_id: conversationId,
            user_id: adminId,
            role: 'admin'
          });

        if (participantError) throw participantError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations'] });
      toast.success('Conversation assigned');
    },
    onError: (error) => {
      console.error('Error assigning conversation:', error);
      toast.error('Failed to assign conversation');
    }
  });

  // Close conversation
  const closeConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ status: 'closed' })
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations'] });
      toast.success('Conversation closed');
    },
    onError: (error) => {
      console.error('Error closing conversation:', error);
      toast.error('Failed to close conversation');
    }
  });

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string, adminId: string) => {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', adminId)
      .is('read_at', null);

    if (error) {
      console.error('Error marking admin messages as read:', error);
    }
  }, []);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!activeConversationId) return;

    const channel = supabase
      .channel(`admin-chat-${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${activeConversationId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-chat-messages', activeConversationId] });
          queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, queryClient]);

  // Real-time subscription for all conversation updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-chat-conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    conversations,
    messages,
    activeConversationId,
    loadingConversations,
    loadingMessages,
    setActiveConversationId,
    sendMessage: sendMessageMutation.mutate,
    assignConversation: assignConversationMutation.mutate,
    closeConversation: closeConversationMutation.mutate,
    markAsRead,
    isSendingMessage: sendMessageMutation.isPending
  };
};
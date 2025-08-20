import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChatConversation, ChatMessage, NewChatData } from '@/types/chat';
import { toast } from 'sonner';
import { useTypingIndicator } from './useTypingIndicator';

export const useChat = (userId?: string) => {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // Get user profile for typing indicator
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, role')
        .eq('id', userId)
        .single();
      return data;
    },
    enabled: !!userId
  });

  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(activeConversationId, userId);

  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['chat-conversations', userId],
    queryFn: async () => {
      if (!userId) return [];

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
        .eq('customer_id', userId)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }

      // Add the latest message text to each conversation
      const conversationsWithLastMessage = await Promise.all(
        data.map(async (conv) => {
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('message')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...conv,
            last_message: lastMessage?.message || ''
          };
        })
      );

      return conversationsWithLastMessage as ChatConversation[];
    },
    enabled: !!userId
  });

  // Fetch messages for active conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['chat-messages', activeConversationId],
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
        console.error('Error fetching messages:', error);
        return [];
      }

      return data as ChatMessage[];
    },
    enabled: !!activeConversationId
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (chatData: NewChatData) => {
      if (!userId) throw new Error('User not authenticated');

      const { data: conversationId, error } = await supabase
        .rpc('create_chat_conversation', {
          p_customer_id: userId,
          p_subject: chatData.subject,
          p_priority: (chatData as any)?.priority ?? 'medium'
        });

      if (error) throw error;

      // Send initial message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          message: chatData.message,
          message_type: 'text'
        });

      if (messageError) throw messageError;

      return conversationId;
    },
    onSuccess: (conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      setActiveConversationId(conversationId);
      toast.success('Chat conversation started');
    },
    onError: (error) => {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    }
  });

  // Create conversation with first message (atomic operation)
  const createConversationWithMessageMutation = useMutation({
    mutationFn: async ({ message, subject = 'Support' }: { message: string; subject?: string }) => {
      if (!userId) throw new Error('User not authenticated');

      const { data: conversationId, error } = await supabase
        .rpc('create_chat_conversation', {
          p_customer_id: userId,
          p_subject: subject,
          p_priority: 'medium'
        });

      if (error) throw error;

      // Send the first message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          message,
          message_type: 'text'
        });

      if (messageError) throw messageError;

      return conversationId;
    },
    onSuccess: (conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      setActiveConversationId(conversationId);
      toast.success('Chat conversation started');
    },
    onError: (error) => {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    }
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, message }: { conversationId: string; message: string }) => {
      if (!userId) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          message,
          message_type: 'text'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  });

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .is('read_at', null);

    if (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [userId]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!activeConversationId) return;

    const channel = supabase
      .channel(`chat-${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${activeConversationId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', activeConversationId] });
          queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, queryClient]);

  // Real-time subscription for conversation updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('chat-conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
          filter: `customer_id=eq.${userId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return {
    conversations,
    messages,
    activeConversationId,
    userProfile,
    loadingConversations,
    loadingMessages,
    setActiveConversationId,
    createConversation: createConversationMutation.mutate,
    createConversationWithMessage: createConversationWithMessageMutation.mutate,
    sendMessage: sendMessageMutation.mutate,
    markAsRead,
    isCreatingConversation: createConversationMutation.isPending,
    isCreatingConversationWithMessage: createConversationWithMessageMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
    typingUsers,
    startTyping: (displayName: string, role: string) => startTyping(displayName, role),
    stopTyping
  };
};
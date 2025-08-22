import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChatConversation, ChatMessage, NewChatData } from '@/types/chat';
import { toast } from 'sonner';
import { useTypingIndicator } from './useTypingIndicator';
import { playNewMessageSound } from '@/utils/notificationSound';

export const useAdminChat = (statusFilter: 'active' | 'closed' = 'active') => {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // Get current admin profile for typing indicator
  const { data: adminProfile } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, role')
        .eq('id', user.id)
        .single();
      return data;
    }
  });

  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(
    activeConversationId, 
    adminProfile?.id || null
  );

  // Fetch all conversations for admin
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['admin-chat-conversations', statusFilter, adminProfile?.id],
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
        .eq('status', statusFilter)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin conversations:', error);
        return [];
      }

      // Add unread count and latest message for each conversation
      const conversationsWithUnread = await Promise.all(
        data.map(async (conv) => {
          // Exclude messages sent by the current admin from unread count
          const adminIdForFilter = adminProfile?.id || conv.admin_id || null;
          const unreadQuery = supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .is('read_at', null);
          const { count } = await (adminIdForFilter 
            ? unreadQuery.neq('sender_id', adminIdForFilter)
            : unreadQuery);

          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('message')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...conv,
            unread_count: count || 0,
            last_message: lastMessage?.message || ''
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
    mutationFn: async ({ conversationId, message, adminId, attachmentUrl }: { 
      conversationId: string; 
      message: string; 
      adminId: string;
      attachmentUrl?: string;
    }) => {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: adminId,
          message,
          message_type: attachmentUrl ? 'attachment' : 'text',
          attachment_url: attachmentUrl
        });

      if (error) throw error;

      // Update conversation to assign admin if not already assigned
      const { error: updateError } = await supabase
        .from('chat_conversations')
        .update({
          admin_id: adminId
        })
        .eq('id', conversationId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-messages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'closed'] });
      // Also invalidate unread message queries to update TopNav notification dots
      queryClient.invalidateQueries({ queryKey: ['chat-unread-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-unread-counts'] });
    },
    onError: (error) => {
      console.error('Error sending admin message:', error);
      toast.error('Failed to send message');
    }
  });

  // Create new conversation as admin (without sending any message)
  const createConversationMutation = useMutation({
    mutationFn: async ({ customerId, adminId, chatData }: { 
      customerId: string; 
      adminId: string; 
      chatData: NewChatData; 
    }) => {
      const { data: conversationId, error } = await supabase
        .rpc('create_chat_conversation', {
          p_customer_id: customerId,
          p_subject: chatData.subject,
          p_priority: (chatData as any)?.priority ?? 'medium'
        });

      if (error) throw error;

      // Update conversation to assign admin (status is already 'active' by default)
      const { error: updateError } = await supabase
        .from('chat_conversations')
        .update({
          admin_id: adminId
        })
        .eq('id', conversationId);

      if (updateError) throw updateError;

      // Add admin as participant
      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert({
          conversation_id: conversationId,
          user_id: adminId,
          role: 'admin'
        });

      if (participantError) throw participantError;

      return conversationId;
    },
    onSuccess: (conversationId) => {
      console.log('Admin conversation created successfully:', conversationId);
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'closed'] });
      setActiveConversationId(conversationId);
      toast.success('Chat conversation started');
    },
    onError: (error) => {
      console.error('Error creating admin conversation:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      toast.error('Failed to start conversation');
    }
  });

  // Create conversation and send the first message atomically
  const createConversationWithMessageMutation = useMutation({
    mutationFn: async ({ customerId, adminId, message, subject = 'Support', attachmentUrl }: {
      customerId: string;
      adminId: string;
      message: string;
      subject?: string;
      attachmentUrl?: string;
    }) => {
      // Create conversation
      const { data: conversationId, error } = await supabase
        .rpc('create_chat_conversation', {
          p_customer_id: customerId,
          p_subject: subject,
          p_priority: 'medium'
        });
      if (error) throw error;

      // Assign admin to conversation
      const { error: updateError } = await supabase
        .from('chat_conversations')
        .update({ admin_id: adminId })
        .eq('id', conversationId);
      if (updateError) throw updateError;

      // Ensure admin is a participant
      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert({ conversation_id: conversationId, user_id: adminId, role: 'admin' });
      if (participantError) throw participantError;

      // Send the first message
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: adminId,
          message,
          message_type: attachmentUrl ? 'attachment' : 'text',
          attachment_url: attachmentUrl
        });
      if (messageError) throw messageError;

      return conversationId;
    },
    onSuccess: (conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'closed'] });
      queryClient.invalidateQueries({ queryKey: ['admin-chat-messages', conversationId] });
      setActiveConversationId(conversationId);
    },
    onError: (error) => {
      console.error('Error creating admin conversation with message:', error);
      toast.error('Failed to start conversation');
    }
  });

  // Assign conversation to admin
  const assignConversationMutation = useMutation({
    mutationFn: async ({ conversationId, adminId }: { conversationId: string; adminId: string }) => {
      const { error } = await supabase
        .from('chat_conversations')
        .update({
          admin_id: adminId
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
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'closed'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'closed'] });
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
    } else {
      // Refresh conversation list to update unread counts
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'active', adminProfile?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'closed', adminProfile?.id] });
      // Also invalidate TopNav message icon queries
      queryClient.invalidateQueries({ queryKey: ['chat-unread-conversations', adminId] });
      queryClient.invalidateQueries({ queryKey: ['chat-unread-counts'] });
    }
  }, [queryClient, adminProfile?.id]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!activeConversationId || !adminProfile?.id) return;

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
        (payload) => {
          // Don't play notification sound for active conversation - user is already viewing it
          queryClient.invalidateQueries({ queryKey: ['admin-chat-messages', activeConversationId] });
          queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'active'] });
          queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'closed'] });
          // Also invalidate unread message queries to update TopNav notification dots
          queryClient.invalidateQueries({ queryKey: ['chat-unread-conversations'] });
          queryClient.invalidateQueries({ queryKey: ['chat-unread-counts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, queryClient, adminProfile?.id]);

  // Global subscription for notification sounds (messages NOT in active conversation)
  useEffect(() => {
    if (!adminProfile?.id) return;

    const channel = supabase
      .channel('admin-global-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          // Play notification sound if message is not from current admin and not from active conversation
          if (payload.new && 
              payload.new.sender_id !== adminProfile.id && 
              payload.new.conversation_id !== activeConversationId) {
            playNewMessageSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminProfile?.id, activeConversationId]);

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
          queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'active'] });
          queryClient.invalidateQueries({ queryKey: ['admin-chat-conversations', 'closed'] });
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
    adminProfile,
    loadingConversations,
    loadingMessages,
    setActiveConversationId,
    createConversation: createConversationMutation.mutate,
    createConversationWithMessage: createConversationWithMessageMutation.mutate,
    sendMessage: sendMessageMutation.mutate,
    assignConversation: assignConversationMutation.mutate,
    closeConversation: closeConversationMutation.mutate,
    markAsRead,
    isCreatingConversation: createConversationMutation.isPending,
    isCreatingConversationWithMessage: createConversationWithMessageMutation.isPending,
    isSendingMessage: sendMessageMutation.isPending,
    typingUsers,
    startTyping: (displayName: string, role: string) => startTyping(displayName, role),
    stopTyping
  };
};
import { supabase } from '@/integrations/supabase/client';
import { playNewMessageSound } from '@/utils/notificationSound';

class GlobalChatNotificationService {
  private subscriptions: any[] = [];
  private currentUserId: string | null = null;
  private isAdmin: boolean = false;

  async initialize(userId: string, isAdminUser: boolean = false) {
    this.currentUserId = userId;
    this.isAdmin = isAdminUser;
    
    // Clean up existing subscriptions
    this.cleanup();
    
    // Set up global chat message notifications
    this.setupChatNotifications();
  }

  private setupChatNotifications() {
    if (!this.currentUserId) return;

    console.log('Setting up global chat notifications for user:', this.currentUserId, 'isAdmin:', this.isAdmin);

    // Subscribe to all chat messages globally
    const messageSubscription = supabase
      .channel('global-chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          console.log('Global chat message received:', payload);
          this.handleNewMessage(payload.new);
        }
      )
      .subscribe();

    this.subscriptions.push(messageSubscription);
  }

  private async handleNewMessage(message: any) {
    if (!this.currentUserId || !message) return;

    // Don't play sound for own messages
    if (message.sender_id === this.currentUserId) return;

    try {
      // Check if this message is for the current user
      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .select('customer_id, admin_id')
        .eq('id', message.conversation_id)
        .single();

      if (error) {
        console.error('Error fetching conversation:', error);
        return;
      }

      // Determine if this user should receive notification
      let shouldNotify = false;

      if (this.isAdmin) {
        // Admin receives notifications for messages from customers
        shouldNotify = conversation.admin_id === this.currentUserId;
      } else {
        // Regular user receives notifications for messages in their conversations
        shouldNotify = conversation.customer_id === this.currentUserId;
      }

      if (shouldNotify) {
        console.log('Playing notification sound for new message');
        await playNewMessageSound();
      }
    } catch (error) {
      console.error('Error handling new message notification:', error);
    }
  }

  cleanup() {
    this.subscriptions.forEach(subscription => {
      supabase.removeChannel(subscription);
    });
    this.subscriptions = [];
  }

  destroy() {
    this.cleanup();
    this.currentUserId = null;
    this.isAdmin = false;
  }
}

// Create singleton instance
export const globalChatNotifications = new GlobalChatNotificationService();
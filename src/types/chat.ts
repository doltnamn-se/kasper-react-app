export interface ChatConversation {
  id: string;
  customer_id: string;
  admin_id?: string;
  status: 'active' | 'closed' | 'waiting_admin' | 'waiting_customer';
  subject?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  customer?: {
    id: string;
    profile?: {
      display_name?: string;
      email?: string;
    };
  };
  admin?: {
    id: string;
    display_name?: string;
    email?: string;
  };
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'system' | 'attachment';
  attachment_url?: string;
  read_at?: string;
  created_at: string;
  sender?: {
    id: string;
    display_name?: string;
    email?: string;
    role?: string;
  };
}

export interface ChatParticipant {
  conversation_id: string;
  user_id: string;
  role: 'customer' | 'admin';
  joined_at: string;
}

export interface NewChatData {
  subject?: string;
  priority: 'low' | 'medium' | 'high';
  message: string;
}
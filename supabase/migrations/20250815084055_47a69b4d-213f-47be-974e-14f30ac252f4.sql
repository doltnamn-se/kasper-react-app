-- Create chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'waiting_admin' CHECK (status IN ('active', 'closed', 'waiting_admin', 'waiting_customer')),
  subject TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'attachment')),
  attachment_url TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat participants table
CREATE TABLE public.chat_participants (
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
CREATE POLICY "Customers can view their own conversations" 
ON public.chat_conversations 
FOR SELECT 
USING (customer_id = auth.uid());

CREATE POLICY "Customers can create their own conversations" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their own conversations" 
ON public.chat_conversations 
FOR UPDATE 
USING (customer_id = auth.uid());

CREATE POLICY "Admins can view all conversations" 
ON public.chat_conversations 
FOR SELECT 
USING (is_super_admin());

CREATE POLICY "Admins can update all conversations" 
ON public.chat_conversations 
FOR UPDATE 
USING (is_super_admin());

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their conversations" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.chat_messages 
FOR UPDATE 
USING (sender_id = auth.uid());

-- RLS Policies for chat_participants
CREATE POLICY "Users can view their own participations" 
ON public.chat_participants 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all participations" 
ON public.chat_participants 
FOR SELECT 
USING (is_super_admin());

CREATE POLICY "System can manage participations" 
ON public.chat_participants 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update last_message_at when new message is added
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chat_conversations 
  SET last_message_at = NEW.created_at 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();

-- Function to create conversation with participants
CREATE OR REPLACE FUNCTION public.create_chat_conversation(
  p_customer_id UUID,
  p_subject TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Create the conversation
  INSERT INTO public.chat_conversations (customer_id, subject, priority)
  VALUES (p_customer_id, p_subject, p_priority)
  RETURNING id INTO conversation_id;
  
  -- Add customer as participant
  INSERT INTO public.chat_participants (conversation_id, user_id, role)
  VALUES (conversation_id, p_customer_id, 'customer');
  
  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX idx_chat_conversations_customer_id ON public.chat_conversations(customer_id);
CREATE INDEX idx_chat_conversations_admin_id ON public.chat_conversations(admin_id);
CREATE INDEX idx_chat_conversations_status ON public.chat_conversations(status);
CREATE INDEX idx_chat_conversations_last_message_at ON public.chat_conversations(last_message_at DESC);
CREATE INDEX idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_chat_participants_user_id ON public.chat_participants(user_id);
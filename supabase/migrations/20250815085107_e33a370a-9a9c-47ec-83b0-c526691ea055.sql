-- Fix search path security issues by dropping and recreating with CASCADE
DROP TRIGGER IF EXISTS update_conversation_last_message_trigger ON public.chat_messages CASCADE;
DROP FUNCTION IF EXISTS public.update_conversation_last_message() CASCADE;
DROP FUNCTION IF EXISTS public.create_chat_conversation(UUID, TEXT, TEXT) CASCADE;

-- Recreate functions with proper search path
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.chat_conversations 
  SET last_message_at = NEW.created_at 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Recreate trigger
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
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;
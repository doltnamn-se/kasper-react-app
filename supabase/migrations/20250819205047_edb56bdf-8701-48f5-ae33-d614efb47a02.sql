-- Remove priority column from chat_conversations table
ALTER TABLE public.chat_conversations 
DROP COLUMN IF EXISTS priority;

-- Update the create_chat_conversation function to remove priority parameter
CREATE OR REPLACE FUNCTION public.create_chat_conversation(p_customer_id uuid, p_subject text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  conversation_id UUID;
BEGIN
  -- Create the conversation
  INSERT INTO public.chat_conversations (customer_id, subject)
  VALUES (p_customer_id, p_subject)
  RETURNING id INTO conversation_id;
  
  -- Add customer as participant
  INSERT INTO public.chat_participants (conversation_id, user_id, role)
  VALUES (conversation_id, p_customer_id, 'customer');
  
  RETURN conversation_id;
END;
$function$
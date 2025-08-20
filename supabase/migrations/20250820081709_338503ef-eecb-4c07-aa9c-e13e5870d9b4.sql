-- Add missing priority column to support the 3-arg create_chat_conversation function
ALTER TABLE public.chat_conversations
ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium';
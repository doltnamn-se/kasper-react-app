-- Clear all test chat data before going live
-- Delete in correct order to avoid any potential reference issues

-- First delete all chat messages
DELETE FROM public.chat_messages;

-- Then delete all chat participants  
DELETE FROM public.chat_participants;

-- Finally delete all chat conversations
DELETE FROM public.chat_conversations;
-- Enable real-time for chat_messages table
ALTER TABLE chat_messages REPLICA IDENTITY FULL;

-- Add chat_messages to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Also enable real-time for chat_conversations table
ALTER TABLE chat_conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
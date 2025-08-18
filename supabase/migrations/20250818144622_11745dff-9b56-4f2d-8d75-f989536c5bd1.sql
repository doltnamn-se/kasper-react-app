-- Update chat_conversations table to use 'active' as default status instead of 'waiting_admin'
ALTER TABLE chat_conversations 
ALTER COLUMN status SET DEFAULT 'active';

-- Update any existing 'waiting_admin' conversations to 'active'
UPDATE chat_conversations 
SET status = 'active' 
WHERE status = 'waiting_admin';
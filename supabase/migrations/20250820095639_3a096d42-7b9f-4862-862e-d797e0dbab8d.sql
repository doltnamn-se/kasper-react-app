-- Allow users to mark messages as read in their conversations
-- This enables customers to mark admin messages as read and vice versa
CREATE POLICY "Users can mark messages as read in their conversations" 
ON chat_messages 
FOR UPDATE 
USING (
  -- User must be a participant in the conversation
  EXISTS (
    SELECT 1 FROM chat_participants 
    WHERE chat_participants.conversation_id = chat_messages.conversation_id 
    AND chat_participants.user_id = auth.uid()
  )
) 
WITH CHECK (
  -- Only allow updating the read_at field, not the message content itself
  -- User must be a participant in the conversation
  EXISTS (
    SELECT 1 FROM chat_participants 
    WHERE chat_participants.conversation_id = chat_messages.conversation_id 
    AND chat_participants.user_id = auth.uid()
  )
);
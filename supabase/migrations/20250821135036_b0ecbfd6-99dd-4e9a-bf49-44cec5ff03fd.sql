-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', false);

-- Create RLS policies for chat attachments bucket
-- Users can view their own attachments
CREATE POLICY "Users can view their own chat attachments" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'chat-attachments' AND 
  (
    -- User is the sender of the message that contains this attachment
    EXISTS (
      SELECT 1 FROM chat_messages cm 
      WHERE cm.attachment_url LIKE '%' || name || '%' 
      AND cm.sender_id = auth.uid()
    )
    OR
    -- User is part of the conversation that contains this attachment
    EXISTS (
      SELECT 1 FROM chat_messages cm
      JOIN chat_conversations cc ON cm.conversation_id = cc.id
      WHERE cm.attachment_url LIKE '%' || name || '%'
      AND (cc.customer_id = auth.uid() OR cc.admin_id = auth.uid())
    )
  )
);

-- Users can upload their own attachments
CREATE POLICY "Users can upload their own chat attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own attachments
CREATE POLICY "Users can update their own chat attachments" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'chat-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own attachments
CREATE POLICY "Users can delete their own chat attachments" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'chat-attachments' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
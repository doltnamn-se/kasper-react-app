-- Fix admin chat access issues by updating RLS policies

-- Update chat_messages RLS policy to allow super admins to view all messages
DROP POLICY IF EXISTS "Admins can view all messages" ON chat_messages;
CREATE POLICY "Admins can view all messages" 
ON chat_messages 
FOR SELECT 
USING (is_super_admin());

-- Update chat_messages RLS policy to allow super admins to insert messages
DROP POLICY IF EXISTS "Admins can insert messages" ON chat_messages;
CREATE POLICY "Admins can insert messages" 
ON chat_messages 
FOR INSERT 
WITH CHECK (is_super_admin());

-- Update chat_messages RLS policy to allow super admins to update messages  
DROP POLICY IF EXISTS "Admins can update all messages" ON chat_messages;
CREATE POLICY "Admins can update all messages" 
ON chat_messages 
FOR UPDATE 
USING (is_super_admin());
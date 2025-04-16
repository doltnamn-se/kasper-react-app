
-- Create a table to store device tokens for push notifications
CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT NOT NULL, -- 'android' or 'ios'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add a unique constraint to prevent duplicate tokens for a user
ALTER TABLE device_tokens ADD CONSTRAINT device_token_unique UNIQUE (user_id, token);

-- Create an index to speed up lookup by user_id
CREATE INDEX IF NOT EXISTS device_tokens_user_id_idx ON device_tokens (user_id);

-- Add RLS policies for device_tokens table
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own device tokens
CREATE POLICY "Users can view their own device tokens" 
  ON device_tokens FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert their own device tokens
CREATE POLICY "Users can insert their own device tokens" 
  ON device_tokens FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own device tokens
CREATE POLICY "Users can update their own device tokens" 
  ON device_tokens FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to delete their own device tokens
CREATE POLICY "Users can delete their own device tokens" 
  ON device_tokens FOR DELETE 
  USING (auth.uid() = user_id);

-- Add the table to the publication for realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE device_tokens;

-- Recreate the handle_notification_inserted function to properly handle notifications
CREATE OR REPLACE FUNCTION handle_notification_inserted()
RETURNS TRIGGER AS $$
DECLARE
    response JSONB;
    service_role_key TEXT;
BEGIN
    -- Get the service role key
    service_role_key := current_setting('supabase.service_role.key', true);
    
    -- Log the notification details
    RAISE LOG 'New notification inserted: ID=%, Type=%, User ID=%', 
        NEW.id, NEW.type, NEW.user_id;
    
    -- Call the handle-new-notification edge function
    SELECT net.http_post(
        url := 'https://upfapfohwnkiugvebujh.supabase.co/functions/v1/handle-new-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
            'id', NEW.id,
            'user_id', NEW.user_id,
            'title', NEW.title,
            'message', NEW.message,
            'type', NEW.type
        )
    ) INTO response;
    
    RAISE LOG 'handle-new-notification response: %', response;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_notification_inserted: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger for new notifications
DROP TRIGGER IF EXISTS on_notification_created ON notifications;
CREATE TRIGGER on_notification_created
    AFTER INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION handle_notification_inserted();

-- Make sure the device_tokens table has replica identity full for real-time updates
ALTER TABLE device_tokens REPLICA IDENTITY FULL;

-- Update notification_preferences to make sure it includes all the necessary columns
DO $$
BEGIN
    -- Check if columns exist and add them if they don't
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notification_preferences' 
                  AND column_name = 'email_monitoring') THEN
        ALTER TABLE notification_preferences ADD COLUMN email_monitoring BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notification_preferences' 
                  AND column_name = 'email_deindexing') THEN
        ALTER TABLE notification_preferences ADD COLUMN email_deindexing BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notification_preferences' 
                  AND column_name = 'email_address_alerts') THEN
        ALTER TABLE notification_preferences ADD COLUMN email_address_alerts BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'notification_preferences' 
                  AND column_name = 'email_news') THEN
        ALTER TABLE notification_preferences ADD COLUMN email_news BOOLEAN DEFAULT true;
    END IF;
END $$;

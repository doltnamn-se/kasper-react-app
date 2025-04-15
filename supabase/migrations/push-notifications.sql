
-- Create a table to store device tokens for push notifications
CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  token TEXT NOT NULL,
  device_type TEXT NOT NULL, -- 'android' or 'ios'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add a unique constraint to prevent duplicate tokens for a user
ALTER TABLE device_tokens ADD CONSTRAINT device_token_unique UNIQUE (user_id, token);

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

-- Update the existing notification trigger function to call our edge function
CREATE OR REPLACE FUNCTION handle_notification_email()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    email_notifications BOOLEAN;
    response JSONB;
    service_role_key TEXT;
BEGIN
    -- Initial trigger logging
    RAISE LOG 'handle_notification_email START - Notification details: ID=%, Type=%, User ID=%', 
        NEW.id, NEW.type, NEW.user_id;
    
    -- Get and log service role key
    service_role_key := current_setting('supabase.service_role.key', true);
    
    -- Get user email and preferences
    SELECT 
        u.email,
        np.email_notifications
    INTO 
        user_email,
        email_notifications
    FROM auth.users u
    JOIN notification_preferences np ON np.user_id = u.id
    WHERE u.id = NEW.user_id;

    RAISE LOG 'User data retrieved - Email: %, Notifications enabled: %',
        user_email,
        email_notifications;

    -- Check if email notifications are enabled
    IF email_notifications THEN
        RAISE LOG 'Email notifications enabled - Attempting to send email';
        
        SELECT net.http_post(
            url := 'https://upfapfohwnkiugvebujh.supabase.co/functions/v1/send-notification-email',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || service_role_key
            ),
            body := jsonb_build_object(
                'email', user_email,
                'title', NEW.title,
                'message', NEW.message,
                'type', NEW.type
            )
        ) INTO response;
        
        RAISE LOG 'Email response received: %', response;
    ELSE
        RAISE LOG 'Email notifications disabled for user: %', user_email;
    END IF;
    
    -- Always send push notification regardless of email preferences
    RAISE LOG 'Attempting to send push notification';
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
    
    RAISE LOG 'Push notification response received: %', response;
    
    RAISE LOG 'handle_notification_email END - Completed successfully';
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_notification_email: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

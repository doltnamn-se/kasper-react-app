
-- Ensure the device_tokens table has correct constraints and RLS policies
ALTER TABLE IF EXISTS device_tokens 
  DROP CONSTRAINT IF EXISTS device_token_unique;

ALTER TABLE IF EXISTS device_tokens 
  ADD CONSTRAINT device_token_unique UNIQUE (user_id, token);

-- Update RLS policies for device_tokens table
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own device tokens" ON device_tokens;
  DROP POLICY IF EXISTS "Users can insert their own device tokens" ON device_tokens;
  DROP POLICY IF EXISTS "Users can update their own device tokens" ON device_tokens;
  DROP POLICY IF EXISTS "Users can delete their own device tokens" ON device_tokens;
  
  -- Create policies
  CREATE POLICY "Users can view their own device tokens" 
    ON device_tokens FOR SELECT 
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert their own device tokens" 
    ON device_tokens FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  
  CREATE POLICY "Users can update their own device tokens" 
    ON device_tokens FOR UPDATE 
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can delete their own device tokens" 
    ON device_tokens FOR DELETE 
    USING (auth.uid() = user_id);
END $$;

-- Modify notification trigger to always call the push notification function
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
    
    -- Get service role key
    service_role_key := current_setting('supabase.service_role.key', true);
    RAISE LOG 'Service role key retrieved (length: %)', length(service_role_key);
    
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
    
    -- Send push notification - always attempt regardless of email preferences
    RAISE LOG 'Attempting to send push notification via handle-new-notification';
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
$$ LANGUAGE plpgsql;

-- Ensure the trigger is properly set
DROP TRIGGER IF EXISTS trigger_notification_email ON notifications;
CREATE TRIGGER trigger_notification_email
AFTER INSERT ON notifications
FOR EACH ROW EXECUTE FUNCTION handle_notification_email();


-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_notification_created ON notifications;

-- Update the trigger function with improved logging
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
        
        RAISE LOG 'HTTP Response received: %', response;
    ELSE
        RAISE LOG 'Email notifications disabled for user: %', user_email;
    END IF;

    RAISE LOG 'handle_notification_email END - Completed successfully';
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_notification_email: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER on_notification_created
    AFTER INSERT ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION handle_notification_email();

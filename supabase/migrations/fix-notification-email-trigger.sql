
-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_notification_created ON notifications;

-- Update the notification email function with enhanced logging and stricter rate limiting
CREATE OR REPLACE FUNCTION handle_notification_email()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    email_notifications BOOLEAN;
    last_sent TIMESTAMP WITH TIME ZONE;
    response JSONB;
    service_role_key TEXT;
BEGIN
    -- Initial logging
    RAISE LOG 'handle_notification_email triggered for notification ID: %, Type: %', NEW.id, NEW.type;
    
    -- Get service role key for edge function auth
    service_role_key := current_setting('supabase.service_role.key', true);
    
    -- Get user email, preferences and last email sent time
    SELECT 
        u.email,
        np.email_notifications,
        np.last_email_sent_at
    INTO 
        user_email,
        email_notifications,
        last_sent
    FROM auth.users u
    LEFT JOIN notification_preferences np ON np.user_id = u.id
    WHERE u.id = NEW.user_id;

    RAISE LOG 'User data retrieved - Email: %, Notifications enabled: %, Last sent at: %',
        user_email,
        email_notifications,
        last_sent;

    -- Only proceed if email notifications are enabled
    IF email_notifications THEN
        -- Apply rate limiting - only send if this is the first email or more than 1 minute has passed
        IF last_sent IS NULL OR (now() - last_sent) > INTERVAL '1 minute' THEN
            -- Update the last email sent timestamp BEFORE sending to prevent race conditions
            RAISE LOG 'Updating last_email_sent_at for user: %', NEW.user_id;
            
            UPDATE notification_preferences 
            SET last_email_sent_at = now() 
            WHERE user_id = NEW.user_id;

            -- Send the email via edge function
            RAISE LOG 'Rate limit passed, sending email to: %', user_email;
            
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
            
            RAISE LOG 'Email function response: %', response;
        ELSE
            -- Log rate limiting in effect
            RAISE LOG 'Rate limiting applied - skipping email for user % (last sent: %)', 
                NEW.user_id, last_sent;
        END IF;
    ELSE
        RAISE LOG 'Email notifications disabled for user: %', NEW.user_id;
    END IF;

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

-- Make sure notification_preferences table is properly set up
DO $$
BEGIN
    -- Ensure the column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notification_preferences' 
        AND column_name = 'last_email_sent_at'
    ) THEN
        ALTER TABLE notification_preferences 
        ADD COLUMN last_email_sent_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Set default notification preferences for users without preferences
INSERT INTO notification_preferences (user_id, email_notifications, in_app_notifications)
SELECT id, true, true
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
AND id IS NOT NULL;

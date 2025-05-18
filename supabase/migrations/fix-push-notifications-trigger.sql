
-- Fix the notification trigger to properly call our edge functions
CREATE OR REPLACE FUNCTION handle_notification_email()
RETURNS TRIGGER AS $$
DECLARE
    user_email TEXT;
    email_notifications BOOLEAN;
    response JSONB;
    service_role_key TEXT;
BEGIN
    -- Log trigger execution - detailed to track progress
    RAISE LOG '================================================';
    RAISE LOG 'NOTIFICATION TRIGGER: Started for ID=%, Type=%, User=%', 
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

    RAISE LOG 'User data retrieved - Email: %, Email notifications enabled: %',
        user_email,
        email_notifications;

    -- Check if email notifications are enabled
    IF email_notifications THEN
        RAISE LOG 'Sending email notification to: %', user_email;
        
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
        
        RAISE LOG 'Email notification response: %', response;
    ELSE
        RAISE LOG 'Email notifications disabled for user: %', user_email;
    END IF;
    
    -- Always attempt to send push notification
    RAISE LOG 'Explicitly sending push notification via handle-new-notification';
    
    -- Call handle-new-notification with detailed logging
    BEGIN
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
        
        RAISE LOG 'Push notification response: %', response;
    EXCEPTION WHEN OTHERS THEN
        -- Catch any error that occurs during the push notification request
        RAISE LOG 'Error sending push notification: %', SQLERRM;
    END;
    
    RAISE LOG 'NOTIFICATION TRIGGER: Completed successfully';
    RAISE LOG '================================================';
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in notification trigger: %', SQLERRM;
    RETURN NEW; -- Always return NEW to ensure notification is still created
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger is properly applied
DROP TRIGGER IF EXISTS trigger_notification_email ON notifications;
CREATE TRIGGER trigger_notification_email
AFTER INSERT ON notifications
FOR EACH ROW EXECUTE FUNCTION handle_notification_email();

-- Create a direct test function to manually invoke the push notification flow
-- This can be called directly to test push notifications
CREATE OR REPLACE FUNCTION test_push_notification(
    user_id UUID,
    title TEXT,
    message TEXT,
    notification_type TEXT DEFAULT 'test'
)
RETURNS JSONB AS $$
DECLARE
    service_role_key TEXT;
    response JSONB;
BEGIN
    RAISE LOG 'MANUAL TEST: Testing push notification for user %', user_id;
    
    service_role_key := current_setting('supabase.service_role.key', true);
    
    SELECT net.http_post(
        url := 'https://upfapfohwnkiugvebujh.supabase.co/functions/v1/handle-new-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
            'id', gen_random_uuid(),
            'user_id', user_id,
            'title', title,
            'message', message,
            'type', notification_type
        )
    ) INTO response;
    
    RAISE LOG 'Manual test response: %', response;
    RETURN response;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in test_push_notification: %', SQLERRM;
    RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql;

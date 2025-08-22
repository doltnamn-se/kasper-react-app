-- Create a function to handle new chat message notifications
CREATE OR REPLACE FUNCTION public.handle_new_chat_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    recipient_id uuid;
    sender_name text;
    sender_role text;
    conversation_subject text;
    is_recipient_customer boolean;
BEGIN
    -- Get conversation details
    SELECT 
        CASE 
            WHEN NEW.sender_id = cc.customer_id THEN cc.admin_id
            ELSE cc.customer_id
        END,
        cc.subject
    INTO recipient_id, conversation_subject
    FROM chat_conversations cc
    WHERE cc.id = NEW.conversation_id;
    
    -- Only proceed if there's a recipient
    IF recipient_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Check if recipient is a customer (not admin)
    SELECT EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = recipient_id AND role = 'customer'
    ) INTO is_recipient_customer;
    
    -- Only create notifications for customers
    IF is_recipient_customer THEN
        -- Get sender info
        SELECT p.display_name, p.role::text
        INTO sender_name, sender_role
        FROM profiles p
        WHERE p.id = NEW.sender_id;
        
        -- Create notification for the recipient
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            read
        ) VALUES (
            recipient_id,
            CASE 
                WHEN sender_role = 'super_admin' THEN 'New message from support'
                ELSE 'New chat message'
            END,
            CASE 
                WHEN conversation_subject IS NOT NULL THEN 
                    'New message in "' || conversation_subject || '": ' || LEFT(NEW.message, 100) || 
                    CASE WHEN LENGTH(NEW.message) > 100 THEN '...' ELSE '' END
                ELSE 
                    LEFT(NEW.message, 100) || 
                    CASE WHEN LENGTH(NEW.message) > 100 THEN '...' ELSE '' END
            END,
            'chat_message',
            false
        );
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create trigger for new chat messages
DROP TRIGGER IF EXISTS on_chat_message_created ON chat_messages;
CREATE TRIGGER on_chat_message_created
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_chat_message();

-- Update the existing email notification handler to check user presence
CREATE OR REPLACE FUNCTION public.handle_notification_email()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    user_email TEXT;
    email_notifications BOOLEAN;
    user_is_online BOOLEAN;
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

    -- Check if user is currently online (only for chat messages)
    IF NEW.type = 'chat_message' THEN
        SELECT 
            CASE 
                WHEN up.status = 'online' AND up.last_seen > (now() - interval '5 minutes') 
                THEN true 
                ELSE false 
            END
        INTO user_is_online
        FROM user_presence up
        WHERE up.user_id = NEW.user_id
        ORDER BY up.updated_at DESC
        LIMIT 1;
        
        -- Default to offline if no presence record found
        user_is_online := COALESCE(user_is_online, false);
        
        RAISE LOG 'User online status: %', user_is_online;
        
        -- Skip email for online users with chat messages
        IF user_is_online THEN
            RAISE LOG 'Skipping email for online user: %', user_email;
            email_notifications := false;
        END IF;
    END IF;

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
        RAISE LOG 'Email notifications disabled or user online for user: %', user_email;
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
$function$;
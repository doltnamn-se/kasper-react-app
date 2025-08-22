-- Update the chat message function to trigger email directly without creating in-app notifications
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
    user_email TEXT;
    email_notifications BOOLEAN;
    user_is_online BOOLEAN;
    response JSONB;
    service_role_key TEXT;
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
    
    -- Only send email notifications to customers (not admins)
    IF is_recipient_customer THEN
        -- Get service role key
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
        WHERE u.id = recipient_id;

        -- Check if user is currently online
        SELECT 
            CASE 
                WHEN up.status = 'online' AND up.last_seen > (now() - interval '5 minutes') 
                THEN true 
                ELSE false 
            END
        INTO user_is_online
        FROM user_presence up
        WHERE up.user_id = recipient_id
        ORDER BY up.updated_at DESC
        LIMIT 1;
        
        -- Default to offline if no presence record found
        user_is_online := COALESCE(user_is_online, false);
        
        -- Skip email for online users
        IF user_is_online THEN
            email_notifications := false;
        END IF;

        -- Send email notification if enabled and user is offline
        IF email_notifications THEN
            SELECT net.http_post(
                url := 'https://upfapfohwnkiugvebujh.supabase.co/functions/v1/send-notification-email',
                headers := jsonb_build_object(
                    'Content-Type', 'application/json',
                    'Authorization', 'Bearer ' || service_role_key
                ),
                body := jsonb_build_object(
                    'email', user_email,
                    'title', 'Nytt meddelande',
                    'message', '🔔Du har fått ett nytt meddelande från vår support. Logga in på ditt konto för att se meddelandet.',
                    'type', 'chat_message'
                )
            ) INTO response;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;
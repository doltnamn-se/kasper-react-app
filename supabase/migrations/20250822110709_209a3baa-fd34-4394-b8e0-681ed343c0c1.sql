-- Update the chat message notification function to use Swedish text
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
        
        -- Create notification for the recipient with Swedish text
        INSERT INTO notifications (
            user_id,
            title,
            message,
            type,
            read
        ) VALUES (
            recipient_id,
            'Nytt meddelande',
            '🔔Du har fått ett nytt meddelande från vår support. Logga in på ditt konto för att se meddelandet.',
            'chat_message',
            false
        );
    END IF;
    
    RETURN NEW;
END;
$function$;
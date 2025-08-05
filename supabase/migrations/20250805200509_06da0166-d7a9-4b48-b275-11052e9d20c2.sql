-- Fix remaining security issues: Add SET search_path to all remaining functions
-- This completes the security fixes for all database functions

-- Fix update_app_version function
CREATE OR REPLACE FUNCTION public.update_app_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Skip if the operation is on storage.objects
    IF TG_TABLE_SCHEMA = 'storage' THEN
        RETURN NEW;
    END IF;
    
    -- Increment change count
    UPDATE app_changes 
    SET 
        change_count = change_count + 1,
        patch = CASE 
            WHEN change_count + 1 >= 10 THEN patch + 1
            ELSE patch
        END,
        change_count = CASE 
            WHEN change_count + 1 >= 10 THEN 0
            ELSE change_count + 1
        END,
        last_updated = now()
    WHERE id = (SELECT id FROM app_changes ORDER BY id LIMIT 1);
    
    RETURN NEW;
END;
$function$;

-- Fix can_update_site_status function
CREATE OR REPLACE FUNCTION public.can_update_site_status(user_id uuid, customer_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN user_id = customer_id;
END;
$function$;

-- Fix sync_address_to_profile function
CREATE OR REPLACE FUNCTION public.sync_address_to_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Only proceed if the address has changed
    IF (OLD.address IS DISTINCT FROM NEW.address) THEN
        -- Update the corresponding address in profiles table
        UPDATE public.profiles
        SET address = NEW.address
        WHERE id = NEW.customer_id;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Fix handle_site_selection function
CREATE OR REPLACE FUNCTION public.handle_site_selection()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    site text; -- Declare the loop variable
BEGIN
    -- Only proceed if selected_sites has changed
    IF OLD.selected_sites IS DISTINCT FROM NEW.selected_sites THEN
        -- For each selected site, create a notification if it doesn't exist
        FOREACH site IN ARRAY NEW.selected_sites
        LOOP
            INSERT INTO notifications (user_id, title, message, type)
            SELECT 
                NEW.customer_id,
                'Guide completion needed',
                'Complete the guide for ' || site || ' to hide your information.',
                'guide_completion'
            WHERE NOT EXISTS (
                SELECT 1 FROM notifications 
                WHERE user_id = NEW.customer_id 
                AND type = 'guide_completion' 
                AND message LIKE '%' || site || '%'
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$function$;

-- Fix test_push_notification function
CREATE OR REPLACE FUNCTION public.test_push_notification(user_id uuid, title text, message text, notification_type text DEFAULT 'test'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix refresh_admin_cache function
CREATE OR REPLACE FUNCTION public.refresh_admin_cache()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY admin_cache;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error refreshing admin_cache: %, SQLSTATE: %', SQLERRM, SQLSTATE;
    END;
    RETURN NULL;
END;
$function$;

-- Fix test_notification_trigger function
CREATE OR REPLACE FUNCTION public.test_notification_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    RAISE LOG 'TEST TRIGGER: New notification created with ID: %, Type: %', NEW.id, NEW.type;
    RETURN NEW;
END;
$function$;

-- Fix handle_notification_email function
CREATE OR REPLACE FUNCTION public.handle_notification_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Fix handle_monitoring_url_approval function
CREATE OR REPLACE FUNCTION public.handle_monitoring_url_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If status changed to approved, create an entry in removal_urls
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Create notification for admin
    INSERT INTO notifications (
      user_id, 
      title, 
      message, 
      type, 
      read
    ) 
    SELECT 
      admin_user_id,
      'URL approved by user',
      'A monitoring URL was approved by a user and moved to link management',
      'monitoring_approval',
      false
    FROM monitoring_urls
    WHERE id = NEW.id;
    
    -- Move the URL to the removal_urls table
    INSERT INTO removal_urls (
      customer_id, 
      url, 
      status,
      current_status,
      display_in_incoming
    )
    VALUES (
      NEW.customer_id,
      NEW.url,
      'received',
      'received',
      true
    );
  END IF;
  
  -- Always update the updated_at timestamp
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$function$;

-- Fix update_customer_checklist_progress_updated_at function
CREATE OR REPLACE FUNCTION public.update_customer_checklist_progress_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Fix initialize_customer_checklist_progress function
CREATE OR REPLACE FUNCTION public.initialize_customer_checklist_progress()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO customer_checklist_progress (customer_id)
    VALUES (NEW.id)
    ON CONFLICT (customer_id) DO NOTHING;
    RETURN NEW;
END;
$function$;

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
begin
    new.updated_at = now();
    return new;
end;
$function$;
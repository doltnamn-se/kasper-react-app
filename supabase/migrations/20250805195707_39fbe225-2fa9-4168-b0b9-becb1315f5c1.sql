-- Fix security issue: Add SET search_path to all functions that are missing it
-- This prevents potential SQL injection attacks and resolves security warnings

-- Fix handle_user_deletion function
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    error_message TEXT;
BEGIN
    BEGIN
        -- Log the deletion attempt
        RAISE NOTICE 'Starting deletion process for user: %', OLD.id;
        
        -- Delete in correct order with explicit error handling
        DELETE FROM public.removal_urls 
        WHERE customer_id = OLD.id;
        RAISE NOTICE 'Removed removal_urls for user: %', OLD.id;
        
        DELETE FROM public.hiding_preferences 
        WHERE customer_id = OLD.id;
        RAISE NOTICE 'Removed hiding_preferences for user: %', OLD.id;
        
        DELETE FROM public.notifications 
        WHERE user_id = OLD.id;
        RAISE NOTICE 'Removed notifications for user: %', OLD.id;
        
        DELETE FROM public.notification_preferences 
        WHERE user_id = OLD.id;
        RAISE NOTICE 'Removed notification_preferences for user: %', OLD.id;
        
        DELETE FROM public.customers 
        WHERE id = OLD.id;
        RAISE NOTICE 'Removed customer record for user: %', OLD.id;
        
        DELETE FROM public.profiles 
        WHERE id = OLD.id;
        RAISE NOTICE 'Removed profile for user: %', OLD.id;
        
        RETURN OLD;
    EXCEPTION WHEN OTHERS THEN
        -- Get the error details
        GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
        
        -- Log the error
        RAISE WARNING 'Error in handle_user_deletion for user %: %', OLD.id, error_message;
        
        -- Still return OLD to allow the auth.users deletion to proceed
        RETURN OLD;
    END;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Create profile record with role based on email
    INSERT INTO profiles (id, email, display_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'display_name', new.email),
        CASE 
            WHEN new.email = 'info@doltnamn.se' THEN 'super_admin'::user_role
            ELSE 'customer'::user_role
        END
    );
    
    -- Only create customer record for non-admin users
    IF new.email != 'info@doltnamn.se' THEN
        INSERT INTO customers (
            id,
            onboarding_completed,
            onboarding_step,
            created_at,
            updated_at
        )
        VALUES (
            new.id,
            false,
            1,
            now(),
            now()
        );
        
        -- Create notification preferences for customers only
        INSERT INTO notification_preferences (
            user_id,
            email_notifications,
            in_app_notifications
        )
        VALUES (
            new.id,
            true,
            true
        );

        -- Initialize URL limits based on subscription plan (defaults to 0)
        INSERT INTO user_url_limits (
            customer_id,
            additional_urls
        )
        VALUES (
            new.id,
            0
        );
    END IF;
    
    RETURN new;
EXCEPTION
    WHEN others THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN new;
END;
$function$;

-- Fix handle_customer_created function
CREATE OR REPLACE FUNCTION public.handle_customer_created()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Create profile record
    INSERT INTO profiles (id, email, display_name, role)
    VALUES (
        NEW.id,
        (SELECT email FROM auth.users WHERE id = NEW.id),
        (SELECT raw_user_meta_data->>'display_name' FROM auth.users WHERE id = NEW.id),
        'customer'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$function$;

-- Fix handle_subscription_plan_change function
CREATE OR REPLACE FUNCTION public.handle_subscription_plan_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Only proceed if subscription_plan has changed
    IF OLD.subscription_plan IS DISTINCT FROM NEW.subscription_plan THEN
        -- Insert or update URL limits based on subscription plan
        INSERT INTO user_url_limits (
            customer_id,
            additional_urls
        )
        VALUES (
            NEW.id,
            CASE 
                WHEN NEW.subscription_plan = '1_month' THEN 0
                WHEN NEW.subscription_plan = '3_months' THEN 0  
                WHEN NEW.subscription_plan = '6_months' THEN 0
                WHEN NEW.subscription_plan = '12_months' THEN 999999
                WHEN NEW.subscription_plan = '24_months' THEN 999999
                -- Add unlimited URLs for all new plans
                WHEN NEW.subscription_plan = 'personskydd_1_year' THEN 999999
                WHEN NEW.subscription_plan = 'parskydd_1_year' THEN 999999
                WHEN NEW.subscription_plan = 'familjeskydd_1_year' THEN 999999
                WHEN NEW.subscription_plan = 'personskydd_2_years' THEN 999999
                WHEN NEW.subscription_plan = 'parskydd_2_years' THEN 999999
                WHEN NEW.subscription_plan = 'familjeskydd_2_years' THEN 999999
                ELSE 0
            END
        )
        ON CONFLICT (customer_id) 
        DO UPDATE SET additional_urls = 
            -- Always set to exactly the new plan's value (not keeping higher values)
            CASE 
                WHEN NEW.subscription_plan = '1_month' THEN 0
                WHEN NEW.subscription_plan = '3_months' THEN 0  
                WHEN NEW.subscription_plan = '6_months' THEN 0
                WHEN NEW.subscription_plan = '12_months' THEN 999999
                WHEN NEW.subscription_plan = '24_months' THEN 999999
                -- Add unlimited URLs for all new plans
                WHEN NEW.subscription_plan = 'personskydd_1_year' THEN 999999
                WHEN NEW.subscription_plan = 'parskydd_1_year' THEN 999999
                WHEN NEW.subscription_plan = 'familjeskydd_1_year' THEN 999999
                WHEN NEW.subscription_plan = 'personskydd_2_years' THEN 999999
                WHEN NEW.subscription_plan = 'parskydd_2_years' THEN 999999
                WHEN NEW.subscription_plan = 'familjeskydd_2_years' THEN 999999
                ELSE 0
            END;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Fix is_super_admin function
CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND email = 'info@doltnamn.se'
  );
$function$;

-- Fix is_super_admin(user_id) function
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = user_id 
    AND email = 'info@doltnamn.se'
  );
$function$;

-- Fix get_promotional_codes_with_customers function
CREATE OR REPLACE FUNCTION public.get_promotional_codes_with_customers()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', pc.id,
            'code', pc.code,
            'assigned_to', pc.assigned_to,
            'assigned_at', pc.assigned_at,
            'status', pc.status,
            'created_at', pc.created_at,
            'updated_at', pc.updated_at,
            'notes', pc.notes,
            'customer', CASE 
                WHEN c.id IS NOT NULL THEN json_build_object(
                    'id', c.id,
                    'profile', CASE 
                        WHEN p.id IS NOT NULL THEN json_build_object(
                            'display_name', p.display_name,
                            'email', p.email
                        )
                        ELSE NULL
                    END
                )
                ELSE NULL
            END
        )
    ) INTO result
    FROM promotional_codes pc
    LEFT JOIN customers c ON pc.assigned_to = c.id
    LEFT JOIN profiles p ON c.id = p.id
    ORDER BY pc.created_at DESC;
    
    RETURN COALESCE(result, '[]'::json);
END;
$function$;

-- Fix insert_promotional_codes function
CREATE OR REPLACE FUNCTION public.insert_promotional_codes(codes json)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO promotional_codes (code, status)
    SELECT 
        (code_item->>'code')::text,
        (code_item->>'status')::text
    FROM json_array_elements(codes) AS code_item;
END;
$function$;

-- Fix assign_promotional_code function
CREATE OR REPLACE FUNCTION public.assign_promotional_code(code_id uuid, customer_id uuid, code_value text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Update promotional code
    UPDATE promotional_codes
    SET 
        assigned_to = customer_id,
        assigned_at = now(),
        status = 'assigned',
        updated_at = now()
    WHERE id = code_id;
    
    -- Update customer coupon_code
    UPDATE customers
    SET coupon_code = code_value
    WHERE id = customer_id;
END;
$function$;

-- Fix update_user_password function
CREATE OR REPLACE FUNCTION public.update_user_password(user_id uuid, new_password text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
    salt text;
BEGIN
    -- Generate salt with explicit schema reference
    salt := public.gen_salt('bf'::text);
    
    -- Update the user's password
    UPDATE auth.users 
    SET encrypted_password = public.crypt(new_password, salt)
    WHERE id = user_id;
    
    -- Verify the update
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with ID % not found', user_id;
    END IF;
END;
$function$;

-- Fix refresh_user_roles_cache function
CREATE OR REPLACE FUNCTION public.refresh_user_roles_cache()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_roles_cache;
    RETURN NULL;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error refreshing user_roles_cache: %, SQLSTATE: %', SQLERRM, SQLSTATE;
    RETURN NULL;
END;
$function$;
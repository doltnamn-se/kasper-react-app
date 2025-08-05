-- Update the subscription plan change handler to include unlimited URLs for new plans
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
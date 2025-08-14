-- Update all customers from 24_months plan to personskydd_2_years plan
UPDATE public.customers 
SET subscription_plan = 'personskydd_2_years'
WHERE subscription_plan = '24_months';
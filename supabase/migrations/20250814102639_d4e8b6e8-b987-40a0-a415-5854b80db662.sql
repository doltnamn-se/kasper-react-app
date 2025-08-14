-- Update all customers from 12_months plan to personskydd_1_year plan
UPDATE public.customers 
SET subscription_plan = 'personskydd_1_year'
WHERE subscription_plan = '12_months';
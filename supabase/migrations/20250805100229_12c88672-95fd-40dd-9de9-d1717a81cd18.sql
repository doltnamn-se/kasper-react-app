-- Update URL limits for users who already have the new plans but missed the unlimited URLs
UPDATE user_url_limits 
SET additional_urls = 999999 
WHERE customer_id IN (
  SELECT c.id 
  FROM customers c 
  WHERE c.subscription_plan IN (
    'personskydd_1_year', 
    'parskydd_1_year', 
    'familjeskydd_1_year',
    'personskydd_2_years', 
    'parskydd_2_years', 
    'familjeskydd_2_years'
  )
  AND EXISTS (
    SELECT 1 FROM user_url_limits u 
    WHERE u.customer_id = c.id 
    AND u.additional_urls < 999999
  )
);
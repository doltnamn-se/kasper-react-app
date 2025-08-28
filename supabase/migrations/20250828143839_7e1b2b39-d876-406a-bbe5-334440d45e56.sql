-- Move all removal URLs from user 875a07e3-a101-4369-9483-05b9e9484bcf to user 24a4ff3b-9ab5-4fa4-a7b5-2ef1ca727398
UPDATE removal_urls 
SET customer_id = '24a4ff3b-9ab5-4fa4-a7b5-2ef1ca727398',
    updated_at = now()
WHERE customer_id = '875a07e3-a101-4369-9483-05b9e9484bcf';
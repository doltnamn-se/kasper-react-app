-- First drop the existing unique constraint if it exists
ALTER TABLE customer_site_statuses DROP CONSTRAINT IF EXISTS unique_customer_site;

-- Create a new unique constraint that includes member_id
-- This allows the same customer to have different statuses for main user vs members
ALTER TABLE customer_site_statuses 
ADD CONSTRAINT unique_customer_site_member 
UNIQUE (customer_id, site_name, member_id);
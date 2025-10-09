-- Add admin_user_id column to companies table
ALTER TABLE public.companies 
ADD COLUMN admin_user_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.companies.admin_user_id IS 'The customer ID of the admin user for this company';
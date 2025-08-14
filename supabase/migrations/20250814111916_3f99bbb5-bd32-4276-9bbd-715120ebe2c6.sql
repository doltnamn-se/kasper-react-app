-- Add RLS policies to allow customers to insert their own site statuses
CREATE POLICY "Customers can insert their own site statuses" 
ON public.customer_site_statuses 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- Add RLS policy to allow customers to insert site statuses for their members
CREATE POLICY "Customers can insert site statuses for their members" 
ON public.customer_site_statuses 
FOR INSERT 
WITH CHECK (
  auth.uid() = (
    SELECT cm.customer_id 
    FROM public.customer_members cm 
    WHERE cm.id = member_id
  )
);
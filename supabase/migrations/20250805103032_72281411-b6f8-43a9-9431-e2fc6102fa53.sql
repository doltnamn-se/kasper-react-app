-- Allow users to read promotional codes that are assigned to them
CREATE POLICY "Users can view their assigned promotional codes" 
ON public.promotional_codes 
FOR SELECT 
USING (assigned_to = auth.uid());
-- Add coupon_code column to customers table
ALTER TABLE public.customers 
ADD COLUMN coupon_code TEXT;
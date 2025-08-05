-- Add usage_count field to promotional_codes table
ALTER TABLE public.promotional_codes 
ADD COLUMN usage_count INTEGER NOT NULL DEFAULT 0;
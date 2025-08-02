-- Create subscription pricing table
CREATE TABLE public.subscription_pricing (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan text NOT NULL UNIQUE,
  price_sek integer NOT NULL,
  currency text NOT NULL DEFAULT 'SEK',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_pricing ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to subscription pricing for all users" 
ON public.subscription_pricing 
FOR SELECT 
USING (true);

CREATE POLICY "Allow super_admin to manage subscription pricing" 
ON public.subscription_pricing 
FOR ALL 
USING (is_super_admin());

-- Insert pricing data
INSERT INTO public.subscription_pricing (plan, price_sek) VALUES
('3_months', 297),
('12_months', 594),
('24_months', 784),
('personskydd_1_year', 588),
('parskydd_1_year', 996),
('familjeskydd_1_year', 1488),
('personskydd_2_years', 898),
('parskydd_2_years', 1496),
('familjeskydd_2_years', 2294);

-- Add trigger for updated_at
CREATE TRIGGER update_subscription_pricing_updated_at
BEFORE UPDATE ON public.subscription_pricing
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
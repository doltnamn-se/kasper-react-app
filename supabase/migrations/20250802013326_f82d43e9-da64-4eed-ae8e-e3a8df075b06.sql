-- Add missing subscription pricing data
INSERT INTO public.subscription_pricing (plan, price_sek) VALUES
('1_month', 99),
('6_months', 294);
-- Add new subscription plan values to the existing enum
ALTER TYPE subscription_plan ADD VALUE 'personskydd_1_year';
ALTER TYPE subscription_plan ADD VALUE 'parskydd_1_year';
ALTER TYPE subscription_plan ADD VALUE 'familjeskydd_1_year';
ALTER TYPE subscription_plan ADD VALUE 'personskydd_2_years';
ALTER TYPE subscription_plan ADD VALUE 'parskydd_2_years';
ALTER TYPE subscription_plan ADD VALUE 'familjeskydd_2_years';
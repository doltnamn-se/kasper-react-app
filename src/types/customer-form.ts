import { Database } from "@/integrations/supabase/types";

export type SubscriptionPlan = Database['public']['Enums']['subscription_plan'];
export type CustomerType = 'private' | 'business';

export interface CustomerFormData {
  email: string;
  displayName: string;
  subscriptionPlan: SubscriptionPlan;
  customerType: CustomerType;
  hasAddressAlert: boolean;
  companyId: string | null;
}

export interface CustomerFormFieldsProps {
  email: string;
  displayName: string;
  subscriptionPlan: SubscriptionPlan;
  customerType: CustomerType;
  hasAddressAlert: boolean;
  companyId: string | null;
  onEmailChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onSubscriptionPlanChange: (value: SubscriptionPlan) => void;
  onCustomerTypeChange: (value: CustomerType) => void;
  onHasAddressAlertChange: (value: boolean) => void;
  onCompanyIdChange: (value: string | null) => void;
}

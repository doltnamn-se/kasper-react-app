
export interface CustomerRegistrationData {
  registration_date: string;
  count: number;
}

export interface SubscriptionData {
  plan: string;
  customer_type?: string;
  count: number;
}

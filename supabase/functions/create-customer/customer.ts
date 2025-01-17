export interface CustomerData {
  email: string;
  firstName: string;
  lastName: string;
  subscriptionPlan: "1_month" | "6_months" | "12_months";
}

export const updateProfile = async (supabaseAdmin: any, userId: string, firstName: string, lastName: string) => {
  console.log("Updating user profile");
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      role: 'customer',
    })
    .eq('id', userId);

  if (profileError) {
    console.error("Error updating profile:", profileError);
    throw new Error("Failed to update profile");
  }
  console.log("Profile updated successfully");
};

export const updateCustomerSubscription = async (
  supabaseAdmin: any, 
  userId: string, 
  subscriptionPlan: string,
  createdBy: string
) => {
  console.log("Updating customer subscription plan");
  const { error: customerError } = await supabaseAdmin
    .from('customers')
    .update({
      subscription_plan: subscriptionPlan,
      created_by: createdBy,
    })
    .eq('id', userId);

  if (customerError) {
    console.error("Error updating customer:", customerError);
    throw new Error("Failed to update customer");
  }
  console.log("Customer subscription plan updated successfully");
};
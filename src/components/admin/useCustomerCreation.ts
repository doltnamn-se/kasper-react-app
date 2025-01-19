import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCustomerCreation = (onCustomerCreated: () => void) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    subscriptionPlan: "1_month" as "1_month" | "6_months" | "12_months"
  });

  const resetForm = () => {
    setFormData({
      email: "",
      displayName: "",
      subscriptionPlan: "1_month"
    });
  };

  const handleCreateCustomer = async () => {
    try {
      setIsCreating(true);
      console.log('Starting customer creation process...');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("No authenticated user found");
      }

      // Step 1: Create auth user
      console.log("Creating auth user...");
      const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
        email: formData.email,
        email_confirm: true,
        user_metadata: {
          display_name: formData.displayName
        }
      });

      if (signUpError) {
        console.error("Error creating auth user:", signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      console.log("Auth user created successfully:", authData.user.id);

      // Step 2: Update profile
      console.log("Updating profile...");
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: formData.displayName,
          email: formData.email,
          role: 'customer'
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      // Step 3: Update customer data
      console.log("Updating customer data...");
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          subscription_plan: formData.subscriptionPlan,
          created_by: user.id,
          onboarding_completed: true,
          onboarding_step: 5
        })
        .eq('id', authData.user.id);

      if (customerError) {
        console.error("Error updating customer:", customerError);
        throw customerError;
      }

      toast({
        title: "Success",
        description: "Customer created successfully.",
      });

      resetForm();
      onCustomerCreated();
    } catch (err: any) {
      console.error("Error in customer creation process:", err);
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return {
    formData,
    setFormData,
    isCreating,
    handleCreateCustomer
  };
};
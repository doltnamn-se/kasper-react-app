import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCustomerCreation = (onCustomerCreated: () => void) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    subscriptionPlan: "1_month" as "1_month" | "6_months" | "12_months"
  });

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
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
      console.log("Current user:", user);

      // Send invitation email to the new customer
      const { error: signUpError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (signUpError) {
        console.error("Error sending invitation:", signUpError);
        throw new Error("Failed to send invitation email");
      }

      // Create a temporary profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: formData.email, // Temporary ID until user signs up
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: 'customer'
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw new Error("Failed to create profile");
      }

      // Create customer entry
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          id: formData.email, // Temporary ID until user signs up
          subscription_plan: formData.subscriptionPlan,
          created_by: user.id,
          onboarding_completed: false,
          onboarding_step: 1
        });

      if (customerError) {
        console.error("Error creating customer:", customerError);
        throw new Error("Failed to create customer record");
      }

      console.log("Customer creation completed successfully");
      toast({
        title: "Success",
        description: "Invitation sent successfully. The customer will receive an email to complete their registration.",
      });

      resetForm();
      onCustomerCreated();
    } catch (err: any) {
      console.error("Error in customer creation:", err);
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
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

  const handleCreateCustomer = async () => {
    try {
      setIsCreating(true);
      console.log('Starting customer creation process...');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("No authenticated user found");
      }

      // Generate a UUID for the new user
      const { data: customerId } = await supabase.rpc<string>('gen_random_uuid');
      if (!customerId) {
        console.error("Failed to generate UUID");
        throw new Error("Failed to generate UUID");
      }
      console.log("Generated new customer ID:", customerId);

      // First create the profile
      console.log("Creating profile...");
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: customerId,
          email: formData.email,
          display_name: formData.displayName,
          role: 'customer'
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw new Error("Failed to create profile");
      }

      // Then create the customer record
      console.log("Creating customer record...");
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          id: customerId,
          subscription_plan: formData.subscriptionPlan,
          created_by: user.id,
          onboarding_completed: true,
          onboarding_step: 5
        });

      if (customerError) {
        console.error("Error creating customer:", customerError);
        throw new Error("Failed to create customer");
      }

      console.log("Customer created successfully");
      toast({
        title: "Success",
        description: "Customer created successfully.",
      });

      setFormData({
        email: "",
        displayName: "",
        subscriptionPlan: "1_month"
      });
      
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
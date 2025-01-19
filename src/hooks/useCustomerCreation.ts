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

      // Generate a random password
      const password = Math.random().toString(36).slice(-12);
      
      // Step 1: Create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: password,
        email_confirm: true
      });

      if (authError) {
        console.error("Error creating auth user:", authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error("No user data returned");
      }

      console.log("Auth user created successfully");

      // Step 2: Update the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          display_name: formData.displayName,
          email: formData.email
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
      }

      console.log("Profile updated successfully");

      // Step 3: Update the customer subscription
      const { error: customerError } = await supabase
        .from('customers')
        .update({ 
          subscription_plan: formData.subscriptionPlan,
        })
        .eq('id', authData.user.id);

      if (customerError) {
        console.error("Error updating customer:", customerError);
        throw customerError;
      }

      console.log("Customer updated successfully");

      toast({
        title: "Success",
        description: "Customer created successfully. They will receive an email with login instructions.",
      });

      // Reset form and trigger refresh
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
        description: err.message || "Failed to create customer. Please try again.",
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
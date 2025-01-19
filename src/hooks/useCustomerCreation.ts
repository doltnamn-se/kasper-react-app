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

      // Log the request payload for debugging
      const requestPayload = {
        email: formData.email,
        displayName: formData.displayName,
        subscriptionPlan: formData.subscriptionPlan,
        createdBy: user.id
      };
      console.log("Sending create customer request with payload:", requestPayload);

      const { data: createData, error: createError } = await supabase.functions.invoke('create-customer', {
        body: requestPayload
      });

      if (createError) {
        console.error("Error in customer creation:", createError);
        throw createError;
      }

      console.log("Customer created successfully:", createData);
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
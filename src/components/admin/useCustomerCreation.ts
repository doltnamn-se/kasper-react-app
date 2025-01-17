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

      const functionResponse = await supabase.functions.invoke('create-customer', {
        body: { 
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          subscriptionPlan: formData.subscriptionPlan,
          createdBy: user.id 
        }
      });

      console.log("Function response:", functionResponse);

      if (functionResponse.error) {
        console.error("Error response from create-customer function:", functionResponse.error);
        throw new Error(functionResponse.error.message || "Failed to create customer");
      }

      if (!functionResponse.data) {
        console.error("No data returned from create-customer function");
        throw new Error("No response from server");
      }

      console.log("Customer created successfully:", functionResponse.data);
      toast({
        title: "Success",
        description: "Customer created successfully and activation email sent.",
      });

      resetForm();
      onCustomerCreated();
    } catch (err: any) {
      console.error("Detailed error in customer creation:", err);
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
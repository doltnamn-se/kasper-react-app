import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCustomerCreation = (onCustomerCreated: () => void) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    subscriptionPlan: "1_month" as "1_month" | "6_months" | "12_months",
    customerType: "private" as "private" | "business",
    hasAddressAlert: false
  });

  const resetForm = () => {
    setFormData({
      email: "",
      displayName: "",
      subscriptionPlan: "1_month",
      customerType: "private",
      hasAddressAlert: false
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

      // Generate a random password
      const generatedPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      console.log("Generated password for new user");

      // Step 1: Create customer
      console.log("Step 1: Creating customer...");
      const { data: createData, error: createError } = await supabase.functions.invoke('create-customer', {
        body: {
          email: formData.email,
          displayName: formData.displayName,
          subscriptionPlan: formData.subscriptionPlan,
          customerType: formData.customerType,
          hasAddressAlert: formData.hasAddressAlert,
          createdBy: user.id,
          password: generatedPassword
        }
      });

      if (createError) {
        console.error("Error in customer creation:", createError);
        throw createError;
      }

      console.log("Customer created successfully:", createData);

      // Step 2: Send welcome email with credentials
      console.log("Step 2: Sending welcome email...");
      const { error: emailError } = await supabase.functions.invoke('send-activation-email', {
        body: {
          email: formData.email,
          displayName: formData.displayName,
          password: generatedPassword
        }
      });

      if (emailError) {
        console.error("Error sending welcome email:", emailError);
        toast({
          title: "Partial Success",
          description: "Customer created but welcome email could not be sent. Please try resending the email later.",
          variant: "default",
        });
      } else {
        toast({
          title: "Success",
          description: "Customer created successfully and welcome email sent with login credentials.",
        });
      }

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
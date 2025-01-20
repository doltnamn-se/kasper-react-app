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
      console.log('Starting customer creation process with data:', formData);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("No authenticated user found");
      }

      // Generate a random password
      const generatedPassword = Math.random().toString(36).slice(-8);
      console.log("Generated password for new user:", generatedPassword);

      // Step 1: Create auth user with admin privileges
      console.log("Creating auth user...");
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: {
          display_name: formData.displayName
        }
      });

      if (createError) {
        console.error("Error creating auth user:", createError);
        throw createError;
      }

      if (!createData.user) {
        console.error("No user data returned");
        throw new Error("Failed to create user");
      }

      console.log("Auth user created successfully:", createData.user);

      // Step 2: Update customer subscription plan
      console.log("Updating customer subscription plan...");
      const { error: updateError } = await supabase
        .from('customers')
        .update({ subscription_plan: formData.subscriptionPlan })
        .eq('id', createData.user.id);

      if (updateError) {
        console.error("Error updating subscription plan:", updateError);
        // Don't throw here, as the user is already created
        toast({
          title: "Partial Success",
          description: "Customer created but subscription plan could not be updated.",
          variant: "default",
        });
      }

      // Step 3: Send welcome email with credentials
      console.log("Sending welcome email...");
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
          description: "Customer created but welcome email could not be sent.",
          variant: "default",
        });
      }

      console.log("Customer creation process completed successfully");
      toast({
        title: "Success",
        description: "Customer created successfully. They will receive login credentials via email.",
      });

      resetForm();
      onCustomerCreated();
    } catch (err: any) {
      console.error("Error in customer creation process:", err);
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred while creating the customer.",
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
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
      console.log('Starting customer creation process - Step 1: Create Auth User');

      // Step 1: Create the auth user
      const generatedPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: generatedPassword,
        email_confirm: true
      });

      if (authError || !authData.user) {
        console.error("Step 1 Error - Auth user creation failed:", authError);
        throw authError || new Error("Failed to create user");
      }

      const userId = authData.user.id;
      console.log("Step 1 Complete - Auth user created:", userId);

      // Step 2: Update profile
      console.log('Step 2: Updating profile');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          display_name: formData.displayName,
          email: formData.email 
        })
        .eq('id', userId);

      if (profileError) {
        console.error("Step 2 Error - Profile update failed:", profileError);
        throw profileError;
      }

      console.log("Step 2 Complete - Profile updated");

      // Step 3: Update customer subscription
      console.log('Step 3: Updating customer subscription');
      const { error: customerError } = await supabase
        .from('customers')
        .update({ subscription_plan: formData.subscriptionPlan })
        .eq('id', userId);

      if (customerError) {
        console.error("Step 3 Error - Customer update failed:", customerError);
        throw customerError;
      }

      console.log("Step 3 Complete - Customer subscription updated");

      // Step 4: Send welcome email
      console.log('Step 4: Sending welcome email');
      const { error: emailError } = await supabase.functions.invoke('send-activation-email', {
        body: {
          email: formData.email,
          displayName: formData.displayName,
          password: generatedPassword
        }
      });

      if (emailError) {
        console.error("Step 4 Warning - Email sending failed:", emailError);
        toast({
          title: "Partial Success",
          description: "Customer created but welcome email could not be sent. Please try resending the email later.",
          variant: "default",
        });
      } else {
        toast({
          title: "Success",
          description: "Customer created successfully and welcome email sent.",
        });
      }

      // Reset form and notify parent
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
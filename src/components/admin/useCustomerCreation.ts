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
      console.log('Creating new customer...', formData);

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        email_confirm: true,
        password: Math.random().toString(36).slice(-8),
      });

      if (authError) {
        console.error("Error creating auth user:", authError);
        toast({
          title: "Error",
          description: "Failed to create customer. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        console.error("No user data returned");
        return;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: 'customer',
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        toast({
          title: "Error",
          description: "Failed to update customer profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const { error: customerError } = await supabase
        .from('customers')
        .update({
          subscription_plan: formData.subscriptionPlan,
        })
        .eq('id', authData.user.id);

      if (customerError) {
        console.error("Error updating customer subscription plan:", customerError);
        toast({
          title: "Error",
          description: "Failed to update customer subscription plan. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Send activation email
      const response = await fetch('/functions/v1/send-activation-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          customerId: authData.user.id,
          email: formData.email,
          firstName: formData.firstName,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error sending activation email:", error);
        toast({
          title: "Warning",
          description: "Customer created but activation email could not be sent.",
          variant: "destructive",
        });
      }

      toast({
        title: "Success",
        description: "Customer created successfully and activation email sent.",
      });

      resetForm();
      onCustomerCreated();
    } catch (err) {
      console.error("Error in customer creation:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
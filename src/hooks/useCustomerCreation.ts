
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CustomerFormData } from "@/types/customer-form";

export const useCustomerCreation = (onCustomerCreated: () => void) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    email: "",
    displayName: "",
    subscriptionPlan: "3_months", // Updated default to 3_months
    customerType: "private",
    hasAddressAlert: true
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const resetForm = () => {
    setFormData({
      email: "",
      displayName: "",
      subscriptionPlan: "3_months", // Update here as well
      customerType: "private",
      hasAddressAlert: true
    });
  };

  const handleCreateCustomer = async (sendEmail: boolean = true) => {
    try {
      setIsCreating(true);
      console.log('Starting customer creation process with data:', formData);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        throw new Error("No authenticated user found");
      }

      const generatedPassword = generatePassword();
      console.log("Generated password for new user:", generatedPassword);

      console.log("Creating customer...");
      console.log("Request body:", {
        ...formData,
        createdBy: user.id,
        password: generatedPassword
      });
      
      const { data: createData, error: createError } = await supabase.functions.invoke('create-customer', {
        body: {
          ...formData,
          createdBy: user.id,
          password: generatedPassword
        }
      });
      
      console.log("Response data:", createData);
      console.log("Response error:", createError);

      if (createError) {
        console.error("Error in customer creation:", createError);
        throw createError;
      }

      console.log("Customer created successfully:", createData);

      if (sendEmail) {
        console.log("Sending welcome email using NEW function...");
        const { error: emailError } = await supabase.functions.invoke('send-activation-email-new', {
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
          console.log("Welcome email sent successfully");
          toast({
            title: "Success",
            description: "Customer created successfully and welcome email sent with login credentials.",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Customer created successfully without sending welcome email.",
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

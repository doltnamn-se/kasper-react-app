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

      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        email_confirm: true,
        password: Math.random().toString(36).slice(-8)
      });

      if (authError) {
        console.error("Error creating auth user:", authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // 2. Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          role: 'customer'
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw new Error("Failed to update profile");
      }

      // 3. Update customer data
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          subscription_plan: formData.subscriptionPlan,
          created_by: user.id
        })
        .eq('id', authData.user.id);

      if (customerError) {
        console.error("Error updating customer:", customerError);
        throw new Error("Failed to update customer");
      }

      // 4. Generate magic link
      const { data: magicLinkData, error: magicLinkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: formData.email,
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        }
      });

      if (magicLinkError) {
        console.error("Error generating magic link:", magicLinkError);
        throw new Error("Failed to generate activation link");
      }

      // 5. Send activation email using Resend
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Doltnamn <no-reply@doltnamn.se>",
          to: [formData.email],
          subject: "Activate Your Doltnamn Account",
          html: `
            <div>
              <h1>Welcome to Doltnamn, ${formData.firstName}!</h1>
              <p>Your account has been created. Click the button below to set up your password and complete your onboarding:</p>
              <a href="${magicLinkData.properties.action_link}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
                Activate Account
              </a>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p>${magicLinkData.properties.action_link}</p>
            </div>
          `,
        }),
      });

      if (!resendResponse.ok) {
        console.error("Error sending activation email:", await resendResponse.text());
      }

      console.log("Customer creation completed successfully");
      toast({
        title: "Success",
        description: "Customer created successfully and activation email sent.",
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
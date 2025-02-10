
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generatePassword } from "@/utils/passwordGenerator";
import { toast } from "sonner";

export const useCustomerActions = (customerId: string | undefined, onClose: () => void) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateUrlLimits = async (additionalUrls: string) => {
    if (!customerId) return;
    
    try {
      setIsUpdating(true);
      const numericValue = parseInt(additionalUrls);
      
      if (isNaN(numericValue)) {
        toast.error("Please enter a valid number", {
          description: "The URL limit must be a number"
        });
        return;
      }

      const { error } = await supabase
        .from('user_url_limits')
        .update({ additional_urls: numericValue })
        .eq('customer_id', customerId);

      if (error) throw error;

      toast.success("Success", {
        description: "URL limits updated successfully"
      });
      
      return true;
    } catch (error) {
      console.error("Error updating URL limits:", error);
      toast.error("Error", {
        description: "Failed to update URL limits"
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendActivationEmail = async (email: string, displayName: string) => {
    if (!customerId) return;
    
    try {
      setIsSendingEmail(true);
      const generatedPassword = generatePassword();
      console.log("Attempting to update password for user:", customerId);
      
      const { error: passwordError } = await supabase.rpc('update_user_password', {
        user_id: customerId,
        new_password: generatedPassword
      });

      if (passwordError) {
        console.error("Error updating password:", passwordError);
        throw passwordError;
      }

      console.log("Password updated successfully, sending activation email");

      const { error: emailError } = await supabase.functions.invoke('send-activation-email', {
        body: {
          email,
          displayName,
          password: generatedPassword
        }
      });

      if (emailError) {
        console.error("Error sending activation email:", emailError);
        throw emailError;
      }

      toast.success("Success", {
        description: "Activation email sent successfully"
      });
    } catch (error) {
      console.error("Error in handleResendActivationEmail:", error);
      toast.error("Error", {
        description: "Failed to send activation email"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!customerId) return;
    
    try {
      setIsDeleting(true);
      const { error } = await supabase.auth.admin.deleteUser(customerId);
      
      if (error) throw error;
      
      toast.success("Success", {
        description: "User deleted successfully"
      });
      onClose();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error", {
        description: "Failed to delete user"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isUpdating,
    isSendingEmail,
    isDeleting,
    handleUpdateUrlLimits,
    handleResendActivationEmail,
    handleDeleteUser
  };
};

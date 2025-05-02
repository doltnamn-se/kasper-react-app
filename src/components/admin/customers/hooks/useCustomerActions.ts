
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type SubscriptionPlan = "1_month" | "3_months" | "6_months" | "12_months" | "24_months" | "none";

export const useCustomerActions = (customerId: string, onSuccess?: () => void) => {
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [isBanning, setIsBanning] = useState(false);

  const handleResendActivationEmail = async (email?: string, displayName?: string) => {
    if (!email || !displayName) {
      toast.error(t('errors.missing_data'), {
        description: t('errors.missing_email_or_name')
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('send-activation-email', {
        body: { email, displayName },
      });

      if (error) throw error;

      toast.success(t('success.email_sent'), {
        description: t('success.activation_email_sent')
      });
    } catch (error) {
      console.error('Error sending activation email:', error);
      toast.error(t('errors.email_failed'), {
        description: t('errors.activation_email_failed')
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleUpdateSubscriptionPlan = async (plan: string) => {
    setIsUpdatingSubscription(true);
    try {
      // Convert 'none' to null, otherwise keep the plan value
      const subscriptionValue = plan === 'none' ? null : plan as Exclude<SubscriptionPlan, 'none'> | null;
      
      const { error } = await supabase
        .from('customers')
        .update({ subscription_plan: subscriptionValue })
        .eq('id', customerId);

      if (error) throw error;

      console.log("Subscription updated successfully to:", plan);
      return true;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      toast.error(t('errors.update_failed'), {
        description: t('errors.subscription_update_failed')
      });
      return false;
    } finally {
      setIsUpdatingSubscription(false);
    }
  };

  const handleToggleBan = async (currentlyBanned: boolean) => {
    if (!customerId) return false;
    
    setIsBanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('toggle-user-ban', {
        body: { 
          userId: customerId,
          ban: !currentlyBanned
        }
      });

      if (error) throw error;

      toast.success(!currentlyBanned ? t('success.user_banned') : t('success.user_unbanned'), {
        description: !currentlyBanned 
          ? t('success.user_banned_description') 
          : t('success.user_unbanned_description')
      });

      return {
        success: true,
        banned: data?.banned
      };
    } catch (error) {
      console.error('Error toggling user ban status:', error);
      toast.error(t('errors.ban_failed'), {
        description: !currentlyBanned 
          ? t('errors.ban_failed_description') 
          : t('errors.unban_failed_description')
      });
      return {
        success: false,
        banned: currentlyBanned
      };
    } finally {
      setIsBanning(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: customerId },
      });

      if (error) throw error;

      toast.success(t('success.deleted'), {
        description: t('success.user_deleted')
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('errors.delete_failed'), {
        description: t('errors.user_delete_failed')
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isUpdating,
    isSendingEmail,
    isDeleting,
    isUpdatingSubscription,
    isBanning,
    handleResendActivationEmail,
    handleUpdateSubscriptionPlan,
    handleDeleteUser,
    handleToggleBan
  };
};

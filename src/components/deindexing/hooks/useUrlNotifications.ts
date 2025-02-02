import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

export const useUrlNotifications = () => {
  const { t } = useLanguage();

  const createStatusNotification = async (customerId: string, newStatus: string) => {
    console.log('Creating status notification:', { customerId, newStatus });
    
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: customerId,
        title: t('notifications.url.status.title'),
        message: t('notifications.url.status.message', { status: newStatus }),
        type: 'removal',
        read: false
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      toast({
        title: t('error'),
        description: t('error.update.status'),
        variant: "destructive",
      });
      throw notificationError;
    }
  };

  const showSuccessToast = () => {
    toast({
      title: t('success'),
      description: t('success.update.status'),
    });
  };

  const showErrorToast = () => {
    toast({
      title: t('error'),
      description: t('error.unexpected'),
      variant: "destructive",
    });
  };

  return {
    createStatusNotification,
    showSuccessToast,
    showErrorToast
  };
};
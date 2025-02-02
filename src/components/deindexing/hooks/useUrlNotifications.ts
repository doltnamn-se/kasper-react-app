import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

export const useUrlNotifications = () => {
  const { t } = useLanguage();

  const createStatusNotification = async (customerId: string) => {
    console.log('useUrlNotifications - Creating status notification:', { 
      customerId
    });
    
    try {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: customerId,
          title: t('notifications.url.status.title'),
          message: t('notifications.url.status.message'),
          type: 'removal',
          read: false
        });

      if (notificationError) {
        console.error('useUrlNotifications - Error creating notification:', notificationError);
        throw notificationError;
      }
      
      console.log('useUrlNotifications - Notification created successfully');
    } catch (error) {
      console.error('useUrlNotifications - Error in createStatusNotification:', error);
      toast({
        title: t('error'),
        description: t('error.update.status'),
        variant: "destructive",
      });
      throw error;
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

import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";

export const useUrlNotifications = () => {
  const { t, language } = useLanguage();

  const createStatusNotification = async (customerId: string, title: string, message: string) => {
    console.log('useUrlNotifications - Creating status notification:', { 
      customerId,
      currentLanguage: language,
      translatedTitle: title,
      translatedMessage: message,
      type: 'removal' // Explicitly log the type
    });
    
    try {
      const { data, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: customerId,
          title: title,
          message: message,
          type: 'removal',
          read: false
        })
        .select()
        .single();

      if (notificationError) {
        console.error('useUrlNotifications - Error creating notification:', notificationError);
        throw notificationError;
      }
      
      console.log('useUrlNotifications - Notification created successfully:', data);
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

  const showErrorToast = () => {
    toast({
      title: t('error'),
      description: t('error.unexpected'),
      variant: "destructive",
    });
  };

  return {
    createStatusNotification,
    showErrorToast
  };
};

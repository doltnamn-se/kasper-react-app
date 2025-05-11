
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export const useUrlNotifications = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const createStatusNotification = async (customerId: string, title: string, message: string, type: string = 'removal') => {
    console.log('useUrlNotifications - Creating status notification:', { 
      customerId,
      currentLanguage: language,
      translatedTitle: title,
      translatedMessage: message,
      type: type // Log the notification type
    });
    
    try {
      // Create in-app notification - the database trigger will handle email sending without rate limiting
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: customerId,
          title: title,
          message: message,
          type: type, // Use the provided type parameter
          read: false
        })
        .select()
        .single();

      if (error) {
        console.error('useUrlNotifications - Error creating notification:', error);
        return { error };
      }
      
      console.log('useUrlNotifications - Notification created successfully:', data);
      return { data };
    } catch (error) {
      console.error('useUrlNotifications - Error in createStatusNotification:', error);
      toast({
        title: t('error'),
        description: t('error.update.status'),
        variant: "destructive",
      });
      return { error };
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

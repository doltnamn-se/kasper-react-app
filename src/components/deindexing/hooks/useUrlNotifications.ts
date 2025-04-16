
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

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
      // First check if the user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', customerId)
        .single();
        
      if (userError) {
        console.error('useUrlNotifications - Error checking user:', userError);
        throw userError;
      }
      
      if (!userData) {
        console.error('useUrlNotifications - User not found:', customerId);
        throw new Error('User not found');
      }
      
      console.log('useUrlNotifications - User verified:', userData.id);
      
      // Create the notification
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
      return data;
    } catch (error) {
      console.error('useUrlNotifications - Error in createStatusNotification:', error);
      toast.error(t('error'), {
        description: t('error.update.status'),
      });
      throw error;
    }
  };

  const showErrorToast = () => {
    toast.error(t('error'), {
      description: t('error.unexpected'),
    });
  };

  return {
    createStatusNotification,
    showErrorToast
  };
};

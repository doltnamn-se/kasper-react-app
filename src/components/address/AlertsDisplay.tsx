
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AlertsDisplay = () => {
  const { language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const checkForDuplicateNotifications = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Get recent notifications
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('type', 'address_alert')
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('Recent address alert notifications:', notifications);

      // If we have duplicate notifications, keep only the most recent one
      if (notifications && notifications.length > 1) {
        console.log('Found duplicate address alert notifications, cleaning up...');
        
        // Keep the most recent notification
        const [mostRecent, ...duplicates] = notifications;
        
        // Delete duplicate notifications
        const { error } = await supabase
          .from('notifications')
          .delete()
          .in('id', duplicates.map(n => n.id));

        if (error) {
          console.error('Error cleaning up duplicate notifications:', error);
          toast({
            title: language === 'sv' ? 'Ett fel uppstod' : 'An error occurred',
            description: language === 'sv' 
              ? 'Kunde inte ta bort duplicerade notifieringar' 
              : 'Could not remove duplicate notifications',
            variant: "destructive"
          });
        } else {
          console.log('Successfully cleaned up duplicate notifications');
        }
      }
    };

    checkForDuplicateNotifications();
  }, [language, toast]);

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <h2 className="text-[18px] font-semibold mb-6 text-[#000000] dark:text-[#FFFFFF]">
        {language === 'sv' ? 'Larm' : 'Alarm'}
      </h2>
      <p className="text-[#000000A6] dark:text-[#FFFFFFA6] text-sm font-medium">
        {language === 'sv'
          ? 'Det finns inga tidigare larm rörande din adress'
          : 'There are no previous alarms regarding your address'
        }
      </p>
    </div>
  );
};

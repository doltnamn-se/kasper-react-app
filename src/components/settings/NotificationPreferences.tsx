import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const NotificationPreferences = () => {
  const { t } = useLanguage();

  const { data: notificationPrefs, refetch: refetchPrefs } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: async () => {
      console.log('Fetching notification preferences...');
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching notification preferences:', error);
        throw error;
      }

      console.log('Notification preferences:', data);
      return data;
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async ({ 
      emailNotifications, 
      inAppNotifications 
    }: { 
      emailNotifications: boolean; 
      inAppNotifications: boolean; 
    }) => {
      console.log('Updating notification preferences:', { emailNotifications, inAppNotifications });
      const { data, error } = await supabase
        .from('notification_preferences')
        .update({
          email_notifications: emailNotifications,
          in_app_notifications: inAppNotifications,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification preferences:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: t('settings.success'),
        description: t('settings.notifications.updated'),
      });
      refetchPrefs();
    },
    onError: (error) => {
      console.error('Error in updatePreferences mutation:', error);
      toast({
        title: t('error.title'),
        description: t('error.update.preferences'),
        variant: 'destructive',
      });
    },
  });

  const handleNotificationPreferenceChange = (type: 'email' | 'inApp', value: boolean) => {
    if (!notificationPrefs) return;

    updatePreferences.mutate({
      emailNotifications: type === 'email' ? value : notificationPrefs.email_notifications,
      inAppNotifications: type === 'inApp' ? value : notificationPrefs.in_app_notifications,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm text-[#000000] dark:text-[#FFFFFF]">
            {t('settings.email.notifications')}
          </label>
          <p className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('settings.email.notifications.description')}
          </p>
        </div>
        <Switch
          checked={notificationPrefs?.email_notifications ?? false}
          onCheckedChange={(checked) => handleNotificationPreferenceChange('email', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm text-[#000000] dark:text-[#FFFFFF]">
            {t('settings.inapp.notifications')}
          </label>
          <p className="text-sm text-[#000000A6] dark:text-[#FFFFFFA6]">
            {t('settings.inapp.notifications.description')}
          </p>
        </div>
        <Switch
          checked={notificationPrefs?.in_app_notifications ?? false}
          onCheckedChange={(checked) => handleNotificationPreferenceChange('inApp', checked)}
        />
      </div>
    </div>
  );
};
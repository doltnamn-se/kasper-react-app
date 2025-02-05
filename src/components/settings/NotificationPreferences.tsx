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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found, cannot fetch preferences');
        throw new Error('No user found');
      }

      // First try to get existing preferences
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching notification preferences:', error);
        throw error;
      }

      // If no preferences exist, create default ones
      if (!data) {
        console.log('No preferences found, creating defaults...');
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            email_notifications: true,
            in_app_notifications: true,
            email_monitoring: true,
            email_deindexing: true,
            email_address_alerts: true,
            email_news: true
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default preferences:', insertError);
          throw insertError;
        }

        console.log('Created default preferences:', newPrefs);
        return newPrefs;
      }

      console.log('Notification preferences:', data);
      return data;
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (preferences: {
      emailNotifications?: boolean;
      inAppNotifications?: boolean;
      emailMonitoring?: boolean;
      emailDeindexing?: boolean;
      emailAddressAlerts?: boolean;
      emailNews?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      console.log('Updating notification preferences:', preferences);
      const { data, error } = await supabase
        .from('notification_preferences')
        .update({
          email_notifications: preferences.emailNotifications,
          in_app_notifications: true, // Always keep in-app notifications on
          email_monitoring: preferences.emailMonitoring,
          email_deindexing: preferences.emailDeindexing,
          email_address_alerts: preferences.emailAddressAlerts,
          email_news: preferences.emailNews,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
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

  const handleMainEmailToggle = (checked: boolean) => {
    if (!notificationPrefs) return;

    updatePreferences.mutate({
      emailNotifications: checked,
      emailMonitoring: checked,
      emailDeindexing: checked,
      emailAddressAlerts: checked,
      emailNews: checked,
    });
  };

  const handleSubPreferenceChange = (type: string, checked: boolean) => {
    if (!notificationPrefs) return;

    const updates: any = {
      emailNotifications: notificationPrefs.email_notifications,
    };

    switch (type) {
      case 'monitoring':
        updates.emailMonitoring = checked;
        break;
      case 'deindexing':
        updates.emailDeindexing = checked;
        break;
      case 'addressAlerts':
        updates.emailAddressAlerts = checked;
        break;
      case 'news':
        updates.emailNews = checked;
        break;
    }

    updatePreferences.mutate(updates);
  };

  return (
    <div className="space-y-6">
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
          checked={true}
          disabled={true}
          className="cursor-not-allowed"
        />
      </div>

      <div className="space-y-4">
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
            onCheckedChange={handleMainEmailToggle}
          />
        </div>

        {notificationPrefs?.email_notifications && (
          <div className="ml-4 space-y-4 border-l-2 border-gray-200 pl-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                {t('settings.email.monitoring')}
              </label>
              <Switch
                checked={notificationPrefs?.email_monitoring ?? false}
                onCheckedChange={(checked) => handleSubPreferenceChange('monitoring', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                {t('settings.email.deindexing')}
              </label>
              <Switch
                checked={notificationPrefs?.email_deindexing ?? false}
                onCheckedChange={(checked) => handleSubPreferenceChange('deindexing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                {t('settings.email.address.alerts')}
              </label>
              <Switch
                checked={notificationPrefs?.email_address_alerts ?? false}
                onCheckedChange={(checked) => handleSubPreferenceChange('addressAlerts', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                {t('settings.email.news')}
              </label>
              <Switch
                checked={notificationPrefs?.email_news ?? false}
                onCheckedChange={(checked) => handleSubPreferenceChange('news', checked)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
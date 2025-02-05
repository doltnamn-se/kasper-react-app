
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InAppPreferences } from "./notification-preferences/InAppPreferences";
import { EmailPreferences } from "./notification-preferences/EmailPreferences";

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

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching notification preferences:', error);
        throw error;
      }

      if (!data) {
        console.log('No preferences found, creating defaults...');
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            email_notifications: true,
            in_app_notifications: true
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

      console.log('Fetched notification preferences:', data);
      return data;
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (preferences: {
      emailNotifications?: boolean;
      inAppNotifications?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      console.log('Updating notification preferences:', preferences);
      const { data, error } = await supabase
        .from('notification_preferences')
        .update({
          email_notifications: preferences.emailNotifications,
          in_app_notifications: preferences.inAppNotifications ?? notificationPrefs?.in_app_notifications,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating notification preferences:', error);
        throw error;
      }

      console.log('Successfully updated preferences:', data);
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

    console.log('Handling main email toggle:', checked);
    updatePreferences.mutate({
      emailNotifications: checked
    });
  };

  return (
    <div className="space-y-6">
      <InAppPreferences />
      <EmailPreferences
        emailNotifications={notificationPrefs?.email_notifications ?? false}
        onMainToggle={handleMainEmailToggle}
      />
    </div>
  );
};

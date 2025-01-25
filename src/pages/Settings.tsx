import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation } from "@tanstack/react-query";

const Settings = () => {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notification preferences
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

  // Update notification preferences mutation
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

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setIsLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log("Auth state changed:", event);
      if (event === 'USER_UPDATED') {
        toast({
          title: t('settings.success'),
          description: t('settings.password.updated'),
        });
        resetForm();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [t]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError(t('error.passwords.dont.match'));
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError(t('error.password.too.short'));
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting to update password...");
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) {
        console.error("Error updating password:", error);
        setError(error.message);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error in password update:", err);
      setError(t('error.generic'));
      setIsLoading(false);
    }
  };

  const handleNotificationPreferenceChange = (type: 'email' | 'inApp', value: boolean) => {
    if (!notificationPrefs) return;

    updatePreferences.mutate({
      emailNotifications: type === 'email' ? value : notificationPrefs.email_notifications,
      inAppNotifications: type === 'inApp' ? value : notificationPrefs.in_app_notifications,
    });
  };

  return (
    <MainLayout>
      <div className="max-w-md space-y-8">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('profile.settings')}
        </h1>

        {/* Notification Preferences Section */}
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
          <h2 className="text-xl font-semibold mb-6 dark:text-white">
            {t('settings.notification.preferences')}
          </h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.email.notifications')}
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.inapp.notifications')}
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('settings.inapp.notifications.description')}
                </p>
              </div>
              <Switch
                checked={notificationPrefs?.in_app_notifications ?? false}
                onCheckedChange={(checked) => handleNotificationPreferenceChange('inApp', checked)}
              />
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
          <h2 className="text-xl font-semibold mb-6 dark:text-white">
            {t('settings.change.password')}
          </h2>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.current.password')}
              </label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full h-12"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.new.password')}
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('settings.confirm.password')}
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12"
                disabled={isLoading}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-black hover:bg-black/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? t('settings.updating.password') : t('settings.update.password')}
            </Button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
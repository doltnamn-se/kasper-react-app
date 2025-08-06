
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationPreferences } from "@/components/settings/NotificationPreferences";
import { PasswordChange } from "@/components/settings/PasswordChange";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Settings = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Inställningar | Kasper" : 
      "Settings | Kasper";
  }, [language]);

  useEffect(() => {
    // Check if there's a default tab in the location state
    const state = location.state as { defaultTab?: string };
    if (state?.defaultTab) {
      setActiveTab(state.defaultTab);
    }
  }, [location]);

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="mb-6">
          {t('profile.settings')}
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="profile" className="flex-1">{t('profile.manage')}</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">{t('notifications')}</TabsTrigger>
            <TabsTrigger value="password" className="flex-1">{t('password')}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm dark:border dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {t('profile.manage')}
              </h2>
              <ProfileSettings />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm dark:border dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {t('settings.notification.preferences')}
              </h2>
              <NotificationPreferences />
            </div>
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm dark:border dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {t('settings.change.password')}
              </h2>
              <PasswordChange />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;

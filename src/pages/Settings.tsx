
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationPreferences } from "@/components/settings/NotificationPreferences";
import { PasswordChange } from "@/components/settings/PasswordChange";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Settings = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Inställningar | Digitaltskydd.se" : 
      "Settings | Digitaltskydd.se";
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
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('profile.settings')}
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="profile" className="flex-1">{t('profile.manage')}</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">{t('notifications')}</TabsTrigger>
            <TabsTrigger value="password" className="flex-1">{t('password')}</TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1">{language === 'sv' ? 'Utseende' : 'Appearance'}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {t('profile.manage')}
              </h2>
              <ProfileSettings />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {t('settings.notification.preferences')}
              </h2>
              <NotificationPreferences />
            </div>
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {t('settings.change.password')}
              </h2>
              <PasswordChange />
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {language === 'sv' ? 'Utseende' : 'Appearance'}
              </h2>
              <AppearanceSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;

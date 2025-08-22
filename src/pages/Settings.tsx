
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationPreferences } from "@/components/settings/NotificationPreferences";
import { PasswordChange } from "@/components/settings/PasswordChange";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SoundSettings } from "@/components/settings/SoundSettings";
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
          <TabsList className="relative w-full overflow-hidden">
            <div
              className={`pointer-events-none absolute top-1 bottom-1 left-1 rounded-[12px] bg-[#d4f5b6] w-[calc((100%-0.5rem)/3)] transition-transform duration-300 ease-out will-change-transform ${activeTab === 'profile' ? 'translate-x-0' : activeTab === 'notifications' ? 'translate-x-full' : 'translate-x-[200%]'}`}
              aria-hidden
            />
            <TabsTrigger value="profile" className="flex-1 relative z-10 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent">{t('profile.manage')}</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 relative z-10 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent">{t('notifications')}</TabsTrigger>
            <TabsTrigger value="password" className="flex-1 relative z-10 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent">{t('password')}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="mb-6">
                {t('profile.manage')}
              </h2>
              <ProfileSettings />
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
                <h2 className="mb-6">
                  {t('settings.notification.preferences')}
                </h2>
                <NotificationPreferences />
              </div>
              
              <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
                <SoundSettings />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="mb-6">
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

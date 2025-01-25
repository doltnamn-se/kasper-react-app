import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationPreferences } from "@/components/settings/NotificationPreferences";
import { PasswordChange } from "@/components/settings/PasswordChange";
import { ProfileSettings } from "@/components/settings/ProfileSettings";

const Settings = () => {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('profile.settings')}
        </h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="profile" className="flex-1">Profil</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">Notiser</TabsTrigger>
            <TabsTrigger value="password" className="flex-1">Lösenord</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                Profil
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
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
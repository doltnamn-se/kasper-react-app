
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { AdminDeindexingView } from "@/components/deindexing/AdminDeindexingView";
import { UserDeindexingView } from "@/components/deindexing/UserDeindexingView";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDeindexingNotifications } from "@/hooks/useDeindexingNotifications";

const Deindexing = () => {
  const { t, language } = useLanguage();
  const { profile } = useUserProfile();
  
  // Use the extracted hook to handle notifications
  useDeindexingNotifications();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Länkar | Digitaltskydd.se" : 
      "Links | Digitaltskydd.se";
  }, [language]);

  const isAdmin = profile?.role === 'super_admin';

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('nav.my.links')} {isAdmin ? '- Admin View' : ''}
        </h1>

        {isAdmin ? (
          <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
            <AdminDeindexingView />
          </div>
        ) : (
          <UserDeindexingView />
        )}
      </div>
    </MainLayout>
  );
};

export default Deindexing;

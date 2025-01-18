import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";

const Profile = () => {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <h1 className="text-2xl font-normal text-[#000000] dark:text-gray-300 mb-6">
        {t('profile.manage')}
      </h1>
      <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[7px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
        {/* Profile management content will be added later */}
      </div>
    </MainLayout>
  );
};

export default Profile;
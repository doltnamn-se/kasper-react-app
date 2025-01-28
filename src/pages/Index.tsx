import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { ChecklistContainer } from "@/components/checklist/ChecklistContainer";

const Index = () => {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Översikt | Doltnamn.se" : 
      "Overview | Doltnamn.se";
  }, [language]);

  return (
    <MainLayout>
      <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
        {t('nav.home')}
      </h1>
      <div className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
        <p className="text-[#000000] dark:text-gray-400 mb-4">
          {t('overview.welcome')}
        </p>
        <ChecklistContainer />
      </div>
    </MainLayout>
  );
};

export default Index;
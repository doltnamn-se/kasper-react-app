import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";

const Monitoring = () => {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Bevakning | Doltnamn.se" : 
      "Monitoring | Doltnamn.se";
  }, [language]);

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('nav.monitoring')}
        </h1>
      </div>
    </MainLayout>
  );
};

export default Monitoring;
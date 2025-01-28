import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

const Monitoring = () => {
  const { t, language } = useLanguage();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Bevakning | Doltnamn.se" : 
      "Monitoring | Doltnamn.se";
  }, [language]);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('nav.monitoring')}
        </h1>

        <Card className="bg-white dark:bg-[#1c1c1e] border-[#e5e7eb] dark:border-[#2d2d2d]">
          <CardContent className="pt-6">
            <p className="text-[#000000] dark:text-white text-sm">
              {language === 'sv' 
                ? "När det dyker upp nya länkar om dig kommer du att få en notis och se länken här"
                : "When new links about you appear, you will receive a notification and see the link here"}
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Monitoring;
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewLinks } from "@/components/monitoring/NewLinks";
import { RemovedLinks } from "@/components/monitoring/RemovedLinks";

const Monitoring = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("new");

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Bevakning | Doltnamn.se" : 
      "Monitoring | Doltnamn.se";
  }, [language]);

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('nav.monitoring')}
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="new" className="flex-1">
              {language === 'sv' ? 'Nya länkar' : 'New links'}
            </TabsTrigger>
            <TabsTrigger value="removed" className="flex-1">
              {language === 'sv' ? 'Borttagna länkar' : 'Removed links'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {language === 'sv' ? 'Nya länkar' : 'New links'}
              </h2>
              <NewLinks />
            </div>
          </TabsContent>

          <TabsContent value="removed" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {language === 'sv' ? 'Borttagna länkar' : 'Removed links'}
              </h2>
              <RemovedLinks />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Monitoring;

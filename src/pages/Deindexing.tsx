import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { IncomingLinks } from "@/components/deindexing/IncomingLinks";
import { DeindexedLinks } from "@/components/deindexing/DeindexedLinks";

const Deindexing = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("incoming");

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Avindexering | Doltnamn.se" : 
      "Deindexing | Doltnamn.se";
  }, [language]);

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('nav.my.links')}
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="incoming" className="flex-1">
              {t('deindexing.incoming.links')}
            </TabsTrigger>
            <TabsTrigger value="deindexed" className="flex-1">
              {t('deindexing.deindexed.links')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incoming" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {t('deindexing.incoming.links')}
              </h2>
              <IncomingLinks />
            </div>
          </TabsContent>

          <TabsContent value="deindexed" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {t('deindexing.deindexed.links')}
              </h2>
              <DeindexedLinks />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Deindexing;
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

const AddressAlerts = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("address");

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Adresslarm | Doltnamn.se" : 
      "Address Alerts | Doltnamn.se";
  }, [language]);

  return (
    <MainLayout>
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-2xl font-black tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {t('nav.address.alerts')}
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="address" className="flex-1">
              {language === 'sv' ? 'Din Adress' : 'Your Address'}
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex-1">
              {language === 'sv' ? 'Larm' : 'Alarm'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="address" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {language === 'sv' ? 'Din Adress' : 'Your Address'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'sv' 
                  ? 'Du har inte angett din adress ännu'
                  : 'You have not provided your address yet'
                }
              </p>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
              <h2 className="text-xl font-semibold mb-6 dark:text-white">
                {language === 'sv' ? 'Larm' : 'Alarm'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {language === 'sv'
                  ? 'Det finns inga tidigare larm rörande din adress'
                  : 'There are no previous alarms regarding your address'
                }
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AddressAlerts;
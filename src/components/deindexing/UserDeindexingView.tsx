
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncomingLinks } from "@/components/deindexing/IncomingLinks";
import { DeindexedLinks } from "@/components/deindexing/DeindexedLinks";
import { NewLinkForm } from "@/components/deindexing/NewLinkForm";
import { URLLimitDisplay } from "@/components/deindexing/URLLimitDisplay";
import { useLanguage } from "@/contexts/LanguageContext";

export const UserDeindexingView = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("incoming");
  const [showNewLinkForm, setShowNewLinkForm] = useState(false);

  const handleNewLinkClick = () => {
    setShowNewLinkForm(!showNewLinkForm);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col-reverse md:flex-row justify-between md:items-end w-full gap-4 md:gap-0">
          <TabsList className="h-10 w-full md:w-auto">
            <TabsTrigger value="incoming" className="flex-1">
              {t('deindexing.incoming.links')}
            </TabsTrigger>
            <TabsTrigger value="deindexed" className="flex-1">
              {t('deindexing.deindexed.links')}
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col items-end">
            <URLLimitDisplay
              onNewLinkClick={handleNewLinkClick}
              showNewLinkForm={showNewLinkForm}
            />
          </div>
        </div>
      </div>

      {showNewLinkForm && (
        <div className="mt-2">
          <NewLinkForm onClose={() => setShowNewLinkForm(false)} />
        </div>
      )}

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
  );
};

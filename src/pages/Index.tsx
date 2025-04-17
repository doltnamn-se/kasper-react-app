
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { PrivacyScoreCard } from "@/components/privacy/PrivacyScoreCard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { StatusCard } from "@/components/status/StatusCard";
import { useSiteStatuses } from "@/hooks/useSiteStatuses";
import { useLastChecked } from "@/hooks/useLastChecked";

const Index = () => {
  const { language } = useLanguage();
  const { userProfile } = useUserProfile();
  const { lastChecked } = useLastChecked();
  const { siteStatuses, isLoading } = useSiteStatuses(userProfile?.id);

  const displayName = userProfile?.display_name || '';
  const firstNameOnly = displayName.split(' ')[0];

  return (
    <MainLayout>
      <div className="space-y-6 pb-20 md:pb-0">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
          {language === 'sv' ? 
            `Välkommen, ${firstNameOnly} 👋` : 
            `Welcome, ${firstNameOnly} 👋`
          }
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PrivacyScoreCard />
          <StatusCard 
            siteStatuses={siteStatuses} 
            isLoading={isLoading}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;

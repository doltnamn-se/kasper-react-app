
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { PrivacyScoreCard } from "@/components/privacy/PrivacyScoreCard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { StatusCard } from "@/components/status/StatusCard";
import { useSiteStatuses } from "@/hooks/useSiteStatuses";
import { useLastChecked } from "@/hooks/useLastChecked";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { language } = useLanguage();
  const { userProfile } = useUserProfile();
  const { lastChecked } = useLastChecked();
  const { siteStatuses, isLoading } = useSiteStatuses(userProfile?.id);
  const isMobile = useIsMobile();

  const displayName = userProfile?.display_name || '';
  const firstNameOnly = displayName.split(' ')[0];

  // For mobile, we don't need the MainLayout wrapper since we're using MobilePersistentLayout
  const content = (
    <div className={`space-y-6 pb-20 md:pb-0 ${isMobile ? 'px-4 pt-12' : ''}`}>
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
  );

  // On mobile, render the content directly (MobilePersistentLayout will add navigation)
  // On desktop, wrap it in MainLayout
  return isMobile ? content : <MainLayout>{content}</MainLayout>;
};

export default Index;

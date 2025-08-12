
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MousePointerClick } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { PrivacyScoreCard } from "@/components/privacy/PrivacyScoreCard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { StatusCard } from "@/components/status/StatusCard";
import { useSiteStatuses } from "@/hooks/useSiteStatuses";
import { useLastChecked } from "@/hooks/useLastChecked";
import { useIsMobile } from "@/hooks/use-mobile";
import { IdVerificationCard } from "@/components/id/IdVerificationCard";
import { usePendingIdVerification } from "@/components/id/hooks/usePendingIdVerification";
import { UserSwitcher } from "@/components/nav/UserSwitcher";

const Index = () => {
  const { language } = useLanguage();
  const { userProfile } = useUserProfile();
  const { lastChecked } = useLastChecked();
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(null);
  const { siteStatuses, isLoading } = useSiteStatuses(userProfile?.id, selectedMemberId ?? undefined);
  const isMobile = useIsMobile();
  const { pending } = usePendingIdVerification();
  const hasPending = !!pending;
  const displayName = userProfile?.display_name || '';
  const firstNameOnly = displayName.split(' ')[0];

  // Function to get welcome message based on language
  const getWelcomeMessage = () => {
    return language === 'sv' ? "Välkommen" : "Welcome";
  };
  const content = (
    <div className={`space-y-6 ${isMobile ? '' : ''} pb-20 md:pb-0`}>
      <div className="mb-6 flex items-center justify-start gap-3">
        <h1 className="m-0">
          {`${getWelcomeMessage()} ${firstNameOnly}`}
        </h1>
        {/* Badge-style user switcher: right on mobile, next to title on desktop */}
        <div className="ml-auto">
          <UserSwitcher value={selectedMemberId} onChange={setSelectedMemberId} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ID Verification upload card - should appear first */}
        <IdVerificationCard />
        {hasPending && <div className="hidden lg:block" aria-hidden="true" />}

      <PrivacyScoreCard selectedMemberId={selectedMemberId ?? undefined} />
      <StatusCard 
        siteStatuses={siteStatuses} 
        isLoading={isLoading}
      />
        
        {/* Guides link - only visible on mobile */}
        {isMobile && (
          <Link 
            to="/guides" 
            className="p-4 md:p-6 bg-[#f0f0f0] dark:bg-[#1c1c1e] rounded-2xl border border-[#e5e7eb] dark:border-[#232325] hover:shadow-md transition-shadow duration-200"
          >
            <div>
              <h2 className="flex items-center gap-2">
                <MousePointerClick className="h-5 w-5" />
                {language === 'sv' ? 'Guider' : 'Guides'}
              </h2>
            </div>
          </Link>
        )}
      </div>
    </div>
  );

  // On mobile, render the content directly (MobilePersistentLayout will add navigation)
  // On desktop, wrap it in MainLayout
  return isMobile ? content : <MainLayout>{content}</MainLayout>;
};

export default Index;

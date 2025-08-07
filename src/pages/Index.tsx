
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

const Index = () => {
  const { language } = useLanguage();
  const { userProfile } = useUserProfile();
  const { lastChecked } = useLastChecked();
  const { siteStatuses, isLoading } = useSiteStatuses(userProfile?.id);
  const isMobile = useIsMobile();

  const displayName = userProfile?.display_name || '';
  const firstNameOnly = displayName.split(' ')[0];

  // Function to get welcome message based on language
  const getWelcomeMessage = () => {
    return language === 'sv' ? "Välkommen" : "Welcome";
  };


  // For mobile, we don't need the MainLayout wrapper since we're using MobilePersistentLayout
  const content = (
    <div className={`space-y-6 ${isMobile ? '' : ''} pb-20 md:pb-0`}>
      <h1 className="mb-6">
        {`${getWelcomeMessage()} ${firstNameOnly}`}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PrivacyScoreCard />
        <StatusCard 
          siteStatuses={siteStatuses} 
          isLoading={isLoading}
        />
        
        {/* Guides link - only visible on mobile */}
        {isMobile && (
          <Link 
            to="/guides" 
            className="p-6 bg-white dark:bg-[#1c1c1e] rounded-lg border border-[#e5e7eb] dark:border-[#2d2d2d] hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <MousePointerClick className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {language === 'sv' ? 'Guider' : 'Guides'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'sv' ? 'Lär dig hur du skyddar din integritet' : 'Learn how to protect your privacy'}
                </p>
              </div>
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

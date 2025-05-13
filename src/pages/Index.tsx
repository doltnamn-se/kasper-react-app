
import React, { useState, useEffect } from "react";
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
  const [greetingFontSize, setGreetingFontSize] = useState("text-2xl");

  const displayName = userProfile?.display_name || '';
  const firstNameOnly = displayName.split(' ')[0];

  // Adjust font size based on name length for mobile
  useEffect(() => {
    if (isMobile) {
      const greeting = `${getTimeBasedGreeting()} ${firstNameOnly}`;
      if (greeting.length > 20) {
        setGreetingFontSize("text-xl");
      } else if (greeting.length > 25) {
        setGreetingFontSize("text-lg");
      } else {
        setGreetingFontSize("text-2xl");
      }
    } else {
      setGreetingFontSize("text-2xl");
    }
  }, [firstNameOnly, isMobile, language]);

  // Function to get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    
    if (language === 'sv') {
      // Swedish greetings
      if (hour >= 5 && hour < 12) {
        return "Godmorgon";
      } else if (hour >= 12 && hour < 18) {
        return "God eftermiddag";
      } else if (hour >= 18 && hour < 23) {
        return "God kväll";
      } else {
        return "Nattugglan";
      }
    } else {
      // English greetings
      if (hour >= 5 && hour < 12) {
        return "Good morning";
      } else if (hour >= 12 && hour < 18) {
        return "Good afternoon";
      } else if (hour >= 18 && hour < 23) {
        return "Good evening";
      } else {
        return "The night owl";
      }
    }
  };

  // Function to determine which emoji to show based on time
  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    return (hour >= 23 || hour < 5) ? "🦉" : "👋";
  };

  // For mobile, we don't need the MainLayout wrapper since we're using MobilePersistentLayout
  const content = (
    <div className={`space-y-6 ${isMobile ? '' : ''} pb-20 md:pb-0`}>
      <h1 className={`${greetingFontSize} font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6 whitespace-nowrap overflow-hidden text-ellipsis`}>
        {`${getTimeBasedGreeting()} ${firstNameOnly} ${getGreetingEmoji()}`}
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

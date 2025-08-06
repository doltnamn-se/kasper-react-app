
import React from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { usePrivacyScore } from "@/hooks/usePrivacyScore";
import { useIncomingUrls } from "@/hooks/useIncomingUrls";
import { useGuideData } from "@/hooks/useGuideData";
import { useAddressData } from "@/components/address/hooks/useAddressData";
import { Separator } from "@/components/ui/separator";
import { ScoreDisplay } from './score-card/ScoreDisplay';
import { ScoreItemsList } from './score-card/ScoreItemsList';

export const PrivacyScoreCard = () => {
  const { calculateScore } = usePrivacyScore();
  const { language } = useLanguage();
  const score = calculateScore();
  const { incomingUrls } = useIncomingUrls();
  const { getGuides } = useGuideData();
  const { addressData } = useAddressData();
  const allGuides = getGuides();

  const completedUrls = incomingUrls?.filter(url => url.status === 'removal_approved')?.length || 0;
  const totalUrls = incomingUrls?.length || 0;

  const completedGuides = score.individual.guides;
  const completedGuidesCount = Math.round((completedGuides / 100) * allGuides.length);

  return (
    <div className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-2xl shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <div className="space-y-4 mb-6">
        <div>
          <h2>
            {language === 'sv' ? 'Hur skyddad är du?' : 'How protected are you?'}
          </h2>
          <p className="text-[#000000A6] dark:text-[#FFFFFFA6] font-medium text-sm mb-10">
            {language === 'sv' ? 'Din aktuella skyddsnivå' : 'Your current protection level'}
          </p>
        </div>
        
        <ScoreDisplay 
          score={score.total} 
          language={language} 
        />
      </div>

      <Separator className="my-6" />

      <ScoreItemsList 
        language={language}
        scores={score.individual}
        completedUrls={completedUrls}
        totalUrls={totalUrls}
        completedGuidesCount={completedGuidesCount}
        totalGuidesCount={allGuides.length}
        hasAddress={Boolean(addressData?.street_address)}
        incomingUrls={incomingUrls}
      />
    </div>
  );
};

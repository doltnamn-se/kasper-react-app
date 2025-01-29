import { useLanguage } from "@/contexts/LanguageContext";
import { StepGuide } from "../StepGuide";

interface GuideStepContentProps {
  currentStep: number;
  selectedSites: string[];
  completedGuides: string[] | null;
  onGuideComplete: (siteId: string) => Promise<void>;
  getGuideForSite: (siteId: string) => any;
}

export const GuideStepContent = ({
  currentStep,
  selectedSites,
  completedGuides,
  onGuideComplete,
  getGuideForSite
}: GuideStepContentProps) => {
  // Define the correct order of sites
  const siteOrder = [
    'eniro',
    'hitta',
    'mrkoll',
    'merinfo',
    'ratsit',
    'birthday',
    'upplysning'
  ];

  // First 3 steps are other content, so we need to adjust the index
  const guideStepIndex = currentStep - 4;
  console.log('GuideStepContent - Guide step index:', guideStepIndex);
  
  // Get ordered selected sites based on predefined order
  const orderedSelectedSites = [...selectedSites].sort((a, b) => 
    siteOrder.indexOf(a) - siteOrder.indexOf(b)
  );
  console.log('GuideStepContent - Ordered selected sites:', orderedSelectedSites);

  // Get the current site based on the guide step index
  const currentSiteId = orderedSelectedSites[guideStepIndex];
  console.log('GuideStepContent - Current site ID:', currentSiteId);

  // If no current site ID or invalid index, return null
  if (!currentSiteId || guideStepIndex < 0 || guideStepIndex >= orderedSelectedSites.length) {
    console.log('GuideStepContent - No valid site for current step');
    return null;
  }

  // Get the guide data for the current site
  const guide = getGuideForSite(currentSiteId);
  console.log('GuideStepContent - Guide data:', guide);

  if (!guide) {
    console.log('GuideStepContent - No guide found for site:', currentSiteId);
    return null;
  }

  const isGuideCompleted = (completedGuides || []).includes(currentSiteId);
  console.log('GuideStepContent - Is guide completed:', isGuideCompleted);

  return (
    <StepGuide
      currentStep={currentStep}
      siteId={currentSiteId}
      guide={guide}
      isGuideCompleted={isGuideCompleted}
      onGuideComplete={onGuideComplete}
    />
  );
};
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
  // First 3 steps are other content, so we need to adjust the index
  const guideIndex = currentStep - 4;
  console.log('GuideStepContent - Current step:', currentStep);
  console.log('GuideStepContent - Guide index:', guideIndex);
  console.log('GuideStepContent - Selected sites:', selectedSites);
  
  // Get the current site based on the guide index
  const currentSiteId = selectedSites[guideIndex];
  console.log('GuideStepContent - Current site ID:', currentSiteId);

  // If no current site ID or invalid index, return null
  if (!currentSiteId || guideIndex < 0 || guideIndex >= selectedSites.length) {
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
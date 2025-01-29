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
  console.log('GuideStepContent - Rendering guide step:', currentStep);
  console.log('GuideStepContent - Selected sites:', selectedSites);
  
  const siteIndex = currentStep - 4;
  console.log('GuideStepContent - Site index:', siteIndex);
  
  if (siteIndex < 0 || siteIndex >= selectedSites.length) {
    console.error('GuideStepContent - Invalid site index:', siteIndex, 'for selected sites:', selectedSites);
    return null;
  }

  const siteId = selectedSites[siteIndex];
  console.log('GuideStepContent - Current site ID:', siteId);
  
  const guide = getGuideForSite(siteId);
  console.log('GuideStepContent - Guide data:', guide);
  
  if (!guide) {
    console.error('GuideStepContent - No guide found for site:', siteId);
    return null;
  }

  const isGuideCompleted = completedGuides?.includes(siteId);
  console.log('GuideStepContent - Is guide completed:', isGuideCompleted);

  return (
    <StepGuide
      currentStep={currentStep}
      siteId={siteId}
      guide={guide}
      isGuideCompleted={Boolean(isGuideCompleted)}
      onGuideComplete={onGuideComplete}
    />
  );
};
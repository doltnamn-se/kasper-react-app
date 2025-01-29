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
  console.log('GuideStepContent - Current step:', currentStep);
  console.log('GuideStepContent - Selected sites:', selectedSites);
  console.log('GuideStepContent - Completed guides:', completedGuides);
  
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

  // Get the current guide index (steps 1-3 are for other content)
  const guideIndex = currentStep - 4;
  console.log('GuideStepContent - Guide index:', guideIndex);

  // Get the ordered list of selected sites
  const orderedSelectedSites = selectedSites.sort((a, b) => 
    siteOrder.indexOf(a) - siteOrder.indexOf(b)
  );
  console.log('GuideStepContent - Ordered selected sites:', orderedSelectedSites);

  // Validate the index
  if (guideIndex < 0 || guideIndex >= orderedSelectedSites.length) {
    console.error('GuideStepContent - Invalid guide index:', guideIndex);
    console.error('GuideStepContent - Number of selected sites:', orderedSelectedSites.length);
    return null;
  }

  const currentSiteId = orderedSelectedSites[guideIndex];
  console.log('GuideStepContent - Current site ID:', currentSiteId);

  const guide = getGuideForSite(currentSiteId);
  console.log('GuideStepContent - Guide data:', guide);

  if (!guide) {
    console.error('GuideStepContent - No guide found for site:', currentSiteId);
    return null;
  }

  const isGuideCompleted = completedGuides?.includes(currentSiteId);
  console.log('GuideStepContent - Is guide completed:', isGuideCompleted);

  return (
    <StepGuide
      currentStep={currentStep}
      siteId={currentSiteId}
      guide={guide}
      isGuideCompleted={Boolean(isGuideCompleted)}
      onGuideComplete={onGuideComplete}
    />
  );
};
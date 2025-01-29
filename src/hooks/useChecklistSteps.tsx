import { useState } from "react";
import { useChecklistProgress } from "./useChecklistProgress";

export const useChecklistSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { checklistProgress } = useChecklistProgress();

  const getTotalSteps = () => {
    const baseSteps = 4;
    const selectedSitesCount = checklistProgress?.selected_sites?.length || 0;
    return baseSteps + selectedSitesCount;
  };

  const handleStepChange = (step: number) => {
    console.log('Changing to step:', step);
    setCurrentStep(step);
  };

  const handleStepProgression = () => {
    const totalSteps = getTotalSteps();
    if (currentStep < totalSteps) {
      if (currentStep === 3) {
        const selectedSites = checklistProgress?.selected_sites || [];
        if (selectedSites.length > 0) {
          console.log('Moving to first guide step (4)');
          setCurrentStep(4);
        } else {
          console.log('No sites selected, moving to final step');
          setCurrentStep(totalSteps);
        }
      } else if (currentStep > 3) {
        // For guide steps
        const selectedSites = checklistProgress?.selected_sites || [];
        const completedGuides = checklistProgress?.completed_guides || [];
        const currentGuideIndex = currentStep - 4;
        
        if (currentGuideIndex < selectedSites.length) {
          const currentSite = selectedSites[currentGuideIndex];
          if (completedGuides.includes(currentSite)) {
            // Move to next guide step or final step
            const nextStep = currentStep + 1;
            console.log('Guide completed, moving to step:', nextStep);
            setCurrentStep(nextStep);
          } else {
            console.log('Current guide not completed yet, staying on step:', currentStep);
          }
        } else {
          // All guides completed, move to final step
          console.log('All guides completed, moving to final step');
          setCurrentStep(totalSteps);
        }
      } else {
        // For steps 1-2
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  return {
    currentStep,
    totalSteps: getTotalSteps(),
    handleStepChange,
    handleStepProgression
  };
};
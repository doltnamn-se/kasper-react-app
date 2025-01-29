import { useState } from "react";
import { useChecklistProgress } from "./useChecklistProgress";

export const useChecklistSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { checklistProgress } = useChecklistProgress();

  const getTotalSteps = () => {
    const baseSteps = 3; // Steps 1-3
    const selectedSitesCount = checklistProgress?.selected_sites?.length || 0;
    const finalStep = 1; // Address alert or identification step
    return baseSteps + selectedSitesCount + finalStep;
  };

  const handleStepChange = (step: number) => {
    console.log('Changing to step:', step);
    setCurrentStep(step);
  };

  const handleStepProgression = () => {
    console.log('Current step:', currentStep);
    console.log('Selected sites:', checklistProgress?.selected_sites);
    console.log('Completed guides:', checklistProgress?.completed_guides);

    const totalSteps = getTotalSteps();
    const selectedSites = checklistProgress?.selected_sites || [];
    const completedGuides = checklistProgress?.completed_guides || [];

    if (currentStep < totalSteps) {
      if (currentStep === 3) {
        // After step 3 (site selection), move to first guide if sites were selected
        if (selectedSites.length > 0) {
          console.log('Moving to first guide step (4)');
          setCurrentStep(4);
        } else {
          // If no sites selected, move to final step
          console.log('No sites selected, moving to final step');
          setCurrentStep(totalSteps);
        }
      } else if (currentStep > 3 && currentStep < totalSteps) {
        // Handle guide steps
        const currentGuideIndex = currentStep - 4;
        
        if (currentGuideIndex < selectedSites.length) {
          // Move to next step regardless of guide completion status
          console.log('Moving to next step:', currentStep + 1);
          setCurrentStep(currentStep + 1);
        } else {
          // All guides completed, move to final step
          console.log('Moving to final step');
          setCurrentStep(totalSteps);
        }
      } else {
        // For steps 1-2, simply increment
        console.log('Moving to next step:', currentStep + 1);
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
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";
import { StepProgress } from "./StepProgress";
import { StepContent } from "./StepContent";
import { StepNavigation } from "./StepNavigation";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { useChecklistItems } from "@/hooks/useChecklistItems";
import { useChecklistSteps } from "@/hooks/useChecklistSteps";
import { useGuideService } from "@/services/guideService";
import { useGuideCompletion } from "@/hooks/useGuideCompletion";
import { supabase } from "@/integrations/supabase/client";

export const ChecklistContainer = () => {
  const { checklistProgress, handleStepComplete, calculateProgress, refetchProgress } = useChecklistProgress();
  const { checklistItems } = useChecklistItems();
  const { currentStep, totalSteps, handleStepChange } = useChecklistSteps();
  const { getGuideForSite } = useGuideService();
  const { handleGuideComplete } = useGuideCompletion();

  const onStepCompleted = async () => {
    console.log('Step completed, current step:', currentStep);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const updateData: any = {};
    
    switch (currentStep) {
      case 1:
        updateData.password_updated = true;
        break;
      case 2:
        // For URL submission step, handled in UrlSubmission component
        break;
      case 3:
        // For site selection step, handled in HidingSitesSelection component
        break;
      default:
        // For guide steps, no specific updates needed here
        break;
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('customer_checklist_progress')
        .update(updateData)
        .eq('customer_id', session.user.id);

      if (error) {
        console.error('Error updating checklist progress:', error);
        return;
      }
    }

    await handleStepComplete();
    await refetchProgress();
    
    // Only progress to next step for non-guide steps
    if (currentStep <= 3) {
      handleStepChange(currentStep + 1);
    }
  };

  const onGuideCompleted = async (siteId: string) => {
    console.log('Guide completed for site:', siteId);
    await handleGuideComplete(siteId);
    await refetchProgress();
    
    const selectedSites = checklistProgress?.selected_sites || [];
    const completedGuides = checklistProgress?.completed_guides || [];
    const baseSteps = 3; // Password, URLs, Site Selection
    
    console.log('Current state:', {
      selectedSites,
      completedGuides,
      currentStep,
      baseSteps
    });

    // Find the next uncompleted guide
    const nextUncompleted = selectedSites.find(site => !completedGuides.includes(site));
    console.log('Next uncompleted guide:', nextUncompleted);

    if (nextUncompleted) {
      // Calculate the step number for the next uncompleted guide
      const nextGuideIndex = selectedSites.indexOf(nextUncompleted);
      const nextStep = baseSteps + nextGuideIndex + 1;
      console.log('Moving to next guide step:', nextStep);
      handleStepChange(nextStep);
    } else {
      // All guides are completed, move to final step
      const finalStep = baseSteps + selectedSites.length + 1;
      console.log('All guides completed, moving to final step:', finalStep);
      handleStepChange(finalStep);
    }
  };

  // Calculate the actual total number of steps
  const baseSteps = 3; // Password, URLs, Site Selection
  const selectedSites = checklistProgress?.selected_sites || [];
  const actualTotalSteps = baseSteps + selectedSites.length + 1; // +1 for final step

  console.log('ChecklistContainer state:', {
    currentStep,
    selectedSites,
    actualTotalSteps,
    completedGuides: checklistProgress?.completed_guides
  });

  return (
    <div className="space-y-6">
      <StepProgress progress={calculateProgress()} />
      <div className="space-y-8">
        <div className="step-content-wrapper bg-white dark:bg-[#1C1C1D] rounded-lg p-6">
          {[...Array(actualTotalSteps)].map((_, index) => {
            const stepNumber = index + 1;
            console.log('Rendering step:', stepNumber, 'Current step:', currentStep);
            
            return (
              <div 
                key={stepNumber}
                data-step={stepNumber}
                style={{ display: currentStep === stepNumber ? 'block' : 'none' }}
              >
                <StepContent
                  currentStep={stepNumber}
                  selectedSites={selectedSites}
                  completedGuides={checklistProgress?.completed_guides}
                  onGuideComplete={onGuideCompleted}
                  onStepComplete={onStepCompleted}
                  checklistItems={checklistItems || []}
                  getGuideForSite={getGuideForSite}
                />
              </div>
            );
          })}
        </div>
        <div className="py-8">
          <Separator className="bg-[#e0e0e0] dark:bg-[#3a3a3b]" />
        </div>
        <StepNavigation
          currentStep={currentStep}
          totalSteps={actualTotalSteps}
          onStepChange={handleStepChange}
        />
      </div>
    </div>
  );
};
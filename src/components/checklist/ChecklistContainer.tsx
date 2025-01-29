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
  const { t } = useLanguage();
  const { checklistProgress, handleStepComplete, calculateProgress, refetchProgress } = useChecklistProgress();
  const { checklistItems } = useChecklistItems();
  const { currentStep, totalSteps, handleStepChange, handleStepProgression } = useChecklistSteps();
  const { getGuideForSite } = useGuideService();
  const { handleGuideComplete } = useGuideCompletion();

  const onStepCompleted = async () => {
    console.log('Step completed, current step:', currentStep);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Update the progress in the database based on the current step
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
    handleStepProgression();
  };

  return (
    <div className="space-y-6">
      <StepProgress progress={calculateProgress()} />
      <div className="space-y-8">
        <div className="step-content-wrapper bg-white dark:bg-[#1C1C1D] rounded-lg p-6">
          {[...Array(totalSteps)].map((_, index) => (
            <div 
              key={index + 1}
              data-step={index + 1}
              style={{ display: currentStep === index + 1 ? 'block' : 'none' }}
            >
              <StepContent
                currentStep={index + 1}
                selectedSites={checklistProgress?.selected_sites || []}
                completedGuides={checklistProgress?.completed_guides}
                onGuideComplete={handleGuideComplete}
                onStepComplete={onStepCompleted}
                checklistItems={checklistItems || []}
                getGuideForSite={getGuideForSite}
              />
            </div>
          ))}
        </div>
        <div className="py-8">
          <Separator className="bg-[#e0e0e0] dark:bg-[#3a3a3b]" />
        </div>
        <StepNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onStepChange={handleStepChange}
        />
      </div>
    </div>
  );
};
import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";
import { StepProgress } from "./StepProgress";
import { StepContent } from "./StepContent";
import { StepNavigation } from "./StepNavigation";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { useChecklistItems } from "@/hooks/useChecklistItems";
import { useChecklistSteps } from "@/hooks/useChecklistSteps";
import { supabase } from "@/integrations/supabase/client";

export const ChecklistContainer = () => {
  const { checklistProgress, handleStepComplete, calculateProgress, refetchProgress } = useChecklistProgress();
  const { checklistItems } = useChecklistItems();
  const { currentStep, totalSteps, handleStepChange } = useChecklistSteps();

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
        // For URL submission step, we consider it complete even with empty array
        updateData.removal_urls = checklistProgress?.removal_urls || [];
        break;
      case 3:
        // For site selection step, handled in HidingSitesSelection component
        break;
      case 4:
        // For address/identification step, handled in respective components
        break;
      default:
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
    
    // Progress to next step if not on final step
    if (currentStep < 4) {
      handleStepChange(currentStep + 1);
    }
  };

  // Calculate total steps (now fixed at 4)
  const totalStepsCount = 4; // Password, URLs, Site Selection, Address/Identification

  console.log('ChecklistContainer state:', {
    currentStep,
    totalStepsCount
  });

  return (
    <div className="space-y-6">
      <StepProgress progress={calculateProgress()} />
      <div className="space-y-8">
        <div className="step-content-wrapper bg-white dark:bg-[#1C1C1D] rounded-lg p-6">
          {[...Array(totalStepsCount)].map((_, index) => {
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
                  onStepComplete={onStepCompleted}
                  checklistItems={checklistItems || []}
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
          totalSteps={totalStepsCount}
          onStepChange={handleStepChange}
        />
      </div>
    </div>
  );
};
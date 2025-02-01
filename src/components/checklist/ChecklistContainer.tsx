import { useLanguage } from "@/contexts/LanguageContext";
import { Separator } from "@/components/ui/separator";
import { StepProgress } from "./StepProgress";
import { StepContent } from "./StepContent";
import { StepNavigation } from "./StepNavigation";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { useChecklistItems } from "@/hooks/useChecklistItems";
import { useChecklistSteps } from "@/hooks/useChecklistSteps";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from 'canvas-confetti';

export const ChecklistContainer = () => {
  const { toast } = useToast();
  const { checklistProgress, handleStepComplete, calculateProgress, refetchProgress } = useChecklistProgress();
  const { checklistItems } = useChecklistItems();
  const { currentStep, handleStepChange } = useChecklistSteps();

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
        updateData.removal_urls = checklistProgress?.removal_urls || [];
        break;
      case 3:
        // For site selection step, handled in HidingSitesSelection component
        break;
      case 4:
        // For address/identification step
        if (checklistProgress?.street_address && 
            checklistProgress?.postal_code && 
            checklistProgress?.city) {
          updateData.completed_at = new Date().toISOString();
        }
        break;
      default:
        break;
    }

    if (Object.keys(updateData).length > 0) {
      const { error: progressError } = await supabase
        .from('customer_checklist_progress')
        .update(updateData)
        .eq('customer_id', session.user.id);

      if (progressError) {
        console.error('Error updating checklist progress:', progressError);
        return;
      }

      // If this is the final step and all requirements are met, mark checklist as completed
      if (currentStep === 4 && checklistProgress?.street_address && 
          checklistProgress?.postal_code && 
          checklistProgress?.city) {
        const { error: customerError } = await supabase
          .from('customers')
          .update({ 
            checklist_completed: true,
            checklist_step: currentStep 
          })
          .eq('id', session.user.id);

        if (customerError) {
          console.error('Error updating customer:', customerError);
          return;
        }

        // Show completion celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast({
          title: "Congratulations! 🎉",
          description: "You've completed all the checklist steps!",
        });
      }
    }

    await handleStepComplete();
    await refetchProgress();
    
    // Progress to next step if not on final step
    if (currentStep < 4) {
      handleStepChange(currentStep + 1);
    }
  };

  // Fixed total steps count to 4 main steps
  const totalStepsCount = 4;

  console.log('ChecklistContainer state:', {
    currentStep,
    totalStepsCount,
    progress: calculateProgress()
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
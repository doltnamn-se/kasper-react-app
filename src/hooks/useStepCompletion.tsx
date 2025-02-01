import { useToast } from "@/hooks/use-toast";
import { useChecklistProgress } from "./useChecklistProgress";
import { useChecklistSteps } from "./useChecklistSteps";
import { supabase } from "@/integrations/supabase/client";
import confetti from 'canvas-confetti';

export const useStepCompletion = () => {
  const { toast } = useToast();
  const { checklistProgress, refetchProgress } = useChecklistProgress();
  const { currentStep, handleStepChange } = useChecklistSteps();

  const handleStepComplete = async () => {
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

    await refetchProgress();
    
    // Progress to next step if not on final step
    if (currentStep < 4) {
      handleStepChange(currentStep + 1);
    }
  };

  return { handleStepComplete };
};
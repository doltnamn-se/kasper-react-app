import { useToast } from "@/hooks/use-toast";
import { useChecklistProgress } from "./useChecklistProgress";
import { useChecklistSteps } from "./useChecklistSteps";
import { supabase } from "@/integrations/supabase/client";
import confetti from 'canvas-confetti';
import { useNavigate } from "react-router-dom";

export const useStepCompletion = () => {
  const { toast } = useToast();
  const { checklistProgress, refetchProgress } = useChecklistProgress();
  const { currentStep } = useChecklistSteps();
  const navigate = useNavigate();

  const launchConfetti = () => {
    console.log('Launching confetti celebration...');
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        spread: 60,
        startVelocity: 30,
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, {
      spread: 60,
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const handleStepComplete = async () => {
    console.log('Step completion triggered, current step:', currentStep);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Check if this is the final step and all requirements are met
    const isFinalStep = currentStep === 4;
    const hasAddress = checklistProgress?.street_address && 
                      checklistProgress?.postal_code && 
                      checklistProgress?.city;

    if (isFinalStep && hasAddress) {
      console.log('Final step completion - all requirements met');
      
      // Launch confetti first
      launchConfetti();

      // Update customer record
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

      // Update checklist progress
      const { error: progressError } = await supabase
        .from('customer_checklist_progress')
        .update({
          completed_at: new Date().toISOString()
        })
        .eq('customer_id', session.user.id);

      if (progressError) {
        console.error('Error updating checklist progress:', progressError);
        return;
      }

      // Show success toast
      toast({
        title: "Congratulations! 🎉",
        description: "You've completed all the checklist steps!",
      });

      // Navigate to home page after a delay
      setTimeout(() => {
        console.log('Navigating to home page...');
        navigate('/');
      }, 2000);

      await refetchProgress();
      return;
    }

    // For non-final steps, just update the progress
    const { error: progressError } = await supabase
      .from('customer_checklist_progress')
      .update({
        completed_at: new Date().toISOString()
      })
      .eq('customer_id', session.user.id);

    if (progressError) {
      console.error('Error updating checklist progress:', progressError);
      return;
    }

    await refetchProgress();
  };

  return { handleStepComplete };
};
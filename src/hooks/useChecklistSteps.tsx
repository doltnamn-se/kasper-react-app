import { useState, useEffect } from "react";
import { useChecklistProgress } from "./useChecklistProgress";
import { supabase } from "@/integrations/supabase/client";

export const useChecklistSteps = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { checklistProgress, refetchProgress } = useChecklistProgress();

  // Sync with database state on mount and when checklistProgress changes
  useEffect(() => {
    if (checklistProgress?.checklist_step) {
      console.log('Syncing current step with database:', checklistProgress.checklist_step);
      setCurrentStep(checklistProgress.checklist_step);
    }
  }, [checklistProgress?.checklist_step]);

  const handleStepChange = async (step: number) => {
    console.log('Changing to step:', step);
    
    try {
      // Update local state
      setCurrentStep(step);
      
      // Update database state
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('No user session found');
        return;
      }

      const { error } = await supabase
        .from('customers')
        .update({ checklist_step: step })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating checklist step:', error);
        // Revert local state if database update fails
        setCurrentStep(checklistProgress?.checklist_step || 1);
        return;
      }

      // Refetch progress to ensure all components have latest state
      await refetchProgress();
      
      console.log('Successfully updated step to:', step);
    } catch (error) {
      console.error('Error in handleStepChange:', error);
      setCurrentStep(checklistProgress?.checklist_step || 1);
    }
  };

  const getTotalSteps = () => {
    return 2; // Fixed number of steps
  };

  return {
    currentStep,
    totalSteps: getTotalSteps(),
    handleStepChange,
  };
};
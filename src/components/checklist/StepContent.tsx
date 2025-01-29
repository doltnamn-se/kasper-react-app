import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GuideStepContent } from "./steps/GuideStepContent";
import { BasicStepContent } from "./steps/BasicStepContent";

interface StepContentProps {
  currentStep: number;
  selectedSites: string[];
  completedGuides: string[] | null;
  onGuideComplete: (siteId: string) => Promise<void>;
  onStepComplete: () => Promise<void>;
  checklistItems: any[];
  getGuideForSite: (siteId: string) => any;
}

export const StepContent = ({
  currentStep,
  selectedSites,
  completedGuides,
  onGuideComplete,
  onStepComplete,
  checklistItems,
  getGuideForSite
}: StepContentProps) => {
  const { data: customerData } = useQuery({
    queryKey: ['customer-data'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  console.log('StepContent - Current step:', currentStep);
  console.log('StepContent - Selected sites:', selectedSites);
  console.log('StepContent - Completed guides:', completedGuides);

  // Calculate the actual step number for the final step
  const baseSteps = 3;
  const finalStepNumber = currentStep > baseSteps ? 
    (currentStep <= baseSteps + selectedSites.length ? currentStep : baseSteps + selectedSites.length + 1) : 
    currentStep;

  const currentItem = checklistItems?.[finalStepNumber - 1];
  if (!currentItem) return null;

  // For guide steps (after step 3)
  if (currentStep > 3 && currentStep <= baseSteps + selectedSites.length) {
    console.log('StepContent - Rendering guide step content');
    return (
      <GuideStepContent
        currentStep={currentStep}
        selectedSites={selectedSites}
        completedGuides={completedGuides}
        onGuideComplete={onGuideComplete}
        getGuideForSite={getGuideForSite}
      />
    );
  }

  // For basic steps (1-3 and final step)
  return (
    <BasicStepContent
      currentStep={finalStepNumber}
      onStepComplete={onStepComplete}
      customerData={customerData}
    />
  );
};
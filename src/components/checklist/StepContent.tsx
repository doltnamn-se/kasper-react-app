import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BasicStepContent } from "./steps/BasicStepContent";

interface StepContentProps {
  currentStep: number;
  onStepComplete: () => Promise<void>;
  checklistItems: any[];
}

export const StepContent = ({
  currentStep,
  onStepComplete,
  checklistItems
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

  const currentItem = checklistItems?.[currentStep - 1];
  if (!currentItem) return null;

  return (
    <BasicStepContent
      currentStep={currentStep}
      onStepComplete={onStepComplete}
      customerData={customerData}
    />
  );
};
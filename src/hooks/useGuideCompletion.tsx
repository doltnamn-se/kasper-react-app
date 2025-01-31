import { supabase } from "@/integrations/supabase/client";
import { useChecklistProgress } from "./useChecklistProgress";

export const useGuideCompletion = () => {
  const { checklistProgress, refetchProgress } = useChecklistProgress();

  const handleGuideComplete = async (siteId: string) => {
    console.log('Starting guide completion for site:', siteId);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.error('No user session found');
      return;
    }

    const completedGuides = checklistProgress?.completed_guides || [];
    const isCurrentlyCompleted = completedGuides.includes(siteId);
    console.log('Current completed guides:', completedGuides);
    console.log('Is currently completed:', isCurrentlyCompleted);
    
    const newCompletedGuides = isCurrentlyCompleted
      ? completedGuides.filter(id => id !== siteId)
      : [...completedGuides, siteId];
    
    // Update both customer_checklist_progress and customers tables
    const { error: progressError } = await supabase
      .from('customer_checklist_progress')
      .update({ completed_guides: newCompletedGuides })
      .eq('customer_id', session.user.id);

    if (progressError) {
      console.error('Error updating checklist progress:', progressError);
      return;
    }

    // Update customers table
    const { error: customerError } = await supabase
      .from('customers')
      .update({ completed_guides: newCompletedGuides })
      .eq('id', session.user.id);

    if (customerError) {
      console.error('Error updating customer:', customerError);
      return;
    }

    console.log('Successfully updated guide completion status:', siteId);
    await refetchProgress();
  };

  return { handleGuideComplete };
};
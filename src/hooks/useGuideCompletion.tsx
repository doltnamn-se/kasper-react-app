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
    console.log('Current completed guides:', completedGuides);
    
    // Update both customer_checklist_progress and customers tables
    const { error: progressError } = await supabase
      .from('customer_checklist_progress')
      .update({ 
        completed_guides: [...completedGuides, siteId] 
      })
      .eq('customer_id', session.user.id);

    if (progressError) {
      console.error('Error updating checklist progress:', progressError);
      return;
    }

    // Update customers table
    const { error: customerError } = await supabase
      .from('customers')
      .update({ 
        completed_guides: [...completedGuides, siteId] 
      })
      .eq('id', session.user.id);

    if (customerError) {
      console.error('Error updating customer:', customerError);
      return;
    }

    console.log('Successfully marked guide as completed:', siteId);
    await refetchProgress();
  };

  return { handleGuideComplete };
};
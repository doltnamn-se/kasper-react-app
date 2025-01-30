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
    
    const { error } = await supabase
      .from('customer_checklist_progress')
      .update({ 
        completed_guides: [...completedGuides, siteId] 
      })
      .eq('customer_id', session.user.id);

    if (error) {
      console.error('Error updating completed guides:', error);
      return;
    }

    console.log('Successfully marked guide as completed:', siteId);
    await refetchProgress();
  };

  return { handleGuideComplete };
};
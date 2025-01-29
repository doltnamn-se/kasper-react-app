import { supabase } from "@/integrations/supabase/client";
import { useChecklistProgress } from "./useChecklistProgress";

export const useGuideCompletion = () => {
  const { checklistProgress, refetchProgress } = useChecklistProgress();

  const handleGuideComplete = async (siteId: string) => {
    console.log('Completing guide for site:', siteId);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const completedGuides = checklistProgress?.completed_guides || [];
    
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

    await refetchProgress();
  };

  return { handleGuideComplete };
};
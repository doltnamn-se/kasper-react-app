import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from 'canvas-confetti';

interface ChecklistProgress {
  password_updated: boolean;
  selected_sites: string[];
  removal_urls: string[];
  address: string | null;
  is_address_hidden: boolean;
  personal_number: string | null;
  completed_at: string | null;
  completed_guides: string[] | null;
}

export const useChecklistProgress = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: checklistProgress, refetch: refetchProgress } = useQuery({
    queryKey: ['checklist-progress'],
    queryFn: async () => {
      console.log('Fetching checklist progress...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('No user session');

      const { data, error } = await supabase
        .from('customer_checklist_progress')
        .select('*')
        .eq('customer_id', session.user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching checklist progress:', error);
        throw error;
      }

      if (!data) {
        const { data: newProgress, error: insertError } = await supabase
          .from('customer_checklist_progress')
          .insert([{ customer_id: session.user.id }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating checklist progress:', insertError);
          throw insertError;
        }

        return newProgress as ChecklistProgress;
      }
      
      console.log('Checklist progress fetched:', data);
      return data as ChecklistProgress;
    }
  });

  const handleStepComplete = async () => {
    console.log('Step completed, refetching progress...');
    await refetchProgress();
    await queryClient.invalidateQueries({ queryKey: ['checklist-progress'] });
    
    if (checklistProgress && !checklistProgress.completed_at) {
      const totalSteps = 4 + (checklistProgress.selected_sites?.length || 0);
      let completedSteps = 0;
      
      if (checklistProgress.password_updated) completedSteps++;
      if (checklistProgress.removal_urls?.length > 0) completedSteps++;
      if (checklistProgress.selected_sites?.length > 0) completedSteps++;
      
      // Count completed guides
      const completedGuidesCount = checklistProgress.completed_guides?.length || 0;
      completedSteps += completedGuidesCount;
      
      // Check if address/personal info is complete
      if (checklistProgress.address && checklistProgress.personal_number) completedSteps++;
      
      if (completedSteps === totalSteps) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        toast({
          title: "Congratulations! 🎉",
          description: "You've completed all the checklist items!",
        });
      }
    }
  };

  const calculateProgress = () => {
    if (!checklistProgress) return 0;
    
    const totalSteps = 4 + (checklistProgress.selected_sites?.length || 0);
    let completedSteps = 0;
    
    if (checklistProgress.password_updated) completedSteps++;
    if (checklistProgress.removal_urls?.length > 0) completedSteps++;
    if (checklistProgress.selected_sites?.length > 0) completedSteps++;
    
    // Count completed guides
    const completedGuidesCount = checklistProgress.completed_guides?.length || 0;
    completedSteps += completedGuidesCount;
    
    // Check if address/personal info is complete
    if (checklistProgress.address && checklistProgress.personal_number) completedSteps++;
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  return {
    checklistProgress,
    refetchProgress,
    handleStepComplete,
    calculateProgress
  };
};
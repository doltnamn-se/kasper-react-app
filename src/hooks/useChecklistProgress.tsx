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
  street_address: string | null;
  postal_code: string | null;
  city: string | null;
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

      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (customerError) {
        console.error('Error fetching customer data:', customerError);
        throw customerError;
      }

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

        return { ...newProgress, has_address_alert: customerData.has_address_alert };
      }
      
      console.log('Checklist progress fetched:', { ...data, has_address_alert: customerData.has_address_alert });
      return { ...data, has_address_alert: customerData.has_address_alert };
    }
  });

  const handleStepComplete = async () => {
    console.log('Step completed, refetching progress...');
    await refetchProgress();
    await queryClient.invalidateQueries({ queryKey: ['checklist-progress'] });
  };

  const calculateProgress = () => {
    if (!checklistProgress) return 0;
    
    const totalSteps = 4;
    let completedSteps = 0;
    
    // Step 1: Password updated
    if (checklistProgress.password_updated) completedSteps++;
    
    // Step 2: URLs submitted or skipped
    if (checklistProgress.removal_urls && 
        (checklistProgress.removal_urls.length > 0 || 
         checklistProgress.removal_urls.includes('skipped'))) {
      completedSteps++;
    }
    
    // Step 3: Sites selected
    if (checklistProgress.selected_sites?.length > 0) completedSteps++;
    
    // Step 4: Final step (address or personal info)
    if (checklistProgress.has_address_alert) {
      if (checklistProgress.street_address && 
          checklistProgress.postal_code && 
          checklistProgress.city) {
        completedSteps++;
      }
    } else {
      if (checklistProgress.address && checklistProgress.personal_number) {
        completedSteps++;
      }
    }

    const progress = Math.round((completedSteps / totalSteps) * 100);
    
    console.log('Progress calculation:', {
      completedSteps,
      totalSteps,
      progress,
      checklistProgress
    });
    
    return progress;
  };

  return {
    checklistProgress,
    refetchProgress,
    handleStepComplete,
    calculateProgress
  };
};
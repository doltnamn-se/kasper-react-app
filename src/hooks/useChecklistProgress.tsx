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

      // First get the customer data to check has_address_alert
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
    
    if (checklistProgress && !checklistProgress.completed_at) {
      const totalSteps = 4;
      let completedSteps = 0;
      
      if (checklistProgress.password_updated) completedSteps++;
      if (checklistProgress.removal_urls?.length > 0) completedSteps++;
      if (checklistProgress.selected_sites?.length > 0) completedSteps++;
      
      // Check final step based on has_address_alert flag
      if (checklistProgress.has_address_alert) {
        // For address alert users, check address fields
        if (checklistProgress.street_address && 
            checklistProgress.postal_code && 
            checklistProgress.city) {
          completedSteps++;
        }
      } else {
        // For identification users, check personal info
        if (checklistProgress.address && checklistProgress.personal_number) {
          completedSteps++;
        }
      }

      // Check if all selected guides are completed
      const allGuidesCompleted = checklistProgress.selected_sites?.every(
        site => checklistProgress.completed_guides?.includes(site)
      );
      
      console.log('Progress check:', {
        completedSteps,
        totalSteps,
        allGuidesCompleted,
        hasAddressAlert: checklistProgress.has_address_alert
      });

      if (completedSteps === totalSteps && allGuidesCompleted) {
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
    
    const totalSteps = 4; // Base steps
    let completedSteps = 0;
    
    if (checklistProgress.password_updated) completedSteps++;
    if (checklistProgress.removal_urls?.length > 0) completedSteps++;
    if (checklistProgress.selected_sites?.length > 0) completedSteps++;
    
    // Check final step based on has_address_alert flag
    if (checklistProgress.has_address_alert) {
      // For address alert users, check address fields
      if (checklistProgress.street_address && 
          checklistProgress.postal_code && 
          checklistProgress.city) {
        completedSteps++;
      }
    } else {
      // For identification users, check personal info
      if (checklistProgress.address && checklistProgress.personal_number) {
        completedSteps++;
      }
    }

    // Only count guides as complete if all selected guides are completed
    const allGuidesCompleted = checklistProgress.selected_sites?.every(
      site => checklistProgress.completed_guides?.includes(site)
    );

    console.log('Calculating progress:', {
      completedSteps,
      totalSteps,
      allGuidesCompleted,
      hasAddressAlert: checklistProgress.has_address_alert,
      progress: Math.round((completedSteps / totalSteps) * 100)
    });
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  return {
    checklistProgress,
    refetchProgress,
    handleStepComplete,
    calculateProgress
  };
};
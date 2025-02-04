
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useChecklistStatus = (userId: string | undefined) => {
  const [isChecklistCompleted, setIsChecklistCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkCompletionStatus = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching checklist status for user:', userId);
      
      // First check customer table for completion status
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('checklist_completed')
        .eq('id', userId)
        .maybeSingle();

      if (customerError) {
        console.error("Error fetching customer data:", customerError);
        return;
      }

      // If checklist is marked as completed in customers table, use that
      if (customerData?.checklist_completed) {
        console.log('Checklist marked as completed in customers table');
        setIsChecklistCompleted(true);
        setIsLoading(false);
        return;
      }

      // Check progress table for actual completion status
      const { data: checklistProgress, error: progressError } = await supabase
        .from('customer_checklist_progress')
        .select('*')
        .eq('customer_id', userId)
        .maybeSingle();

      if (progressError) {
        console.error("Error fetching checklist progress:", progressError);
        return;
      }

      // Check if all required steps are completed
      const isCompleted = Boolean(
        checklistProgress?.password_updated && 
        checklistProgress?.completed_at &&
        Array.isArray(checklistProgress?.selected_sites) && 
        checklistProgress?.selected_sites.length > 0 &&
        Array.isArray(checklistProgress?.removal_urls) && 
        (checklistProgress?.removal_urls.length > 0 || 
         checklistProgress?.removal_urls.includes('skipped')) &&
        checklistProgress?.street_address &&
        checklistProgress?.postal_code &&
        checklistProgress?.city
      );

      console.log('Checklist completion check:', { isCompleted, checklistProgress });

      setIsChecklistCompleted(isCompleted);
      setIsLoading(false);

      // Update customer record if completed
      if (isCompleted && !customerData?.checklist_completed) {
        const { error: updateError } = await supabase
          .from('customers')
          .update({ 
            checklist_completed: true,
            checklist_step: 4
          })
          .eq('id', userId);

        if (updateError) {
          console.error("Error updating checklist completion:", updateError);
        }
      }
    } catch (error) {
      console.error("Error checking checklist status:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkCompletionStatus();

    // Subscribe to realtime changes for the customers table
    const customersChannel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('Customers table changed:', payload);
          checkCompletionStatus();
        }
      )
      .subscribe();

    // Subscribe to realtime changes for the checklist_progress table
    const progressChannel = supabase
      .channel('progress-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customer_checklist_progress',
          filter: `customer_id=eq.${userId}`
        },
        (payload) => {
          console.log('Checklist progress changed:', payload);
          checkCompletionStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(customersChannel);
      supabase.removeChannel(progressChannel);
    };
  }, [userId]);

  return { isChecklistCompleted, isLoading };
};

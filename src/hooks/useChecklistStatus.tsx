
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useChecklistStatus = (userId: string | undefined) => {
  const [isChecklistCompleted, setIsChecklistCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

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
          if (mounted) {
            console.log('Checklist marked as completed in customers table');
            setIsChecklistCompleted(true);
            setIsLoading(false);
          }
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

        if (mounted) {
          setIsChecklistCompleted(isCompleted);
          setIsLoading(false);
        }

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
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkCompletionStatus();

    return () => {
      mounted = false;
    };
  }, [userId, toast]);

  return { isChecklistCompleted, isLoading };
};

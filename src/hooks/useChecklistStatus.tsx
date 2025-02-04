import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useChecklistStatus = (userId: string | undefined) => {
  const [isChecklistCompleted, setIsChecklistCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkCompletionStatus = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        // First check if customer has checklist_completed flag set
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('checklist_completed')
          .eq('id', userId)
          .single();

        if (customerError) {
          console.error("Error fetching customer data:", customerError);
          return;
        }

        // If checklist is already marked as completed, use that
        if (customerData?.checklist_completed) {
          if (mounted) {
            setIsChecklistCompleted(true);
            setIsLoading(false);
          }
          return;
        }

        // Otherwise check the actual completion status
        const { data: checklistProgress } = await supabase
          .from('customer_checklist_progress')
          .select('*')
          .eq('customer_id', userId)
          .single();

        const isCompleted = Boolean(
          checklistProgress?.completed_at && 
          checklistProgress?.password_updated && 
          (checklistProgress?.removal_urls?.length > 0 || checklistProgress?.removal_urls?.includes('skipped')) &&
          checklistProgress?.street_address &&
          checklistProgress?.postal_code &&
          checklistProgress?.city
        );

        // Update the checklist_completed flag if needed
        if (isCompleted && !customerData?.checklist_completed) {
          const { error: updateError } = await supabase
            .from('customers')
            .update({ checklist_completed: true })
            .eq('id', userId);

          if (updateError) {
            console.error("Error updating checklist completion:", updateError);
          }
        }

        if (mounted) {
          setIsChecklistCompleted(isCompleted);
          setIsLoading(false);
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
  }, [userId]);

  return { isChecklistCompleted, isLoading };
};

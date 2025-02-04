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
        
        // First check if customer has checklist_completed flag set
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('checklist_completed, checklist_step')
          .eq('id', userId)
          .maybeSingle();

        if (customerError) {
          console.error("Error fetching customer data:", customerError);
          toast({
            title: "Error",
            description: "Could not fetch checklist status. Please try again.",
            variant: "destructive",
          });
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
        const { data: checklistProgress, error: progressError } = await supabase
          .from('customer_checklist_progress')
          .select('*')
          .eq('customer_id', userId)
          .maybeSingle();

        if (progressError) {
          console.error("Error fetching checklist progress:", progressError);
          toast({
            title: "Error",
            description: "Could not fetch checklist progress. Please try again.",
            variant: "destructive",
          });
          return;
        }

        const isCompleted = Boolean(
          checklistProgress?.completed_at && 
          checklistProgress?.password_updated && 
          (checklistProgress?.removal_urls?.length > 0 || checklistProgress?.removal_urls?.includes('skipped')) &&
          checklistProgress?.street_address &&
          checklistProgress?.postal_code &&
          checklistProgress?.city
        );

        console.log('Checklist completion check:', {
          isCompleted,
          checklistProgress
        });

        // Update the checklist_completed flag if needed
        if (isCompleted && !customerData?.checklist_completed) {
          const { error: updateError } = await supabase
            .from('customers')
            .update({ checklist_completed: true })
            .eq('id', userId);

          if (updateError) {
            console.error("Error updating checklist completion:", updateError);
            toast({
              title: "Warning",
              description: "Could not update checklist status.",
              variant: "destructive",
            });
          }
        }

        if (mounted) {
          setIsChecklistCompleted(isCompleted);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking checklist status:", error);
        if (mounted) {
          toast({
            title: "Error",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
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

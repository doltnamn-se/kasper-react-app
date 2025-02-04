
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const useStepCompletion = () => {
  const navigate = useNavigate();

  const isChecklistCompleted = (progress: any) => {
    if (!progress) return false;
    
    // Check all required steps are completed using the same logic as useChecklistStatus
    const isPasswordUpdated = progress.password_updated;
    const hasSitesSelected = Array.isArray(progress.selected_sites) && progress.selected_sites.length > 0;
    const hasUrlsSubmitted = Array.isArray(progress.removal_urls) && 
      (progress.removal_urls.length > 0 || progress.removal_urls.includes('skipped'));
    const hasAddressInfo = progress.street_address && progress.postal_code && progress.city;

    return isPasswordUpdated && hasSitesSelected && hasUrlsSubmitted && hasAddressInfo;
  };

  useEffect(() => {
    const checkCompletion = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const { data: progress, error } = await supabase
          .from('customer_checklist_progress')
          .select('*')
          .eq('customer_id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking checklist completion:', error);
          return;
        }

        console.log('Checking checklist completion:', progress);

        if (isChecklistCompleted(progress)) {
          console.log('Checklist is completed');
        }
      } catch (error) {
        console.error('Error in checkCompletion:', error);
      }
    };

    checkCompletion();
  }, []); // Empty dependency array to run only once when component mounts

  const handleStepComplete = async () => {
    console.log('Step completed, checking overall completion');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;

    const { data: progress, error } = await supabase
      .from('customer_checklist_progress')
      .select('*')
      .eq('customer_id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking step completion:', error);
      return;
    }

    console.log('Current progress:', progress);
  };

  return { handleStepComplete };
};

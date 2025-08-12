
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface UseMemberStatusUpdatesReturn {
  updateMemberSiteStatus: (siteName: string, newStatus: string) => Promise<boolean>;
  isUpdating: boolean;
}

export const useMemberStatusUpdates = (
  customerId?: string,
  memberId?: string
): UseMemberStatusUpdatesReturn => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateMemberSiteStatus = async (siteName: string, newStatus: string): Promise<boolean> => {
    try {
      if (!customerId || !memberId) return false;
      setIsUpdating(true);

      // Check if existing
      const { data: existingStatus, error: queryError } = await supabase
        .from('customer_site_statuses')
        .select('id')
        .eq('customer_id', customerId)
        .eq('member_id', memberId)
        .eq('site_name', siteName)
        .maybeSingle();

      if (queryError) {
        console.error('Error querying existing member status:', queryError);
        toast({ title: t('error'), description: t('error.update.status'), variant: 'destructive' });
        return false;
      }

      let result;
      if (existingStatus) {
        result = await supabase
          .from('customer_site_statuses')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', existingStatus.id)
          .select();
      } else {
        result = await supabase
          .from('customer_site_statuses')
          .insert({ customer_id: customerId, member_id: memberId, site_name: siteName, status: newStatus })
          .select();
      }

      if (result.error || !result.data?.length) {
        console.error('Error updating member site status:', result.error);
        toast({ title: t('error'), description: t('error.update.status'), variant: 'destructive' });
        return false;
      }

      // Notify admin (best-effort)
      try {
        await supabase.functions.invoke('notify-status-change', {
          body: { siteName, newStatus, language, userId: customerId, memberId }
        });
      } catch (e) {
        // non-fatal
        console.warn('notify-status-change failed for member update');
      }

      return true;
    } catch (e) {
      console.error('Unexpected error updating member site status:', e);
      toast({ title: t('error'), description: t('error.unexpected'), variant: 'destructive' });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateMemberSiteStatus, isUpdating };
};

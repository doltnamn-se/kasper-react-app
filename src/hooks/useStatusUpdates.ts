
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface UseStatusUpdatesReturn {
  updateSiteStatus: (siteName: string, newStatus: string) => Promise<boolean>;
  isUpdating: boolean;
}

export const useStatusUpdates = (): UseStatusUpdatesReturn => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateSiteStatus = async (siteName: string, newStatus: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      console.log(`Starting updateSiteStatus for ${siteName} to ${newStatus}`);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error('No authenticated user found');
        toast({
          title: t('error'),
          description: t('error.authentication'),
          variant: "destructive",
        });
        return false;
      }

      const customerId = session.user.id;
      console.log(`Customer ID: ${customerId}`);
      
      // Check if there's an existing status entry
      const { data: existingStatus, error: queryError } = await supabase
        .from('customer_site_statuses')
        .select('id')
        .eq('customer_id', customerId)
        .eq('site_name', siteName)
        .maybeSingle();

      if (queryError) {
        console.error('Error querying existing status:', queryError);
        toast({
          title: t('error'),
          description: t('error.update.status'),
          variant: "destructive",
        });
        return false;
      }

      console.log('Existing status entry:', existingStatus);

      let result;
      
      if (existingStatus) {
        // Update existing status
        console.log(`Updating existing status entry for ${siteName} to ${newStatus}`);
        result = await supabase
          .from('customer_site_statuses')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStatus.id)
          .select();
      } else {
        // Create new status
        console.log(`Creating new status entry for ${siteName} with status ${newStatus}`);
        result = await supabase
          .from('customer_site_statuses')
          .insert({
            customer_id: customerId,
            site_name: siteName,
            status: newStatus
          })
          .select();
      }

      if (result.error) {
        console.error('Error updating site status:', result.error);
        
        // Detailed error handling for permissions
        if (result.error.code === '42501' || 
            result.error.message.includes('permission') || 
            result.error.code === 'PGRST116') {
          console.error('Permission denied when updating site status');
          toast({
            title: t('error'),
            description: t('error.permission'),
            variant: "destructive",
          });
          return false;
        }
        
        toast({
          title: t('error'),
          description: t('error.update.status'),
          variant: "destructive",
        });
        return false;
      }

      if (!result.data || result.data.length === 0) {
        console.error('No data returned from update operation');
        toast({
          title: t('error'),
          description: t('error.update.status'),
          variant: "destructive",
        });
        return false;
      }

      console.log('Status update successful:', result.data);
      
      // Call edge function to notify admin using REST API instead of direct database insertion
      try {
        console.log(`Calling edge function to notify admin about status change for ${siteName}`);
        
        const notificationData = {
          siteName: siteName,
          newStatus: newStatus,
          language: language,
          userId: customerId
        };
        
        const { data, error } = await supabase.functions.invoke('notify-status-change', {
          body: notificationData
        });
        
        if (error) {
          console.error('Failed to notify admin via edge function:', error);
          toast({
            title: t('warning'),
            description: t('warning.admin.notification'),
            variant: "default",  // Changed from "warning" to "default"
          });
          // Continue despite notification error - status update was successful
        } else {
          console.log('Successfully notified admin via edge function:', data);
        }
        
        return true;
      } catch (notifError) {
        console.error('Failed to call notify-status-change function:', notifError);
        toast({
          title: t('warning'),
          description: t('warning.admin.notification'),
          variant: "default",  // Changed from "warning" to "default"
        });
        // Still return true since the status update was successful
        return true;
      }
      
    } catch (error) {
      console.error('Unexpected error updating site status:', error);
      toast({
        title: t('error'),
        description: t('error.unexpected'),
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateSiteStatus, isUpdating };
};

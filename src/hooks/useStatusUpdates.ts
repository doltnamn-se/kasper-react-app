
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
          return false;
        }
        
        return false;
      }

      if (!result.data || result.data.length === 0) {
        console.error('No data returned from update operation');
        return false;
      }

      console.log('Status update successful:', result.data);
      
      // Notify admin about the status change - fixed implementation
      try {
        // Direct notification to super admin using the specific ID
        const superAdminId = 'a0e63991-d45b-43d4-a8fe-3ecda8c64e9d';
        console.log(`Creating notification for super admin with ID: ${superAdminId}`);
        
        const notificationTitle = language === 'sv' 
          ? 'Status uppdaterad av användare' 
          : 'Status updated by user';
          
        const notificationMessage = language === 'sv' 
          ? `${siteName} status har ändrats till "${newStatus}" av en användare` 
          : `${siteName} status has been changed to "${newStatus}" by a user`;
        
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: superAdminId,
            title: notificationTitle,
            message: notificationMessage,
            type: 'status_change'
          });
          
        if (notifError) {
          console.error(`Failed to notify admin ${superAdminId}:`, notifError);
        } else {
          console.log(`Successfully notified super admin about status change for ${siteName}`);
        }
        
        return true;
      } catch (notifError) {
        console.error('Failed to create admin notification:', notifError);
        // Still return true since the status update was successful
        return true;
      }
      
    } catch (error) {
      console.error('Unexpected error updating site status:', error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateSiteStatus, isUpdating };
};

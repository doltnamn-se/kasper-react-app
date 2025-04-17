
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
          description: 'You must be logged in to update status',
          variant: 'destructive'
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
          description: 'Failed to query existing status',
          variant: 'destructive'
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
            title: t('error.update.status'),
            description: 'Permission denied. You may not have rights to update status.',
            variant: 'destructive',
          });
          return false;
        }
        
        toast({
          title: t('error'),
          description: 'Failed to update site status',
          variant: 'destructive'
        });
        return false;
      }

      if (!result.data || result.data.length === 0) {
        console.error('No data returned from update operation');
        toast({
          title: t('error'),
          description: 'Update operation failed silently',
          variant: 'destructive'
        });
        return false;
      }

      console.log('Status update successful:', result.data);
      
      // Notify admins about the status change - improved implementation
      try {
        // First get super_admin users
        const { data: admins, error: adminError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'super_admin');
        
        if (adminError) {
          console.error('Error fetching admin users:', adminError);
        }
        
        if (admins && admins.length > 0) {
          console.log(`Found ${admins.length} admins to notify about status change`);
          
          // Create notification for each admin
          for (const admin of admins) {
            const notificationTitle = language === 'sv' 
              ? 'Status uppdaterad av användare' 
              : 'Status updated by user';
              
            const notificationMessage = language === 'sv' 
              ? `${siteName} status har ändrats till "${newStatus}" av en användare` 
              : `${siteName} status has been changed to "${newStatus}" by a user`;
            
            const { error: notifError } = await supabase
              .from('notifications')
              .insert({
                user_id: admin.id,
                title: notificationTitle,
                message: notificationMessage,
                type: 'status_change'
              });
              
            if (notifError) {
              console.error(`Failed to notify admin ${admin.id}:`, notifError);
            } else {
              console.log(`Successfully notified admin ${admin.id} about status change`);
            }
          }
        } else {
          console.log('No admins found to notify about status change');
        }
        
        return true;
      } catch (notifError) {
        console.error('Failed to create admin notifications:', notifError);
        // Still return true since the status update was successful
        return true;
      }
      
    } catch (error) {
      console.error('Unexpected error updating site status:', error);
      toast({
        title: t('error'),
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateSiteStatus, isUpdating };
};

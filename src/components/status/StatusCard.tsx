
import React from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatusTable } from "./StatusTable";
import { useGuideService } from "@/services/guideService";
import { supabase } from "@/integrations/supabase/client";
import { useUrlNotifications } from "@/components/deindexing/hooks/useUrlNotifications";
import { useToast } from "@/hooks/use-toast";

interface SiteStatus {
  site_name: string;
  status: string;
}

interface StatusCardProps {
  siteStatuses: SiteStatus[];
  isLoading: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({ 
  siteStatuses,
  isLoading
}) => {
  const { language, t } = useLanguage();
  const { getGuideForSite } = useGuideService();
  const { createStatusNotification } = useUrlNotifications();
  const { toast } = useToast();

  const sites = [
    { name: 'Mrkoll', icon: '/lovable-uploads/logo-icon-mrkoll.webp' },
    { name: 'Ratsit', icon: '/lovable-uploads/logo-icon-ratsit.webp' },
    { name: 'Hitta', icon: '/lovable-uploads/logo-icon-hittase.webp' },
    { name: 'Merinfo', icon: '/lovable-uploads/logo-icon-merinfo.webp' },
    { name: 'Eniro', icon: '/lovable-uploads/logo-icon-eniro.webp' },
    { name: 'Birthday', icon: '/lovable-uploads/logo-icon-birthdayse.webp' },
  ];

  const updateSiteStatus = async (siteName: string, newStatus: string) => {
    try {
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
      
      // Notify admins about the status change
      try {
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'super_admin');
        
        if (admins && admins.length > 0) {
          const adminId = admins[0].id;
          const notificationTitle = language === 'sv' 
            ? 'Status uppdaterad av användare' 
            : 'Status updated by user';
          const notificationMessage = language === 'sv' 
            ? `${siteName} status har ändrats till "${newStatus}" av en användare` 
            : `${siteName} status has been changed to "${newStatus}" by a user`;
          
          await supabase
            .from('notifications')
            .insert({
              user_id: adminId,
              title: notificationTitle,
              message: notificationMessage,
              type: 'status_change'
            });
        }
        
        toast({
          title: language === 'sv' ? 'Status uppdaterad' : 'Status updated',
          description: language === 'sv' 
            ? `${siteName} status har ändrats till "${newStatus}"` 
            : `${siteName} status has been changed to "${newStatus}"`,
        });
        
        return true;
      } catch (notifError) {
        console.error('Failed to create admin notification:', notifError);
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
    }
  };

  const handleRemoveSite = async (siteName: string) => {
    console.log(`Handling remove for site: ${siteName}`);
    
    // Get the guide URL and open it in a new tab
    const guide = getGuideForSite(siteName.toLowerCase());
    if (!guide?.steps[0]?.text) {
      console.warn('No guide found for site:', siteName);
      return;
    }
    
    // Update status BEFORE opening the window
    const success = await updateSiteStatus(siteName, 'Granskar');
    console.log(`Status update for ${siteName} success:`, success);
    
    if (success) {
      // Only open the guide if the status update was successful
      window.open(guide.steps[0].text, '_blank');
      
      // Show confirmation toast
      toast({
        title: language === 'sv' ? 'Guide öppnad' : 'Guide opened',
        description: language === 'sv' 
          ? `${siteName} guiden har öppnats i en ny flik` 
          : `${siteName} guide has been opened in a new tab`,
      });
    } else {
      console.error('Failed to update status before opening guide');
    }
  };

  return (
    <Card className="bg-white dark:bg-[#1c1c1e] p-4 md:p-6 rounded-[4px] shadow-sm border border-[#e5e7eb] dark:border-[#232325] transition-colors duration-200">
      <div>
        <h2 className="text-lg font-semibold">
          {language === 'sv' ? 'Status' : 'Status'}
        </h2>
        <p className="text-[#000000A6] dark:text-[#FFFFFFA6] font-medium text-sm mb-6 md:mb-10">
          {language === 'sv' ? 'Din synlighet på upplysningssidor' : 'Your visibility on search sites'}
        </p>
      </div>
      <div className="mt-2">
        <StatusTable 
          siteStatuses={siteStatuses} 
          sites={sites} 
          onRemoveSite={handleRemoveSite} 
        />
      </div>
    </Card>
  );
};

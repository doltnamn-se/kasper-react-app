
import React from "react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatusTable } from "./StatusTable";
import { useGuideService } from "@/services/guideService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useUrlNotifications } from "@/components/deindexing/hooks/useUrlNotifications";

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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({ 
          title: t('error'),
          description: t('error.generic'),
          variant: "destructive"
        });
        return;
      }

      const customerId = session.user.id;
      
      // Check if there's an existing status entry
      const { data: existingStatus } = await supabase
        .from('customer_site_statuses')
        .select('id')
        .eq('customer_id', customerId)
        .eq('site_name', siteName)
        .maybeSingle();

      if (existingStatus) {
        // Update existing status
        const { error } = await supabase
          .from('customer_site_statuses')
          .update({ status: newStatus })
          .eq('id', existingStatus.id);

        if (error) throw error;
      } else {
        // Create new status
        const { error } = await supabase
          .from('customer_site_statuses')
          .insert({
            customer_id: customerId,
            site_name: siteName,
            status: newStatus
          });

        if (error) throw error;
      }

      // Create notification for admin
      try {
        // Fetch all admin users
        const { data: admins } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'super_admin');
        
        if (admins && admins.length > 0) {
          const adminId = admins[0].id;
          const notificationTitle = language === 'sv' ? 
            'Status uppdaterad av användare' : 
            'Status updated by user';
          const notificationMessage = language === 'sv' ? 
            `${siteName} status har ändrats till "Granskar" av en användare` : 
            `${siteName} status has been changed to "Reviewing" by a user`;
          
          await supabase
            .from('notifications')
            .insert({
              user_id: adminId,
              title: notificationTitle,
              message: notificationMessage,
              type: 'status_change',
              read: false
            });
        }
      } catch (notifError) {
        console.error('Failed to create admin notification:', notifError);
      }
      
    } catch (error) {
      console.error('Error updating site status:', error);
      toast({
        title: t('error'),
        description: t('error.update.status'),
        variant: "destructive"
      });
    }
  };

  const handleRemoveSite = async (siteName: string) => {
    // Get the guide URL and open it in a new tab
    const guide = getGuideForSite(siteName.toLowerCase());
    if (guide?.steps[0]?.text) {
      window.open(guide.steps[0].text, '_blank');
    }
    
    // Update the status from "Synlig" to "Granskar"
    await updateSiteStatus(siteName, 'Granskar');
    
    // Show success toast
    toast({
      title: language === 'sv' ? 'Status uppdaterad' : 'Status updated',
      description: language === 'sv' ? 
        `${siteName} status har ändrats till "Granskar"` : 
        `${siteName} status has been changed to "Reviewing"`
    });
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

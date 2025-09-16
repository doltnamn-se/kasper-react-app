
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from '@/hooks/useUserProfile';
import { useMonitoringUrls } from './useMonitoringUrls';
import { useCustomerMembers } from '@/hooks/useCustomerMembers';

export const useUserMonitoring = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { userProfile } = useUserProfile();
  const { members } = useCustomerMembers();
  const [userId, setUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    fetchUserId();
  }, []);
  
  // Get monitoring URLs for the user
  const { 
    monitoringUrls, 
    handleUpdateStatus 
  } = useMonitoringUrls(userId || undefined);

  // Filter to get only pending URLs
  const pendingUrls = monitoringUrls.filter(url => url.status === 'pending');

  const handleApproveUrl = async (urlId: string) => {
    try {
      setIsProcessing(true);
      console.log(`Approving URL ${urlId}`);
      await handleUpdateStatus(urlId, 'approved');
    } catch (error) {
      console.error("Error approving URL:", error);
      toast({
        title: t('error'),
        description: t('monitoring.url.error.approve'),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectUrl = async (urlId: string) => {
    try {
      setIsProcessing(true);
      console.log(`Rejecting URL ${urlId}`);
      await handleUpdateStatus(urlId, 'rejected');

      // Safety: mark all monitoring notifications as read for this user
      if (userId) {
        const { error: markReadError } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', userId)
          .eq('type', 'monitoring')
          .eq('read', false);
        if (markReadError) {
          console.error('Error marking monitoring notifications as read:', markReadError);
        } else {
          console.log('Marked all monitoring notifications as read after rejection');
        }
      }
    } catch (error) {
      console.error("Error rejecting URL:", error);
      toast({
        title: t('error'),
        description: t('monitoring.url.error.reject'),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate display name based on subscription plan and members
  const getDisplayName = () => {
    const mainUserName = userProfile?.display_name || '';
    const subscriptionPlan = userProfile?.subscription_plan;
    
    // Check if user has parskydd or familjeskydd and has members
    if ((subscriptionPlan?.includes('parskydd') || subscriptionPlan?.includes('familjeskydd')) && members.length > 0) {
      const allNames = [mainUserName, ...members.map(member => member.display_name)].filter(Boolean);
      
      if (allNames.length > 1) {
        // Join names with "och" for the last name in Swedish
        const firstNames = allNames.slice(0, -1);
        const lastName = allNames[allNames.length - 1];
        return firstNames.join(', ') + ' och ' + lastName;
      }
    }
    
    return mainUserName;
  };
  
  const displayName = getDisplayName();
  const firstNameOnly = displayName.split(' ')[0];

  return {
    userId,
    pendingUrls,
    isProcessing,
    handleApproveUrl,
    handleRejectUrl,
    displayName,
    firstNameOnly
  };
};

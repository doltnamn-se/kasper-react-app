
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { MonitoringPanel } from "@/components/monitoring/MonitoringPanel";
import { useScanningStatus } from "@/components/monitoring/hooks/useScanningStatus";
import { useUserMonitoring } from "@/components/monitoring/hooks/useUserMonitoring";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserMonitoringUrlList } from "@/components/monitoring/UserMonitoringUrlList";
import { pushNotificationService } from "@/services/pushNotificationService";
import { isNativePlatform } from "@/capacitor";

const Monitoring = () => {
  const { language } = useLanguage();
  const { lastChecked, isScanning, dots } = useScanningStatus();
  const { 
    userId, 
    pendingUrls, 
    handleApproveUrl, 
    handleRejectUrl, 
    displayName 
  } = useUserMonitoring();
  const isMobile = useIsMobile();

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Bevakning | Kasper" : 
      "Monitoring | Kasper";
  }, [language]);

  // Initialize push notifications if on a native platform
  useEffect(() => {
    const initPushNotifications = async () => {
      if (isNativePlatform()) {
        console.log('Initializing push notifications from Monitoring page');
        await pushNotificationService.register();
      }
    };

    initPushNotifications();
  }, []);

  // Add effect to mark monitoring notifications as read when the page is visited
  useEffect(() => {
    const markMonitoringNotificationsAsRead = async () => {
      if (!userId) return;
      
      try {
        console.log('Marking monitoring notifications as read');
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', userId)
          .eq('type', 'monitoring')
          .eq('read', false);

        if (error) {
          console.error('Error marking monitoring notifications as read:', error);
        } else {
          console.log('Successfully marked monitoring notifications as read');
        }
      } catch (err) {
        console.error('Exception when marking notifications as read:', err);
      }
    };

    markMonitoringNotificationsAsRead();
  }, [userId]);

  return (
    <MainLayout>
      <div className={`space-y-8 ${isMobile ? '' : ''}`}>
        <h1 className="mb-6">
          {language === 'sv' ? 'Bevakning' : 'Monitoring'}
        </h1>

        <MonitoringPanel
          lastChecked={lastChecked}
          isScanning={isScanning}
          dots={dots}
          displayName={displayName}
          pendingUrls={pendingUrls}
          onApprove={handleApproveUrl}
          onReject={handleRejectUrl}
          userId={userId}
        />
        
        {/* Render the links to review in a separate card */}
        {userId && pendingUrls.length > 0 && (
          <UserMonitoringUrlList
            monitoringUrls={pendingUrls}
            onApprove={handleApproveUrl}
            onReject={handleRejectUrl}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Monitoring;

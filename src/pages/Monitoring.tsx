
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import { MonitoringPanel } from "@/components/monitoring/MonitoringPanel";
import { useScanningStatus } from "@/components/monitoring/hooks/useScanningStatus";
import { useUserMonitoring } from "@/components/monitoring/hooks/useUserMonitoring";

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

  useEffect(() => {
    document.title = language === 'sv' ? 
      "Bevakning | Digitaltskydd.se" : 
      "Monitoring | Digitaltskydd.se";
  }, [language]);

  return (
    <MainLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold tracking-[-.416px] text-[#000000] dark:text-white mb-6">
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
      </div>
    </MainLayout>
  );
};

export default Monitoring;
